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

export const Game = () => {
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
    dispatch({ type: 'DRAW_CARDS', amountToDraw: 4 });
  }, []);

  const renderButtons = () => {
    switch (gameState.currentRound) {
      case 1:
        return (
          <>
            {(['red', 'black'] as RedOrBlack[]).map((color) => (
              <button key={color} onClick={() => firstRound(color)}>
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
                <button key={guess} onClick={() => secondRound(guess)}>
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
              <button key={suit} onClick={() => finalRound(suit)}>
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
    <div className='game-container'>
      <div className='options'>
        <button
          onClick={() => dispatch({ type: 'DRAW_CARDS', amountToDraw: 4 })}
        >
          Draw Cards
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
        <p>{gameState.hasWon ? 'You won!' : 'You lost!'}</p>
      )}

      <p>Times redrawn: {gameState.timesRedrawn}</p>
    </div>
  );
};
