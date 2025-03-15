import { useEffect } from 'react';
import { Card } from '../Card/Card';
import { usePartyGameState } from './usePartyGameState';
import supabase from '../../utils/supabase';
import Confetti from 'react-confetti';
import { useWindowSize } from '../../helpers/hooks/useWindowSize';
import {
  HigherLowerOrSame,
  InsideOutsideOrSame,
  RedOrBlack,
  suits,
  Card as GameCard,
} from '../Game/useGameState';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '../../../database.types';

type PartyGameProps = {
  roomId: string;
  nickname: string;
};

type PlayerState = {
  nickname: string;
  cards: GameCard[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

type RealtimePlayerPayload = RealtimePostgresChangesPayload<
  Database['public']['Tables']['party_bus_players']['Row']
> & {
  new: Database['public']['Tables']['party_bus_players']['Row'];
};

export const PartyGame = ({ roomId, nickname }: PartyGameProps) => {
  const { width, height } = useWindowSize();
  const {
    gameState,
    playersState,
    dispatch,
    firstRound,
    secondRound,
    thirdRound,
    finalRound,
    redrawCards,
  } = usePartyGameState(roomId, nickname);

  useEffect(() => {
    // Fetch initial state of all players
    const fetchInitialState = async () => {
      const { data: players } = await supabase
        .from('party_bus_players')
        .select('*')
        .eq('room_id', roomId);

      if (players) {
        // Update state for each player
        players.forEach((player) => {
          if (player.game_state && player.nickname !== nickname) {
            dispatch({
              type: 'UPDATE_PLAYER_STATE',
              nickname: player.nickname,
              state: player.game_state as PlayerState,
            });
          }
        });
      }
    };

    // Draw initial cards and sync them
    const drawInitialCards = async () => {
      // Draw cards first
      dispatch({ type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });

      // Wait for state to update
      setTimeout(async () => {
        // Then sync to Supabase
        await supabase
          .from('party_bus_players')
          .update({
            game_state: {
              nickname,
              ...gameState,
              cards: gameState.cards,
            },
          })
          .eq('room_id', roomId)
          .eq('nickname', nickname);
      }, 0);
    };

    // First fetch initial state, then draw cards
    fetchInitialState().then(() => drawInitialCards());

    // Subscribe to room updates
    const channel = supabase
      .channel(`room:${roomId}`)
      .on<RealtimePlayerPayload>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_bus_players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePlayerPayload) => {
          if (payload.new.game_state && payload.new.nickname !== nickname) {
            const state = payload.new.game_state as PlayerState;
            dispatch({
              type: 'UPDATE_PLAYER_STATE',
              nickname: payload.new.nickname,
              state,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const renderButtons = () => {
    switch (gameState.currentRound) {
      case 1:
        return (
          <>
            {(['red', 'black'] as RedOrBlack[]).map((color) => (
              <button
                key={color}
                className={`py-2 px-4 text-lg font-bold rounded-lg cursor-pointer shadow-md ${
                  color === 'red'
                    ? 'bg-red-600 text-white'
                    : 'bg-black text-white'
                }`}
                onClick={() => firstRound(color)}
              >
                {color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      case 2:
        return (
          <>
            {(['higher', 'lower', 'same'] as HigherLowerOrSame[]).map(
              (guess) => (
                <button
                  key={guess}
                  className='py-2 px-4 text-lg font-bold rounded-lg cursor-pointer shadow-md bg-white text-black'
                  onClick={() => secondRound(guess)}
                >
                  {guess.charAt(0).toUpperCase() + guess.slice(1).toLowerCase()}
                </button>
              )
            )}
          </>
        );
      case 3:
        return (
          <>
            {(['inside', 'outside', 'same'] as InsideOutsideOrSame[]).map(
              (guess) => (
                <button
                  key={guess}
                  className='py-2 px-4 text-lg font-bold rounded-lg cursor-pointer shadow-md bg-white text-black'
                  onClick={() => thirdRound(guess)}
                >
                  {guess.charAt(0).toUpperCase() + guess.slice(1).toLowerCase()}
                </button>
              )
            )}
          </>
        );
      case 4:
        return (
          <>
            {suits.map((suit) => (
              <button
                key={suit}
                className={`py-2 px-4 text-lg font-bold rounded-lg cursor-pointer shadow-md ${
                  suit === 'HEARTS' || suit === 'DIAMONDS'
                    ? 'bg-red-600 text-white'
                    : 'bg-black text-white'
                }`}
                onClick={() => finalRound(suit)}
              >
                {suit.charAt(0).toUpperCase() + suit.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  const renderPlayerGame = (playerState: PlayerState) => (
    <div className='mb-8 p-6 bg-gray-800 rounded-lg'>
      <h3 className='text-xl font-bold mb-4'>{playerState.nickname}'s Game</h3>
      <div className='flex flex-wrap gap-5 justify-center'>
        {playerState.cards.map((card: GameCard, index: number) => (
          <Card
            key={index}
            rank={card.values.rank}
            showCardBack={card.showCardBack}
            suit={card.suit}
          />
        ))}
      </div>
      {playerState.isGameOver && (
        <p className='mt-4 text-lg font-bold'>
          {playerState.hasWon ? 'Won!' : 'Game Over!'}
        </p>
      )}
      <p className='mt-2 text-lg'>Round: {playerState.currentRound}</p>
      <p className='mt-2 text-lg'>Times redrawn: {playerState.timesRedrawn}</p>
    </div>
  );

  return (
    <div className='container mx-auto px-4'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold mb-4'>Your Game</h2>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex flex-wrap gap-5 justify-center'>
            {gameState.cards.map((card: GameCard, index: number) => (
              <Card
                key={index}
                rank={card.values.rank}
                showCardBack={card.showCardBack}
                suit={card.suit}
              />
            ))}
          </div>

          {gameState.isGameOver && (
            <div className='flex mt-8'>
              <button
                className='py-2 px-4 text-lg font-bold rounded-lg cursor-pointer bg-white text-black shadow-md active:translate-y-1'
                onClick={() => redrawCards(gameState.hasWon)}
              >
                {gameState.hasWon ? 'Another Ride?' : 'Redraw Cards'}
              </button>
            </div>
          )}

          {!gameState.isGameOver && (
            <div className='flex gap-5 mt-8'>{renderButtons()}</div>
          )}

          {gameState.isGameOver && (
            <p className='mt-8 text-lg font-bold'>
              {gameState.hasWon ? 'You won!' : 'Take a drink!'}
            </p>
          )}

          <p className='mt-4 text-xl font-bold'>
            Times redrawn: {gameState.timesRedrawn}
          </p>
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='text-2xl font-bold mb-4'>Other Players</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {Object.entries(playersState)
            .filter(([playerNickname]) => playerNickname !== nickname)
            .map(([playerNickname, state]) => (
              <div key={playerNickname}>
                {renderPlayerGame(state as PlayerState)}
              </div>
            ))}
        </div>
      </div>

      {gameState.hasWon && <Confetti width={width} height={height} />}
    </div>
  );
};
