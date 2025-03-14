import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { PartyGame } from '../components/PartyGame/PartyGame';
import { Database } from '../../database.types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type NicknameModalProps = {
  onSubmit: (nickname: string) => void;
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

type RealtimeRoomPayload = RealtimePostgresChangesPayload<
  Database['public']['Tables']['party_bus_rooms']['Row']
>;

const NicknameModal = ({ onSubmit }: NicknameModalProps) => {
  const [nickname, setNickname] = useState('');

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-gray-800 p-6 rounded-lg'>
        <h3 className='text-xl font-bold mb-4'>Enter your nickname</h3>
        <input
          type='text'
          className='border p-2 rounded bg-gray-700 text-white'
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && nickname) {
              onSubmit(nickname);
            }
          }}
          placeholder='Your nickname'
        />
        <button
          className='ml-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-400'
          onClick={() => nickname && onSubmit(nickname)}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export const PartyBus = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

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

      // Subscribe to room status updates
      const roomChannel = supabase
        .channel(`room-status:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'party_bus_rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload: RealtimeRoomPayload) => {
            const newRoom =
              payload.new as Database['public']['Tables']['party_bus_rooms']['Row'];
            if (newRoom && newRoom.status === 'in_progress') {
              setGameStarted(true);
            }
          }
        )
        .subscribe();

      // Initial players fetch
      fetchPlayers();

      // Initial room status fetch
      supabase
        .from('party_bus_rooms')
        .select()
        .eq('id', roomId)
        .single()
        .then(({ data }) => {
          const room =
            data as Database['public']['Tables']['party_bus_rooms']['Row'];
          if (room && room.status === 'in_progress') {
            setGameStarted(true);
          }
        });

      return () => {
        supabase.removeChannel(playersChannel);
        supabase.removeChannel(roomChannel);
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

  const createRoom = async () => {
    if (!nickname) return;

    const { data, error } = await supabase
      .from('party_bus_rooms')
      .insert<Database['public']['Tables']['party_bus_rooms']['Insert']>([
        {
          host_nickname: nickname,
          status: 'waiting',
        },
      ])
      .select()
      .single();

    if (data) {
      setRoomId(data.id);
      setIsHost(true);
      // Also join as a player
      await supabase
        .from('party_bus_players')
        .insert<Database['public']['Tables']['party_bus_players']['Insert']>([
          {
            room_id: data.id,
            nickname: nickname,
            game_state: {
              cards: [],
              currentRound: 1,
              hasWon: false,
              isGameOver: false,
              timesRedrawn: -1,
            } as GameState,
          },
        ]);
    }
  };

  const joinRoom = async (roomIdToJoin: string) => {
    if (!nickname) return;

    const { data: room } = await supabase
      .from('party_bus_rooms')
      .select()
      .eq('id', roomIdToJoin)
      .single();

    const typedRoom =
      room as Database['public']['Tables']['party_bus_rooms']['Row'];
    if (typedRoom && typedRoom.status === 'waiting') {
      await supabase
        .from('party_bus_players')
        .insert<Database['public']['Tables']['party_bus_players']['Insert']>([
          {
            room_id: roomIdToJoin,
            nickname: nickname,
            game_state: {
              cards: [],
              currentRound: 1,
              hasWon: false,
              isGameOver: false,
              timesRedrawn: -1,
            } as GameState,
          },
        ]);
      setRoomId(roomIdToJoin);
    }
  };

  const handleNicknameSubmit = (name: string) => {
    setNickname(name);
    setShowNicknamePrompt(false);
  };

  return (
    <div className='container mx-auto px-4'>
      <h1 className='text-4xl md:text-5xl font-bold leading-tight mb-2'>
        Ride The Party Bus
      </h1>
      <h4 className='text-xl md:text-2xl italic mt-0 mb-6'>
        The best single-player drinking game, now with friends!
      </h4>

      {showNicknamePrompt && <NicknameModal onSubmit={handleNicknameSubmit} />}

      {!showNicknamePrompt && !roomId && (
        <div className='flex gap-4'>
          <button
            className='py-2 px-4 text-lg font-bold rounded-lg cursor-pointer bg-blue-500 text-white shadow-md'
            onClick={createRoom}
          >
            Create New Game
          </button>
          <button
            className='py-2 px-4 text-lg font-bold rounded-lg cursor-pointer bg-green-500 text-white shadow-md'
            onClick={() => {
              const id = prompt('Enter room ID:');
              if (id) joinRoom(id);
            }}
          >
            Join Game
          </button>
        </div>
      )}

      {roomId && !gameStarted && (
        <div className='mt-8 p-6 bg-gray-800 rounded-lg'>
          <h2 className='text-2xl font-bold mb-4'>Lobby</h2>
          <p className='mb-4'>Room ID: {roomId}</p>

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
              onClick={() => {
                supabase
                  .from('party_bus_rooms')
                  .update({ status: 'in_progress' })
                  .eq('id', roomId)
                  .then(() => setGameStarted(true));
              }}
            >
              Start Game
            </button>
          )}
        </div>
      )}

      {roomId && gameStarted && nickname && (
        <PartyGame roomId={roomId} nickname={nickname} />
      )}
    </div>
  );
};
