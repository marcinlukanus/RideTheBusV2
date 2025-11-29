import { useReducer, useCallback } from 'react';
import { drawSeededCards, Card } from '../../utils/seededRandom';

type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
export type RedOrBlack = 'red' | 'black';
export type HigherLowerOrSame = 'higher' | 'lower' | 'same';
export type InsideOutsideOrSame = 'inside' | 'outside' | 'same';

export const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];

type BeerdleGameState = {
  cards: Card[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  attempts: number;
  seed: number | null;
  dayNumber: number | null;
  gameDate: string | null;
  isLoading: boolean;
};

type BeerdleAction =
  | { type: 'SET_SEED'; seed: number; dayNumber: number; gameDate: string }
  | { type: 'DRAW_CARDS' }
  | { type: 'ADVANCE_ROUND'; cardToFlip: number }
  | { type: 'GAME_OVER'; cardToFlip: number }
  | { type: 'WIN_GAME' }
  | { type: 'RESET_FOR_NEW_DAY' };

const initialState: BeerdleGameState = {
  cards: [],
  currentRound: 1,
  hasWon: false,
  isGameOver: false,
  attempts: 0,
  seed: null,
  dayNumber: null,
  gameDate: null,
  isLoading: true,
};

const reducer = (state: BeerdleGameState, action: BeerdleAction): BeerdleGameState => {
  switch (action.type) {
    case 'SET_SEED': {
      // When seed is set, draw the first set of cards
      const newCards = drawSeededCards(action.seed, 1);
      return {
        ...state,
        seed: action.seed,
        dayNumber: action.dayNumber,
        gameDate: action.gameDate,
        cards: newCards,
        attempts: 1,
        currentRound: 1,
        hasWon: false,
        isGameOver: false,
        isLoading: false,
      };
    }
    case 'DRAW_CARDS': {
      if (state.seed === null) return state;
      const newAttempts = state.attempts + 1;
      const newCards = drawSeededCards(state.seed, newAttempts);
      return {
        ...state,
        cards: newCards,
        hasWon: false,
        isGameOver: false,
        currentRound: 1,
        attempts: newAttempts,
      };
    }
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
    case 'RESET_FOR_NEW_DAY':
      return initialState;
    default:
      return state;
  }
};

export const useBeerdleGameState = () => {
  const [gameState, dispatch] = useReducer(reducer, initialState);

  const setSeed = useCallback((seed: number, dayNumber: number, gameDate: string) => {
    dispatch({ type: 'SET_SEED', seed, dayNumber, gameDate });
  }, []);

  const drawCards = useCallback(() => {
    dispatch({ type: 'DRAW_CARDS' });
  }, []);

  const firstRound = useCallback(
    (color: RedOrBlack) => {
      const card = gameState.cards[0];
      const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
      const isCorrect = isRed === (color === 'red');

      if (isCorrect) {
        dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 0 });
      } else {
        dispatch({ type: 'GAME_OVER', cardToFlip: 0 });
      }
    },
    [gameState.cards],
  );

  const secondRound = useCallback(
    (guess: HigherLowerOrSame) => {
      const firstCard = gameState.cards[0];
      const secondCard = gameState.cards[1];

      const isHigher = secondCard.values.numericValue > firstCard.values.numericValue;
      const isLower = secondCard.values.numericValue < firstCard.values.numericValue;

      const isCorrect =
        (isHigher && guess === 'higher') ||
        (isLower && guess === 'lower') ||
        (firstCard.values.numericValue === secondCard.values.numericValue && guess === 'same');

      if (isCorrect) {
        dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 1 });
      } else {
        dispatch({ type: 'GAME_OVER', cardToFlip: 1 });
      }
    },
    [gameState.cards],
  );

  const thirdRound = useCallback(
    (guess: InsideOutsideOrSame) => {
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
    },
    [gameState.cards],
  );

  const finalRound = useCallback(
    (suit: Suit) => {
      const finalCard = gameState.cards[3];
      const isCorrect = finalCard.suit === suit;

      if (isCorrect) {
        dispatch({ type: 'WIN_GAME' });
      } else {
        dispatch({ type: 'GAME_OVER', cardToFlip: 3 });
      }
    },
    [gameState.cards],
  );

  const generateShareText = useCallback((): string => {
    if (!gameState.hasWon || !gameState.dayNumber) return '';

    const beers = '🍺'.repeat(gameState.attempts);

    return `Beerdle #${gameState.dayNumber}\n\n${beers}\n\nhttps://ridethebus.party/beerdle`;
  }, [gameState.hasWon, gameState.dayNumber, gameState.attempts]);

  return {
    gameState,
    dispatch,
    setSeed,
    drawCards,
    firstRound,
    secondRound,
    thirdRound,
    finalRound,
    generateShareText,
  };
};
