import './Game.css';
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

  const renderButtons = () => {
    switch (gameState.currentRound) {
      case 1:
        return (
          <>
            {(['red', 'black'] as RedOrBlack[]).map((color) => (
              <button
                key={color}
                className={color}
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
                  className={guess}
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
                <button key={guess} onClick={() => thirdRound(guess)}>
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
                className={suit}
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
      <Confetti
        width={width}
        height={height}
        recycle={false}
        run={gameState.hasWon}
      />

      <div className='game-container'>
        <div className='options'>
          <button
            className='draw-cards'
            onClick={() =>
              dispatch({
                type: 'DRAW_CARDS',
                amountToDraw: 4,
                resetScore: gameState.hasWon,
              })
            }
          >
            {gameState.hasWon ? 'Another Ride?' : 'Draw Cards'}
          </button>
        </div>

        <div className='cards'>
          {gameState.cards.map((card, index) => (
            <Card
              key={index}
              rank={card.values.rank}
              showCardBack={card.showCardBack}
              suit={card.suit}
            />
          ))}
        </div>

        {!gameState.isGameOver && (
          <div className='game-buttons'>{renderButtons()}</div>
        )}

        {gameState.isGameOver && (
          <p className='end-state'>
            {gameState.hasWon ? 'You won!' : 'Take a drink!'}
          </p>
        )}

        <p className='times-redrawn'>Times redrawn: {gameState.timesRedrawn}</p>
      </div>
    </>
  );
};
