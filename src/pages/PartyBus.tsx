import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import supabase from '../utils/supabase';
import { PartyGame } from '../components/PartyGame/PartyGame';
import { generateRoomId } from '../utils/generateRoomId';
import { RoomLink } from '../components/RoomLink/RoomLink';
import { Database } from '../types/database.types.ts';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type NicknameModalProps = {
  onSubmit: (nickname: string) => Promise<string | undefined>;
  isJoining?: boolean;
};

type Player = {
  nickname: string;
};

type GameState = {
  cards: never[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

type RoomPayload = RealtimePostgresChangesPayload<
  Database['public']['Tables']['party_bus_rooms']['Row']
>;

const NicknameModal = ({ onSubmit, isJoining }: NicknameModalProps) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (nickname.length < 2) {
      setError('Nickname must be at least 2 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const error = await onSubmit(nickname);
      if (error) {
        setError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
      <div className="w-96 rounded-lg bg-gray-800 p-6">
        <h3 className="mb-4 text-xl font-bold">
          {isJoining ? 'Enter nickname to join' : 'Enter your nickname'}
        </h3>
        <div className="flex flex-col gap-4 space-y-4">
          <input
            type="text"
            className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError(''); // Clear error when user types
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nickname && !isSubmitting) {
                handleSubmit();
              }
            }}
            placeholder="Your nickname"
            minLength={2}
            maxLength={20}
            disabled={isSubmitting}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : isJoining ? 'Join Game' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PartyBus = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams({ strict: false }) as { roomCode?: string };
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showDancingUzbek, setShowDancingUzbek] = useState(false);

  // Track konami code progress
  const konamiCode = useRef([
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ]);
  const konamiProgress = useRef<string[]>([]);

  // Handle keydown events for Konami code
  useEffect(() => {
    if (!isHost || gameStarted || showNicknamePrompt) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const expectedKey = konamiCode.current[konamiProgress.current.length].toLowerCase();

      if (key === expectedKey) {
        konamiProgress.current.push(key);

        // Check if code is complete
        if (konamiProgress.current.length === konamiCode.current.length) {
          // Broadcast dancing Uzbek man to all players by updating room state
          if (roomId) {
            const update: Database['public']['Tables']['party_bus_rooms']['Update'] = {
              show_dancing_uzbek: true,
            };
            await supabase.from('party_bus_rooms').update(update).eq('id', roomId);
          }
          konamiProgress.current = []; // Reset progress
        }
      } else {
        konamiProgress.current = []; // Reset progress on wrong key
        if (key === konamiCode.current[0].toLowerCase()) {
          konamiProgress.current.push(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHost, gameStarted, showNicknamePrompt, roomId]);

  // Track presence channel reference for cleanup
  const presenceRef = useRef<ReturnType<typeof supabase.channel>>();

  useEffect(() => {
    if (roomId && nickname) {
      // Subscribe to room updates
      const playersChannel = supabase
        .channel(`room-players:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'party_bus_players',
            filter: `room_id=eq.${roomId}`,
          },
          () => {
            // Refresh players list
            fetchPlayers();
          },
        )
        .subscribe();

      // Subscribe to game status updates
      const gameStatusChannel = supabase
        .channel(`room-status:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'party_bus_rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload: RoomPayload) => {
            // Check if game has started and payload has new data
            if (payload.new && 'game_started' in payload.new) {
              setGameStarted(payload.new.game_started);
            }
            // Check if dancing Uzbek man should be shown
            if (payload.new && 'show_dancing_uzbek' in payload.new) {
              setShowDancingUzbek(payload.new.show_dancing_uzbek);
            }
          },
        )
        .subscribe();

      // Set up presence tracking
      const presenceChannel = supabase.channel(`presence:${roomId}`, {
        config: {
          presence: {
            key: nickname,
          },
        },
      });

      let presenceTimeout: number;

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const presentPlayers = Object.keys(state);

          // Clear any pending timeout
          if (presenceTimeout) {
            window.clearTimeout(presenceTimeout);
          }

          // Set a small timeout to allow for brief disconnections
          presenceTimeout = window.setTimeout(async () => {
            // Get current players from database
            const { data: currentPlayers } = await supabase
              .from('party_bus_players')
              .select('nickname')
              .eq('room_id', roomId);

            if (currentPlayers) {
              // Remove players that are in database but not in presence
              currentPlayers.forEach(async (player) => {
                if (!presentPlayers.includes(player.nickname)) {
                  await removePlayer(player.nickname);
                }
              });
            }
          }, 2000); // 2 second grace period for reconnection
        })
        .on('presence', { event: 'join' }, ({ key }: { key: string }) => {
          console.log('Player joined:', key);
          fetchPlayers();
        })
        .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
          console.log('Player left:', key);
          removePlayer(key);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track this player's presence
            await presenceChannel.track({
              online_at: new Date().toISOString(),
            });
          }
        });

      // Store presence channel reference for cleanup
      presenceRef.current = presenceChannel;

      // Initial players fetch
      fetchPlayers();

      // Initial game status fetch
      supabase
        .from('party_bus_rooms')
        .select('game_started')
        .eq('id', roomId)
        .single()
        .then(({ data }) => {
          if (data && data.game_started) {
            setGameStarted(true);
          }
        });

      // Set up cleanup when player leaves/closes window
      const handleBeforeUnload = () => {
        if (nickname && roomId) {
          // Synchronous cleanup to ensure it runs before window closes
          const cleanup = new XMLHttpRequest();
          cleanup.open(
            'DELETE',
            `${
              import.meta.env.VITE_SUPABASE_DATABASE_URL
            }/rest/v1/party_bus_players?room_id=eq.${roomId}&nickname=eq.${encodeURIComponent(nickname)}`,
            false,
          );
          cleanup.setRequestHeader('Content-Type', 'application/json');
          cleanup.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
          cleanup.send();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        if (presenceTimeout) {
          window.clearTimeout(presenceTimeout);
        }

        // Leave presence channel
        if (presenceRef.current) {
          presenceRef.current.untrack();
        }

        supabase.removeChannel(playersChannel);
        supabase.removeChannel(gameStatusChannel);
        if (presenceRef.current) {
          supabase.removeChannel(presenceRef.current);
        }
        window.removeEventListener('beforeunload', handleBeforeUnload);

        // Clean up this player when component unmounts
        if (nickname) {
          removePlayer(nickname);
        }
      };
    }
  }, [roomId, nickname]);

  const removePlayer = async (playerNickname: string) => {
    if (!roomId) return;

    try {
      // First check if player still exists to avoid race conditions
      const { data: existingPlayer } = await supabase
        .from('party_bus_players')
        .select('nickname')
        .eq('room_id', roomId)
        .eq('nickname', playerNickname)
        .single();

      if (!existingPlayer) return; // Player already removed

      await supabase
        .from('party_bus_players')
        .delete()
        .eq('room_id', roomId)
        .eq('nickname', playerNickname);

      // If this was the host, delete the room
      if (isHost && playerNickname === nickname) {
        await supabase.from('party_bus_rooms').delete().eq('id', roomId);
      }

      // Refresh player list for everyone
      fetchPlayers();
    } catch (err) {
      console.error('Error removing player:', err);
    }
  };

  const fetchPlayers = async () => {
    if (!roomId) return;

    const { data } = await supabase
      .from('party_bus_players')
      .select('nickname')
      .eq('room_id', roomId);

    if (data) {
      setPlayers(data);
    }
  };

  const handleNicknameSubmit = async (name: string): Promise<string | undefined> => {
    setError('');

    if (roomCode) {
      try {
        // Check if room exists using room_code
        const { data: room, error: roomError } = await supabase
          .from('party_bus_rooms')
          .select('id, room_code, host_nickname')
          .eq('room_code', roomCode)
          .single();

        if (roomError || !room) {
          return 'Room not found. Please check the room code.';
        }

        // Check if nickname is already taken in this room
        const { data: existingPlayers, error: playerError } = await supabase
          .from('party_bus_players')
          .select('nickname')
          .eq('room_id', room.id)
          .eq('nickname', name);

        if (playerError) {
          return 'Error checking nickname availability.';
        }

        if (existingPlayers && existingPlayers.length > 0) {
          return 'Nickname already taken in this room. Please choose another.';
        }

        // Add player to room
        const { error: joinError } = await supabase.from('party_bus_players').insert({
          room_id: room.id,
          nickname: name,
          game_state: {
            cards: [],
            currentRound: 1,
            hasWon: false,
            isGameOver: false,
            timesRedrawn: 0,
            nickname: name,
          } as GameState,
        });

        if (joinError) {
          return 'Failed to join room. Please try again.';
        }

        setNickname(name);
        setShowNicknamePrompt(false);
        setRoomId(room.id);
        setIsHost(room.host_nickname === name);
        return undefined;
      } catch (err) {
        console.error('Error joining room:', err);
        return 'Failed to join room. Please try again.';
      }
    } else {
      try {
        // Generate a friendly room code
        const newRoomCode = generateRoomId();

        // Create the room
        const { data: room, error: roomError } = await supabase
          .from('party_bus_rooms')
          .insert({
            room_code: newRoomCode,
            host_nickname: name,
            game_started: false,
          })
          .select()
          .single();

        if (roomError) {
          return 'Failed to create room. Please try again.';
        }

        // Add the host as first player
        const { error: playerError } = await supabase.from('party_bus_players').insert({
          room_id: room.id,
          nickname: name,
          game_state: {
            cards: [],
            currentRound: 1,
            hasWon: false,
            isGameOver: false,
            timesRedrawn: 0,
            nickname: name,
          } as GameState,
        });

        if (playerError) {
          return 'Failed to create room. Please try again.';
        }

        setNickname(name);
        setIsHost(true);
        setShowNicknamePrompt(false);
        setRoomId(room.id);
        navigate({ to: '/party-bus/$roomCode', params: { roomCode: newRoomCode } });
        return undefined;
      } catch (err) {
        console.error('Error creating room:', err);
        return 'Failed to create room. Please try again.';
      }
    }
  };

  const startGame = async () => {
    if (!roomId) return;

    try {
      const update: Database['public']['Tables']['party_bus_rooms']['Update'] = {
        game_started: true,
        show_dancing_uzbek: false,
      };
      const { error: updateError } = await supabase
        .from('party_bus_rooms')
        .update(update)
        .eq('id', roomId);

      if (updateError) throw updateError;

      setGameStarted(true);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-2 text-4xl leading-tight font-bold md:text-5xl">Ride The Party Bus</h1>
      <h4 className="mt-0 mb-6 text-xl italic md:text-2xl">
        The best single-player drinking game, now with friends!
      </h4>

      {showNicknamePrompt && (
        <NicknameModal onSubmit={handleNicknameSubmit} isJoining={!!roomCode} />
      )}

      {!showNicknamePrompt && !gameStarted && (
        <div className="relative mt-8 rounded-lg bg-gray-800 p-6">
          <div className="bg-opacity-20 mb-6 rounded-lg border border-yellow-500 bg-yellow-300 p-4">
            <p className="mb-1 font-bold text-black">🚧 BETA WARNING! 🚧</p>
            <p className="text-balance text-black">
              This feature is still in beta. If it breaks, it&apos;s your fault.
              <br />
              Have fun out there!
            </p>
          </div>

          <h2 className="mb-4 text-2xl font-bold">Game Lobby</h2>

          {roomCode && (
            <div className="mb-6">
              <RoomLink roomId={roomCode} />
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-bold">Players</h3>
            <div className="grid grid-cols-2 gap-4">
              {players.map((player) => (
                <div
                  key={player.nickname}
                  className="flex items-center justify-between rounded-lg bg-gray-700 p-3"
                >
                  <span>{player.nickname}</span>
                  {player.nickname === nickname && <span className="text-green-400">(You)</span>}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <button
              className="cursor-pointer rounded-lg bg-purple-500 px-4 py-2 text-lg font-bold text-white shadow-md"
              onClick={startGame}
            >
              Start Game
            </button>
          )}

          {/* Dancing Uzbek Man Easter Egg */}
          {showDancingUzbek && (
            <div className="bg-opacity-80 absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="mb-4 animate-bounce text-6xl">🕺</div>
                <div className="animate-pulse text-2xl font-bold text-yellow-400">
                  VERY NICE! GREAT SUCCESS!
                </div>
                {isHost && (
                  <button
                    className="mt-4 rounded-lg bg-purple-500 px-4 py-2 text-white"
                    onClick={async () => {
                      if (roomId) {
                        const update: Database['public']['Tables']['party_bus_rooms']['Update'] = {
                          show_dancing_uzbek: false,
                        };
                        await supabase.from('party_bus_rooms').update(update).eq('id', roomId);
                      }
                    }}
                  >
                    High Five! ✋
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!showNicknamePrompt && gameStarted && roomId && nickname && (
        <PartyGame roomId={roomId} nickname={nickname} />
      )}

      {error && (
        <div className="bg-opacity-20 mt-4 rounded-lg bg-red-500 p-4 text-red-100">{error}</div>
      )}
    </div>
  );
};
