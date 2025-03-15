import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { PartyGame } from '../components/PartyGame/PartyGame';
import { generateRoomId } from '../utils/generateRoomId';
import { RoomLink } from '../components/RoomLink/RoomLink';

type NicknameModalProps = {
  onSubmit: (nickname: string) => void;
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

const NicknameModal = ({ onSubmit, isJoining }: NicknameModalProps) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (nickname.length < 2) {
      setError('Nickname must be at least 2 characters long');
      return;
    }
    onSubmit(nickname);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-gray-800 p-6 rounded-lg w-96'>
        <h3 className='text-xl font-bold mb-4'>
          {isJoining ? 'Enter nickname to join' : 'Enter your nickname'}
        </h3>
        <div className='space-y-4'>
          <input
            type='text'
            className='w-full px-4 py-2 bg-gray-700 rounded-lg text-white'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && nickname) {
                handleSubmit();
              }
            }}
            placeholder='Your nickname'
            minLength={2}
            maxLength={20}
          />
          {error && <p className='text-red-500 text-sm'>{error}</p>}
          <button
            className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            onClick={handleSubmit}
          >
            {isJoining ? 'Join Game' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PartyBus = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
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
          }
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
          (payload) => {
            // Check if game has started
            if (payload.new && payload.new.game_started) {
              setGameStarted(true);
            }
          }
        )
        .subscribe();

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

      return () => {
        supabase.removeChannel(playersChannel);
        supabase.removeChannel(gameStatusChannel);
      };
    }
  }, [roomId]);

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

  const createRoom = async (nickname: string) => {
    try {
      // Generate a friendly room code
      const newRoomCode = generateRoomId();

      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('party_bus_rooms')
        .insert({
          room_code: newRoomCode,
          host_nickname: nickname,
          game_started: false,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add the host as first player
      const { error: playerError } = await supabase
        .from('party_bus_players')
        .insert({
          room_id: room.id,
          nickname: nickname,
          game_state: {
            cards: [],
            currentRound: 1,
            hasWon: false,
            isGameOver: false,
            timesRedrawn: 0,
            nickname: nickname,
          } as GameState,
        });

      if (playerError) throw playerError;

      setNickname(nickname);
      setIsHost(true);
      setShowNicknamePrompt(false);
      setRoomId(room.id);
      navigate(`/party-bus/${newRoomCode}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    }
  };

  const joinRoom = async (nickname: string) => {
    if (!roomCode) return;

    try {
      // Check if room exists using room_code
      const { data: room, error: roomError } = await supabase
        .from('party_bus_rooms')
        .select('id, room_code, host_nickname')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !room) {
        setError('Room not found. Please check the room code.');
        return;
      }

      // Check if nickname is already taken in this room
      const { data: existingPlayers, error: playerError } = await supabase
        .from('party_bus_players')
        .select('nickname')
        .eq('room_id', room.id)
        .eq('nickname', nickname);

      if (playerError) {
        setError('Error checking nickname availability.');
        return;
      }

      if (existingPlayers && existingPlayers.length > 0) {
        setError('Nickname already taken in this room. Please choose another.');
        return;
      }

      // Add player to room
      const { error: joinError } = await supabase
        .from('party_bus_players')
        .insert({
          room_id: room.id,
          nickname: nickname,
          game_state: {
            cards: [],
            currentRound: 1,
            hasWon: false,
            isGameOver: false,
            timesRedrawn: 0,
            nickname: nickname,
          } as GameState,
        });

      if (joinError) throw joinError;

      setNickname(nickname);
      setShowNicknamePrompt(false);
      setRoomId(room.id);
      setIsHost(room.host_nickname === nickname);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    }
  };

  const handleNicknameSubmit = async (name: string) => {
    if (roomCode) {
      await joinRoom(name);
    } else {
      await createRoom(name);
    }
  };

  const startGame = async () => {
    if (!roomId) return;

    try {
      const { error: updateError } = await supabase
        .from('party_bus_rooms')
        .update({ game_started: true })
        .eq('id', roomId);

      if (updateError) throw updateError;

      setGameStarted(true);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    }
  };

  return (
    <div className='container mx-auto px-4'>
      <h1 className='text-4xl md:text-5xl font-bold leading-tight mb-2'>
        Ride The Party Bus
      </h1>
      <h4 className='text-xl md:text-2xl italic mt-0 mb-6'>
        The best single-player drinking game, now with friends!
      </h4>

      {showNicknamePrompt && (
        <NicknameModal onSubmit={handleNicknameSubmit} isJoining={!!roomCode} />
      )}

      {!showNicknamePrompt && !gameStarted && (
        <div className='mt-8 p-6 bg-gray-800 rounded-lg'>
          <h2 className='text-2xl font-bold mb-4'>Game Lobby</h2>

          {roomCode && (
            <div className='mb-6'>
              <RoomLink roomId={roomCode} />
            </div>
          )}

          <div className='mb-6'>
            <h3 className='text-xl font-bold mb-2'>Players</h3>
            <div className='grid grid-cols-2 gap-4'>
              {players.map((player) => (
                <div
                  key={player.nickname}
                  className='p-3 bg-gray-700 rounded-lg flex items-center justify-between'
                >
                  <span>{player.nickname}</span>
                  {player.nickname === nickname && (
                    <span className='text-green-400'>(You)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <button
              className='py-2 px-4 text-lg font-bold rounded-lg cursor-pointer bg-purple-500 text-white shadow-md'
              onClick={startGame}
            >
              Start Game
            </button>
          )}
        </div>
      )}

      {!showNicknamePrompt && gameStarted && roomId && nickname && (
        <PartyGame roomId={roomId} nickname={nickname} />
      )}

      {error && (
        <div className='mt-4 p-4 bg-red-500 bg-opacity-20 rounded-lg text-red-100'>
          {error}
        </div>
      )}
    </div>
  );
};
