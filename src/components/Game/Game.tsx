import './Game.css';
import { Card } from '../Card/Card';
import { useEffect, useReducer } from 'react';

type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';

type Value = {
  value: string;
  numericValue: number;
};

type Card = {
  suit: Suit;
  values: Value;
};

const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
const values: Value[] = [
  { value: 'A', numericValue: 1 },
  { value: '2', numericValue: 2 },
  { value: '3', numericValue: 3 },
  { value: '4', numericValue: 4 },
  { value: '5', numericValue: 5 },
  { value: '6', numericValue: 6 },
  { value: '7', numericValue: 7 },
  { value: '8', numericValue: 8 },
  { value: '9', numericValue: 9 },
  { value: '10', numericValue: 10 },
  { value: 'J', numericValue: 11 },
  { value: 'Q', numericValue: 12 },
  { value: 'K', numericValue: 13 },
];

const generateCards = () =>
  suits.flatMap((suit) => values.map((value) => ({ suit, values: value })));

const drawCards = (amountToDraw: number): Card[] => {
  const deck = generateCards();
  let selectedCards: Card[] = [];

  for (let i = 0; i < amountToDraw; i++) {
    const randomIndex = Math.floor(Math.random() * deck.length);
    selectedCards.push(deck[randomIndex]);
    deck.splice(randomIndex, 1);
  }

  console.log(selectedCards);

  return selectedCards;
};

const reducer = (
  state: {
    isGameOver: boolean;
    cards: Card[];
    currentRound: number;
    hasWon: boolean;
  },
  action:
    | { type: 'DRAW_CARDS'; payload: number }
    | { type: 'GAME_OVER' }
    | { type: 'WIN_GAME' }
) => {
  switch (action.type) {
    case 'DRAW_CARDS':
      return {
        ...state,
        cards: drawCards(action.payload),
        hasWon: false,
        isGameOver: false,
      };
    case 'GAME_OVER':
      return {
        ...state,
        isGameOver: true,
        hasWon: false,
      };
    case 'WIN_GAME':
      return {
        ...state,
        hasWon: true,
        isGameOver: true,
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
  });

  useEffect(() => {
    // Draw cards on initial render
    dispatch({ type: 'DRAW_CARDS', payload: 4 });
  }, []);

  return (
    <div className='game-container'>
      <div className='options'>
        <button onClick={() => dispatch({ type: 'DRAW_CARDS', payload: 4 })}>
          Draw Cards
        </button>
      </div>

      <div className='cards'>
        {gameState.cards.map((card, index) => (
          <Card key={index} suit={card.suit} value={card.values.value} />
        ))}
      </div>
    </div>
  );
};
