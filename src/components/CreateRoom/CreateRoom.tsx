import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { generateRoomId } from '../utils/generateRoomId';
import { RoomLink } from '../components/RoomLink/RoomLink';

type GameState = {
  cards: never[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

export const CreateRoom = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      // Generate a friendly room code
      const friendlyRoomCode = generateRoomId();

      // Create the room with auto-generated UUID and our friendly room code
      const { data: room, error: roomError } = await supabase
        .from('party_bus_rooms')
        .insert({
          room_code: friendlyRoomCode,
          host_nickname: nickname,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add the host as first player
      const { error: playerError } = await supabase
        .from('party_bus_players')
        .insert({
          room_id: room.id, // Use the UUID here
          nickname: nickname,
          game_state: {
            cards: [],
            currentRound: 1,
            hasWon: false,
            isGameOver: false,
            timesRedrawn: 0,
            nickname: nickname, // Include nickname in game state
          } as GameState,
        });

      if (playerError) throw playerError;

      // Set the room code to show the sharing component
      setRoomCode(friendlyRoomCode);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const startGame = () => {
    navigate(`/party-bus/${roomCode}`);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-md mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-center'>
          Create a New Game
        </h1>

        {!roomCode ? (
          <form onSubmit={createRoom} className='space-y-6'>
            <div>
              <label htmlFor='nickname' className='block text-lg mb-2'>
                Your Nickname
              </label>
              <input
                id='nickname'
                type='text'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className='w-full px-4 py-2 bg-gray-700 rounded-lg text-white'
                required
                minLength={2}
                maxLength={20}
              />
            </div>

            {error && <p className='text-red-500 text-center'>{error}</p>}

            <button
              type='submit'
              disabled={isCreating}
              className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </form>
        ) : (
          <div className='space-y-6'>
            <RoomLink roomId={roomCode} />

            <button
              onClick={startGame}
              className='w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
