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
      timesRedrawn: 0,
    },
    playersState: {},
  });

  const syncGameState = async (
    newState: PartyGameState,
    action: PartyGameAction
  ) => {
    try {
      // Update local state first
      dispatch(action);

      // Then update remote state
      await supabase
        .from('party_bus_players')
        .update({
          game_state: {
            nickname,
            ...newState,
          },
        })
        .eq('room_id', roomId)
        .eq('nickname', nickname);
    } catch (error) {
      console.error('Error syncing game state:', error);
    }
  };

  const redrawCards = async (hasWon: boolean) => {
    // Draw new cards first
    const newCards = drawCards(4);

    // Create the new state
    const newState = {
      cards: newCards,
      currentRound: 1,
      hasWon: false,
      isGameOver: false,
      timesRedrawn: hasWon ? 0 : gameState.timesRedrawn + 1,
    };

    try {
      // Update local state first
      dispatch({
        type: 'DRAW_CARDS',
        amountToDraw: 4,
        resetScore: hasWon,
      });

      // Wait a bit for state to update
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Then sync to Supabase with the complete state
      await supabase
        .from('party_bus_players')
        .update({
          game_state: {
            nickname,
            ...newState,
            cards: newCards, // Use the new cards directly to ensure they're included
          },
        })
        .eq('room_id', roomId)
        .eq('nickname', nickname);
    } catch (error) {
      console.error('Error redrawing cards:', error);
    }
  };

  const firstRound = async (color: RedOrBlack) => {
    const card = gameState.cards[0];
    const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
    const isCorrect = isRed === (color === 'red');

    const newState = {
      ...gameState,
      currentRound: isCorrect
        ? gameState.currentRound + 1
        : gameState.currentRound,
      isGameOver: !isCorrect,
      hasWon: false,
      cards: gameState.cards.map((c, index) =>
        index === 0 ? { ...c, showCardBack: false } : c
      ),
    };

    await syncGameState(
      newState,
      isCorrect
        ? { type: 'ADVANCE_ROUND', cardToFlip: 0 }
        : { type: 'GAME_OVER', cardToFlip: 0 }
    );
  };

  const secondRound = async (guess: HigherLowerOrSame) => {
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

    const newState = {
      ...gameState,
      currentRound: isCorrect
        ? gameState.currentRound + 1
        : gameState.currentRound,
      isGameOver: !isCorrect,
      hasWon: false,
      cards: gameState.cards.map((c, index) =>
        index === 1 ? { ...c, showCardBack: false } : c
      ),
    };

    await syncGameState(
      newState,
      isCorrect
        ? { type: 'ADVANCE_ROUND', cardToFlip: 1 }
        : { type: 'GAME_OVER', cardToFlip: 1 }
    );
  };

  const thirdRound = async (guess: InsideOutsideOrSame) => {
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

    const newState = {
      ...gameState,
      currentRound: isCorrect
        ? gameState.currentRound + 1
        : gameState.currentRound,
      isGameOver: !isCorrect,
      hasWon: false,
      cards: gameState.cards.map((c, index) =>
        index === 2 ? { ...c, showCardBack: false } : c
      ),
    };

    await syncGameState(
      newState,
      isCorrect
        ? { type: 'ADVANCE_ROUND', cardToFlip: 2 }
        : { type: 'GAME_OVER', cardToFlip: 2 }
    );
  };

  const finalRound = async (suit: string) => {
    const card = gameState.cards[3];
    const isCorrect = card.suit === suit;

    const newState = {
      ...gameState,
      isGameOver: true,
      hasWon: isCorrect,
      cards: gameState.cards.map((c, index) =>
        index === 3 || isCorrect ? { ...c, showCardBack: false } : c
      ),
    };

    await syncGameState(
      newState,
      isCorrect ? { type: 'WIN_GAME' } : { type: 'GAME_OVER', cardToFlip: 3 }
    );
  };

  return {
    gameState,
    playersState,
    dispatch,
    firstRound,
    secondRound,
    thirdRound,
    finalRound,
    redrawCards,
  };
};
