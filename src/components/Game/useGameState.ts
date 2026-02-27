import { useReducer } from 'react';
import {
  validateFirstRound,
  validateSecondRound,
  validateThirdRound,
  validateFinalRound,
} from '../../utils/gameValidation';

type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
export type RedOrBlack = 'red' | 'black';
export type HigherLowerOrSame = 'higher' | 'lower' | 'same';
export type InsideOutsideOrSame = 'inside' | 'outside' | 'same';

type Value = {
  rank: string;
  numericValue: number;
};

export type Card = {
  suit: Suit;
  values: Value;
  showCardBack: boolean;
};

export const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
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

export const drawCards = (amountToDraw: number): Card[] => {
  const deck = generateCards();
  const selectedCards: Card[] = [];

  for (let i = 0; i < amountToDraw; i++) {
    const randomIndex = Math.floor(Math.random() * deck.length);
    selectedCards.push({ ...deck[randomIndex], showCardBack: true });
    deck.splice(randomIndex, 1);
  }

  return selectedCards;
};

export type GameState = {
  cards: Card[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

export type GameAction =
  | { type: 'DRAW_CARDS'; amountToDraw: number; resetScore: boolean }
  | { type: 'ADVANCE_ROUND'; cardToFlip: number }
  | { type: 'GAME_OVER'; cardToFlip: number }
  | { type: 'WIN_GAME' };

export const initialGameState: GameState = {
  cards: [],
  currentRound: 1,
  hasWon: false,
  isGameOver: false,
  // Initial draw of cards increments timesRedrawn by 1, so we start at -1
  timesRedrawn: -1,
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'DRAW_CARDS':
      return {
        ...state,
        cards: drawCards(action.amountToDraw),
        hasWon: false,
        isGameOver: false,
        currentRound: 1,
        timesRedrawn: action.resetScore ? 0 : state.timesRedrawn + 1,
      };
    case 'ADVANCE_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
        cards: state.cards.map((card, index) =>
          index === action.cardToFlip ? { ...card, showCardBack: false } : card,
        ),
      };
    case 'GAME_OVER':
      return {
        ...state,
        isGameOver: true,
        hasWon: false,
        cards: state.cards.map((card, index) =>
          index === action.cardToFlip ? { ...card, showCardBack: false } : card,
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

export const useGameState = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const firstRound = (color: RedOrBlack) => {
    if (validateFirstRound(gameState.cards[0], color)) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 0 });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 0 });
    }
  };

  const secondRound = (guess: HigherLowerOrSame) => {
    if (validateSecondRound(gameState.cards[0], gameState.cards[1], guess)) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 1 });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 1 });
    }
  };

  const thirdRound = (guess: InsideOutsideOrSame) => {
    if (validateThirdRound(gameState.cards[0], gameState.cards[1], gameState.cards[2], guess)) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 2 });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 2 });
    }
  };

  const finalRound = (suit: Suit) => {
    if (validateFinalRound(gameState.cards[3], suit)) {
      dispatch({ type: 'WIN_GAME' });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 3 });
    }
  };

  return {
    gameState,
    dispatch,
    firstRound,
    secondRound,
    thirdRound,
    finalRound,
  };
};
