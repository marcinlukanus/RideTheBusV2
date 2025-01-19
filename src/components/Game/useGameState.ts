import { useReducer } from 'react';

type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
export type RedOrBlack = 'red' | 'black';
export type HigherLowerOrSame = 'higher' | 'lower' | 'same';
export type InsideOutsideOrSame = 'inside' | 'outside' | 'same';

type Value = {
  rank: string;
  numericValue: number;
};

type Card = {
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

export const useGameState = () => {
  const [gameState, dispatch] = useReducer(reducer, {
    cards: [],
    currentRound: 1,
    hasWon: false,
    isGameOver: false,
    // Initial draw of cards increments timesRedrawn by 1, so we start at -1
    timesRedrawn: -1,
  });

  const firstRound = (color: RedOrBlack) => {
    const card = gameState.cards[0];
    const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
    const isCorrect = isRed === (color === 'red');

    if (isCorrect) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 0 });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 0 });
    }
  };

  const secondRound = (guess: HigherLowerOrSame) => {
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

  const thirdRound = (guess: InsideOutsideOrSame) => {
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

  return {
    gameState,
    dispatch,
    firstRound,
    secondRound,
    thirdRound,
    finalRound,
  };
};
