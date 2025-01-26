import { Card } from '../Card/Card';
import { useEffect } from 'react';
import {
  HigherLowerOrSame,
  InsideOutsideOrSame,
  RedOrBlack,
  suits,
  useGameState,
} from './useGameState';
import Confetti from 'react-confetti';
import { useWindowSize } from '../../helpers/hooks/useWindowSize';
import { postScore } from '../../api/postScore';
// import { BestScores } from '../BestScores/BestScores';
import { LongestRides } from '../LongestRides/LongestRides';
import { postCardCounts } from '../../api/postCardCounts';

export const Game = () => {
  const { width, height } = useWindowSize();

  const {
    gameState,
    dispatch,
    finalRound,
    firstRound,
    secondRound,
    thirdRound,
  } = useGameState();

  useEffect(() => {
    // Draw cards on initial render
    dispatch({ type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
  }, []);

  useEffect(() => {
    // Post score when game is won
    if (gameState.isGameOver && gameState.hasWon) {
      postScore(gameState.timesRedrawn);
    }
  }, [gameState.isGameOver, gameState.hasWon, gameState.timesRedrawn]);

  useEffect(() => {
    // Post cards after game is over
    if (gameState.isGameOver) {
      postCardCounts(gameState.cards);
    }
  }, [gameState.isGameOver, gameState.cards]);

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

  return (
    <>
      {gameState.hasWon && <Confetti width={width} height={height} />}

      <div className='flex flex-col items-center justify-center'>
        <div className='flex flex-wrap gap-5 justify-center'>
          {gameState.cards.map((card, index) => (
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
              onClick={() =>
                dispatch({
                  type: 'DRAW_CARDS',
                  amountToDraw: 4,
                  resetScore: gameState.hasWon,
                })
              }
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

        <div className='flex gap-5 mt-8'>
          {/* <BestScores /> */}
          <LongestRides />
        </div>
      </div>
    </>
  );
};
