import { useReducer } from 'react';
import {
  Card,
  RedOrBlack,
  HigherLowerOrSame,
  InsideOutsideOrSame,
  drawCards,
} from '../Game/useGameState';
import supabase from '../../utils/supabase';

type PlayerState = {
  nickname: string;
  cards: Card[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

type PartyGameState = {
  cards: Card[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

type PlayersState = {
  [nickname: string]: PlayerState;
};

type PartyGameAction =
  | { type: 'DRAW_CARDS'; amountToDraw: number; resetScore: boolean }
  | { type: 'ADVANCE_ROUND'; cardToFlip: number }
  | { type: 'GAME_OVER'; cardToFlip: number }
  | { type: 'WIN_GAME' }
  | { type: 'UPDATE_PLAYER_STATE'; nickname: string; state: PlayerState };

type ReducerState = {
  gameState: PartyGameState;
  playersState: PlayersState;
};

const reducer = (
  state: ReducerState,
  action: PartyGameAction
): ReducerState => {
  switch (action.type) {
    case 'DRAW_CARDS':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          cards: drawCards(action.amountToDraw),
          hasWon: false,
          isGameOver: false,
          currentRound: 1,
          timesRedrawn: action.resetScore
            ? 0
            : state.gameState.timesRedrawn + 1,
        },
      };
    case 'ADVANCE_ROUND':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentRound: state.gameState.currentRound + 1,
          cards: state.gameState.cards.map((card, index) =>
            index === action.cardToFlip
              ? { ...card, showCardBack: false }
              : card
          ),
        },
      };
    case 'GAME_OVER':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          isGameOver: true,
          hasWon: false,
          cards: state.gameState.cards.map((card, index) =>
            index === action.cardToFlip
              ? { ...card, showCardBack: false }
              : card
          ),
        },
      };
    case 'WIN_GAME':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          hasWon: true,
          isGameOver: true,
          cards: state.gameState.cards.map((card) => ({
            ...card,
            showCardBack: false,
          })),
        },
      };
    case 'UPDATE_PLAYER_STATE':
      return {
        ...state,
        playersState: {
          ...state.playersState,
          [action.nickname]: action.state,
        },
      };
    default:
      return state;
  }
};

export const usePartyGameState = (roomId: string, nickname: string) => {
  const [{ gameState, playersState }, dispatch] = useReducer(reducer, {
    gameState: {
      cards: [],
      currentRound: 1,
      hasWon: false,
      isGameOver: false,
      timesRedrawn: -1,
    },
    playersState: {},
  });

  const updateGameState = (newState: PartyGameState) => {
    // Update local state first
    dispatch({
      type: 'UPDATE_PLAYER_STATE',
      nickname,
      state: {
        nickname,
        ...newState,
      },
    });

    // Also update our own game state
    dispatch({
      type: 'UPDATE_PLAYER_STATE',
      nickname,
      state: {
        nickname,
        ...newState,
      },
    });

    // Update remote state
    supabase
      .from('party_bus_players')
      .update({
        game_state: {
          nickname,
          ...newState,
        },
      })
      .eq('room_id', roomId)
      .eq('nickname', nickname);
  };

  const firstRound = (color: RedOrBlack) => {
    const card = gameState.cards[0];
    const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
    const isCorrect = isRed === (color === 'red');

    if (isCorrect) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 0 });
      updateGameState({
        ...gameState,
        currentRound: gameState.currentRound + 1,
        cards: gameState.cards.map((c, index) =>
          index === 0 ? { ...c, showCardBack: false } : c
        ),
      });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 0 });
      updateGameState({
        ...gameState,
        isGameOver: true,
        hasWon: false,
        cards: gameState.cards.map((c, index) =>
          index === 0 ? { ...c, showCardBack: false } : c
        ),
      });
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
      updateGameState({
        ...gameState,
        currentRound: gameState.currentRound + 1,
        cards: gameState.cards.map((c, index) =>
          index === 1 ? { ...c, showCardBack: false } : c
        ),
      });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 1 });
      updateGameState({
        ...gameState,
        isGameOver: true,
        hasWon: false,
        cards: gameState.cards.map((c, index) =>
          index === 1 ? { ...c, showCardBack: false } : c
        ),
      });
    }
  };

  const thirdRound = (guess: InsideOutsideOrSame) => {
    const firstCard = gameState.cards[0];
    const secondCard = gameState.cards[1];
    const thirdCard = gameState.cards[2];

    const firstValue = firstCard.values.numericValue;
    const secondValue = secondCard.values.numericValue;
    const thirdValue = thirdCard.values.numericValue;

    const min = Math.min(firstValue, secondValue);
    const max = Math.max(firstValue, secondValue);

    const isInside = thirdValue > min && thirdValue < max;
    const isOutside = thirdValue < min || thirdValue > max;
    const isSame = thirdValue === min || thirdValue === max;

    const isCorrect =
      (isInside && guess === 'inside') ||
      (isOutside && guess === 'outside') ||
      (isSame && guess === 'same');

    if (isCorrect) {
      dispatch({ type: 'ADVANCE_ROUND', cardToFlip: 2 });
      updateGameState({
        ...gameState,
        currentRound: gameState.currentRound + 1,
        cards: gameState.cards.map((c, index) =>
          index === 2 ? { ...c, showCardBack: false } : c
        ),
      });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 2 });
      updateGameState({
        ...gameState,
        isGameOver: true,
        hasWon: false,
        cards: gameState.cards.map((c, index) =>
          index === 2 ? { ...c, showCardBack: false } : c
        ),
      });
    }
  };

  const finalRound = (suit: string) => {
    const card = gameState.cards[3];
    const isCorrect = card.suit === suit;

    if (isCorrect) {
      dispatch({ type: 'WIN_GAME' });
      updateGameState({
        ...gameState,
        hasWon: true,
        isGameOver: true,
        cards: gameState.cards.map((c) => ({ ...c, showCardBack: false })),
      });
    } else {
      dispatch({ type: 'GAME_OVER', cardToFlip: 3 });
      updateGameState({
        ...gameState,
        isGameOver: true,
        hasWon: false,
        cards: gameState.cards.map((c, index) =>
          index === 3 ? { ...c, showCardBack: false } : c
        ),
      });
    }
  };

  return {
    gameState,
    playersState,
    dispatch,
    firstRound,
    secondRound,
    thirdRound,
    finalRound,
  };
};
