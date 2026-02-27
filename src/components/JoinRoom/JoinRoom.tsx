import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../utils/supabase';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

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
      const { error: joinError } = await supabase.from('party_bus_players').insert({
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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Join Game</h1>

        <Panel className="space-y-6">
          <div className="rounded-lg bg-surface p-4 text-center">
            <h2 className="mb-2 text-xl font-bold">Room Code</h2>
            <p className="font-mono text-2xl">{roomCode}</p>
          </div>

          <form onSubmit={joinRoom} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="mb-2 block text-lg">
                Your Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-lg bg-surface-input px-4 py-2 text-white"
                required
                minLength={2}
                maxLength={20}
              />
            </div>

            {error && <p className="text-center text-red-500">{error}</p>}

            <Button type="submit" disabled={isJoining} className="w-full py-3 text-base">
              {isJoining ? 'Joining...' : 'Join Game'}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
};
