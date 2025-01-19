import './Game.css';
import { Card } from '../Card/Card';
import { useEffect, useReducer } from 'react';

type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';

type Value = {
  rank: string;
  numericValue: number;
};

type Card = {
  suit: Suit;
  values: Value;
  showCardBack: boolean;
};

const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
const values: Value[] = [
  { rank: '2', numericValue: 2 },
  { rank: '3', numericValue: 3 },
  { rank: '4', numericValue: 4 },
  { rank: '5', numericValue: 5 },
  { rank: '6', numericValue: 6 },
  { rank: '7', numericValue: 7 },
  { rank: '8', numericValue: 8 },
  { rank: '9', numericValue: 9 },
  { rank: '10', numericValue: 10 },
  { rank: 'J', numericValue: 11 },
  { rank: 'Q', numericValue: 12 },
  { rank: 'K', numericValue: 13 },
  { rank: 'A', numericValue: 14 },
];

const generateCards = () =>
  suits.flatMap((suit) => values.map((value) => ({ suit, values: value })));

const drawCards = (amountToDraw: number): Card[] => {
  const deck = generateCards();
  let selectedCards: Card[] = [];

  for (let i = 0; i < amountToDraw; i++) {
    const randomIndex = Math.floor(Math.random() * deck.length);
    selectedCards.push({ ...deck[randomIndex], showCardBack: true });
    deck.splice(randomIndex, 1);
  }

  return selectedCards;
};

const reducer = (
  state: {
    cards: Card[];
    currentRound: number;
    hasWon: boolean;
    isGameOver: boolean;
    timesRedrawn: number;
  },
  action:
    | { type: 'DRAW_CARDS'; amountToDraw: number }
    | { type: 'ADVANCE_ROUND'; cardToFlip: number }
    | { type: 'GAME_OVER'; cardToFlip: number }
    | { type: 'WIN_GAME' }
) => {
  switch (action.type) {
    case 'DRAW_CARDS':
      return {
        ...state,
        cards: drawCards(action.amountToDraw),
        hasWon: false,
        isGameOver: false,
        currentRound: 1,
        timesRedrawn: state.timesRedrawn + 1,
      };
    case 'ADVANCE_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
        cards: state.cards.map((card, index) =>
          index === action.cardToFlip ? { ...card, showCardBack: false } : card
        ),
      };
    case 'GAME_OVER':
      return {
        ...state,
        isGameOver: true,
        hasWon: false,
        cards: state.cards.map((card, index) =>
          index === action.cardToFlip ? { ...card, showCardBack: false } : card
        ),
      };
    case 'WIN_GAME':
      return {
        ...state,
        hasWon: true,
        isGameOver: true,
        cards: state.cards.map((card) => ({ ...card, showCardBack: false })),
      };
    default:
      return state;
  }
};

export const Game = () => {
  const [gameState, dispatch] = useReducer(reducer, {
    cards: [],
    currentRound: 1,
    hasWon: false,
    isGameOver: false,
    timesRedrawn: -1,
  });

  useEffect(() => {
    // Draw cards on initial render
    dispatch({ type: 'DRAW_CARDS', amountToDraw: 4 });
  }, []);

  const firstRound = (color: 'red' | 'black') => {
    const card = gameState.cards[0];
    const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
    const isCorrect = isRed === (color === 'red');

    if (isCorrect) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 0 });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 0 });
    }
  };

  const secondRound = (guess: 'higher' | 'lower' | 'same') => {
    const firstCard = gameState.cards[0];
    const secondCard = gameState.cards[1];

    const isHigher =
      secondCard.values.numericValue > firstCard.values.numericValue;

    const isLower =
      secondCard.values.numericValue < firstCard.values.numericValue;

    const isCorrect =
      (isHigher && guess === 'higher') ||
      (isLower && guess === 'lower') ||
      (firstCard.values.numericValue === secondCard.values.numericValue &&
        guess === 'same');

    if (isCorrect) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 1 });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 1 });
    }
  };

  const thirdRound = (guess: 'inside' | 'outside' | 'same') => {
    const firstCard = gameState.cards[0];
    const secondCard = gameState.cards[1];
    const thirdCard = gameState.cards[2];

    const isInside =
      Math.min(firstCard.values.numericValue, secondCard.values.numericValue) <
        thirdCard.values.numericValue &&
      thirdCard.values.numericValue <
        Math.max(firstCard.values.numericValue, secondCard.values.numericValue);

    const isOutside =
      (thirdCard.values.numericValue > firstCard.values.numericValue &&
        thirdCard.values.numericValue > secondCard.values.numericValue) ||
      (thirdCard.values.numericValue < firstCard.values.numericValue &&
        thirdCard.values.numericValue < secondCard.values.numericValue);

    const isSame =
      firstCard.values.numericValue === thirdCard.values.numericValue ||
      secondCard.values.numericValue === thirdCard.values.numericValue;

    const isCorrect =
      (isInside && guess === 'inside') ||
      (isOutside && guess === 'outside') ||
      (isSame && guess === 'same');

    if (isCorrect) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 2 });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 2 });
    }
  };

  const finalRound = (suit: Suit) => {
    const finalCard = gameState.cards[3];

    const isCorrect = finalCard.suit === suit;

    if (isCorrect) {
      dispatch({ type: 'WIN_GAME' });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 3 });
    }
  };

  const renderButtons = () => {
    switch (gameState.currentRound) {
      case 1:
        return (
          <>
            <button onClick={() => firstRound('red')}>Red</button>
            <button onClick={() => firstRound('black')}>Black</button>
          </>
        );
      case 2:
        return (
          <>
            <button onClick={() => secondRound('higher')}>Higher</button>
            <button onClick={() => secondRound('lower')}>Lower</button>
            <button onClick={() => secondRound('same')}>Same</button>
          </>
        );
      case 3:
        return (
          <>
            <button onClick={() => thirdRound('inside')}>Inside</button>
            <button onClick={() => thirdRound('outside')}>Outside</button>
            <button onClick={() => thirdRound('same')}>Same</button>
          </>
        );
      case 4:
        return (
          <>
            <button onClick={() => finalRound('HEARTS')}>Hearts</button>
            <button onClick={() => finalRound('DIAMONDS')}>Diamonds</button>
            <button onClick={() => finalRound('CLUBS')}>Clubs</button>
            <button onClick={() => finalRound('SPADES')}>Spades</button>
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
