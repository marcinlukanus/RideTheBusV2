import { useEffect } from 'react';
import { Card } from '../Card/Card';
import { usePartyGameState } from './usePartyGameState';
import supabase from '../../utils/supabase';
import Confetti from 'react-confetti';
import { createPortal } from 'react-dom';
import { useDocumentSize } from '../../helpers/hooks/useDocumentSize';
import {
  HigherLowerOrSame,
  InsideOutsideOrSame,
  RedOrBlack,
  suits,
  Card as GameCard,
} from '../Game/useGameState';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

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
  const { width, height } = useDocumentSize();
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
    const initializeGame = async () => {
      try {
        // 1. First fetch all players' states
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

          // 2. Wait a bit to ensure player states are updated
          await new Promise((resolve) => setTimeout(resolve, 100));

          // 3. Draw initial cards using redrawCards (which handles state sync properly)
          await redrawCards(false, true);
        }
      } catch (error) {
        console.error('Error initializing game:', error);
      }
    };

    // Initialize the game
    initializeGame();

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
        },
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
                className={`cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md ${
                  color === 'red' ? 'bg-red-600 text-white' : 'bg-black text-white'
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
            {(['higher', 'lower', 'same'] as HigherLowerOrSame[]).map((guess) => (
              <button
                key={guess}
                className="cursor-pointer rounded-lg bg-white px-4 py-2 text-lg font-bold text-black shadow-md"
                onClick={() => secondRound(guess)}
              >
                {guess.charAt(0).toUpperCase() + guess.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      case 3:
        return (
          <>
            {(['inside', 'outside', 'same'] as InsideOutsideOrSame[]).map((guess) => (
              <button
                key={guess}
                className="cursor-pointer rounded-lg bg-white px-4 py-2 text-lg font-bold text-black shadow-md"
                onClick={() => thirdRound(guess)}
              >
                {guess.charAt(0).toUpperCase() + guess.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      case 4:
        return (
          <>
            {suits.map((suit) => (
              <button
                key={suit}
                className={`cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md ${
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
    <div className="mb-8 rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-xl font-bold">{playerState.nickname}'s Game</h3>
      <div className="flex flex-wrap justify-center gap-5">
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
        <p className="mt-4 text-lg font-bold">{playerState.hasWon ? 'Finished!' : 'Game Over!'}</p>
      )}
      <p className="mt-2 text-lg">Round: {playerState.currentRound}</p>
      <p className="mt-2 text-lg">Drinks taken: {playerState.timesRedrawn}</p>
    </div>
  );

  const renderLeaderboard = () => {
    // Get all players including current player
    const allPlayers = [
      {
        nickname,
        timesRedrawn: gameState.timesRedrawn,
        isGameOver: gameState.isGameOver,
        hasWon: gameState.hasWon,
      },
      ...Object.entries(playersState).map(([playerNickname, state]) => ({
        nickname: playerNickname,
        timesRedrawn: state.timesRedrawn,
        isGameOver: state.isGameOver,
        hasWon: state.hasWon,
      })),
    ];

    // Check if all players have finished successfully
    const allFinished = allPlayers.every((player) => player.isGameOver && player.hasWon);

    if (!allFinished) return null;

    // Sort players by score (times redrawn)
    const sortedPlayers = allPlayers.sort((a, b) => a.timesRedrawn - b.timesRedrawn);
    const winner = sortedPlayers[0];
    const isCurrentPlayerWinner = winner.nickname === nickname;

    return (
      <>
        <div className="mt-12 rounded-lg bg-gray-800 p-8">
          <h2 className="mb-6 text-center text-3xl font-bold">🏆 Final Results 🏆</h2>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.nickname}
                className={`flex items-center justify-between rounded-lg p-4 ${
                  index === 0 ? 'bg-yellow-500/20' : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{index + 1}.</span>
                  <span className="text-xl">{player.nickname}</span>
                  {index === 0 && <span className="text-2xl">👑</span>}
                </div>
                <div className="text-xl">
                  {player.timesRedrawn} {player.timesRedrawn === 1 ? 'redraw' : 'redraws'}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xl font-bold">
            🎉 {winner.nickname} wins with {winner.timesRedrawn}{' '}
            {winner.timesRedrawn === 1 ? 'redraw' : 'redraws'}! 🎉
          </p>
        </div>
        {isCurrentPlayerWinner &&
          createPortal(
            <Confetti
              width={width}
              height={height}
              style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
            />,
            document.body,
          )}
      </>
    );
  };

  // Check if all players have finished successfully
  const allPlayers = [
    { isGameOver: gameState.isGameOver, hasWon: gameState.hasWon },
    ...Object.values(playersState).map((state) => ({
      isGameOver: state.isGameOver,
      hasWon: state.hasWon,
    })),
  ];
  const allFinished = allPlayers.every((player) => player.isGameOver && player.hasWon);

  return (
    <div className="container mx-auto px-4">
      {!allFinished ? (
        <>
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Your Game</h2>
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-wrap justify-center gap-5">
                {gameState.cards.map((card: GameCard, index: number) => (
                  <Card
                    key={index}
                    rank={card.values.rank}
                    showCardBack={card.showCardBack}
                    suit={card.suit}
                  />
                ))}
              </div>

              {gameState.isGameOver && !gameState.hasWon && (
                <div className="mt-8 flex">
                  <button
                    className="cursor-pointer rounded-lg bg-white px-4 py-2 text-lg font-bold text-black shadow-md active:translate-y-1"
                    onClick={() => redrawCards(false)}
                  >
                    Redraw Cards
                  </button>
                </div>
              )}

              {!gameState.isGameOver && <div className="mt-8 flex gap-5">{renderButtons()}</div>}

              {gameState.isGameOver && (
                <p className="mt-8 text-lg font-bold">
                  {gameState.hasWon ? 'Finished! High five! ✋' : 'Take a drink!'}
                </p>
              )}

              <p className="mt-4 text-xl font-bold">Drinks taken: {gameState.timesRedrawn}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">Other Players</h2>
            <div className="gap-6">
              {Object.entries(playersState)
                .filter(([playerNickname]) => playerNickname !== nickname)
                .map(([playerNickname, state]) => (
                  <div key={playerNickname}>{renderPlayerGame(state as PlayerState)}</div>
                ))}
            </div>
          </div>
        </>
      ) : (
        renderLeaderboard()
      )}
    </div>
  );
};
