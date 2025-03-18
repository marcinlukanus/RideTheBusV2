import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../utils/supabase';

type GameState = {
  cards: never[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

export const JoinRoom = () => {
  const navigate = useNavigate();
  const { roomId: roomCode } = useParams(); // This is actually the room_code
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsJoining(true);

    if (!roomCode) {
      setError('Invalid room code.');
      setIsJoining(false);
      return;
    }

    try {
      // Check if room exists using room_code
      const { data: room, error: roomError } = await supabase
        .from('party_bus_rooms')
        .select('id, room_code')
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

      // Add player to room using the UUID
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
            nickname: nickname, // Include nickname in game state
          } as GameState,
        });

      if (joinError) throw joinError;

      // Navigate to game using the friendly room code
      navigate(`/party-bus/${roomCode}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-md mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-center'>Join Game</h1>

        <div className='mb-8 p-4 bg-gray-800 rounded-lg text-center'>
          <h2 className='text-xl font-bold mb-2'>Room Code</h2>
          <p className='text-2xl font-mono'>{roomCode}</p>
        </div>

        <form onSubmit={joinRoom} className='space-y-6'>
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
            disabled={isJoining}
            className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
};
