import { useReducer, useEffect, useRef } from 'react';
import {
  Card,
  RedOrBlack,
  HigherLowerOrSame,
  InsideOutsideOrSame,
  drawCards,
} from '../Game/useGameState';
import supabase from '../../utils/supabase';

export type PlayerState = {
  nickname: string;
  cards: Card[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

export type PartyGameState = {
  cards: Card[];
  currentRound: number;
  hasWon: boolean;
  isGameOver: boolean;
  timesRedrawn: number;
};

export type PlayersState = {
  [nickname: string]: PlayerState;
};

export type PartyGameAction =
  | { type: 'DRAW_CARDS'; cards: Card[]; resetScore: boolean }
  | { type: 'ADVANCE_ROUND'; cardToFlip: number }
  | { type: 'GAME_OVER'; cardToFlip: number }
  | { type: 'WIN_GAME' }
  | { type: 'UPDATE_PLAYER_STATE'; nickname: string; state: PlayerState };

export type PartyGameReducerState = {
  gameState: PartyGameState;
  playersState: PlayersState;
};

export const partyGameReducer = (state: PartyGameReducerState, action: PartyGameAction): PartyGameReducerState => {
  switch (action.type) {
    case 'DRAW_CARDS':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          cards: action.cards,
          hasWon: false,
          isGameOver: false,
          currentRound: 1,
          timesRedrawn: action.resetScore ? 0 : state.gameState.timesRedrawn + 1,
        },
      };
    case 'ADVANCE_ROUND':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentRound: state.gameState.currentRound + 1,
          cards: state.gameState.cards.map((card, index) =>
            index === action.cardToFlip ? { ...card, showCardBack: false } : card,
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
            index === action.cardToFlip ? { ...card, showCardBack: false } : card,
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
  const [{ gameState, playersState }, dispatch] = useReducer(partyGameReducer, {
    gameState: {
      cards: [],
      currentRound: 1,
      hasWon: false,
      isGameOver: false,
      timesRedrawn: 0,
    },
    playersState: {},
  });

  // Ref so async callbacks always read the latest state without stale closures
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Ref so the subscribe callback always calls the latest initializeGame
  // without needing to re-create the channel when the function reference changes.
  const initializeGameRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let initialized = false;

    const channel = supabase
      .channel(`party-game:${roomId}`)
      .on('broadcast', { event: 'player_action' }, ({ payload }) => {
        const { nickname: sender, newState } = payload as {
          nickname: string;
          newState: PlayerState;
        };
        if (sender !== nickname) {
          dispatch({ type: 'UPDATE_PLAYER_STATE', nickname: sender, state: newState });
        }
      })
      .subscribe(async (status) => {
        // Wait for the channel to be fully subscribed before drawing and
        // broadcasting the initial hand — send() is a no-op before this point.
        if (status === 'SUBSCRIBED' && !initialized) {
          initialized = true;
          await initializeGameRef.current?.();
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, nickname]);

  // Broadcast current state to all players in the room.
  // isCheckpoint=true also writes to DB so reconnecting players can recover.
  const broadcastAndSync = async (newState: PartyGameState, isCheckpoint: boolean) => {
    const fullState: PlayerState = { nickname, ...newState };

    await channelRef.current?.send({
      type: 'broadcast',
      event: 'player_action',
      payload: { nickname, newState: fullState },
    });

    if (isCheckpoint) {
      await supabase
        .from('party_bus_players')
        .update({ game_state: fullState })
        .eq('room_id', roomId)
        .eq('nickname', nickname);
    }
  };

  const redrawCards = async (hasWon: boolean, isInitialDraw: boolean = false) => {
    const newCards = drawCards(4);
    const current = gameStateRef.current;
    const timesRedrawn = isInitialDraw ? 0 : hasWon ? 0 : current.timesRedrawn + 1;

    const newState: PartyGameState = {
      cards: newCards,
      currentRound: 1,
      hasWon: false,
      isGameOver: false,
      timesRedrawn,
    };

    dispatch({ type: 'DRAW_CARDS', cards: newCards, resetScore: hasWon || isInitialDraw });
    await broadcastAndSync(newState, true);
  };

  const initializeGame = async () => {
    const { data: players } = await supabase
      .from('party_bus_players')
      .select('*')
      .eq('room_id', roomId);

    if (players) {
      players.forEach((player) => {
        if (player.game_state && player.nickname !== nickname) {
          dispatch({
            type: 'UPDATE_PLAYER_STATE',
            nickname: player.nickname,
            state: player.game_state as PlayerState,
          });
        }
      });
    }

    await redrawCards(false, true);
  };

  // Keep the ref current so the subscribe callback always calls the latest closure.
  initializeGameRef.current = initializeGame;

  const firstRound = async (color: RedOrBlack) => {
    const current = gameStateRef.current;
    const card = current.cards[0];
    const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
    const isCorrect = isRed === (color === 'red');

    const newState: PartyGameState = {
      ...current,
      currentRound: isCorrect ? current.currentRound + 1 : current.currentRound,
      isGameOver: !isCorrect,
      hasWon: false,
      cards: current.cards.map((c, i) => (i === 0 ? { ...c, showCardBack: false } : c)),
    };

    dispatch(
      isCorrect ? { type: 'ADVANCE_ROUND', cardToFlip: 0 } : { type: 'GAME_OVER', cardToFlip: 0 },
    );
    await broadcastAndSync(newState, !isCorrect);
  };

  const secondRound = async (guess: HigherLowerOrSame) => {
    const current = gameStateRef.current;
    const firstCard = current.cards[0];
    const secondCard = current.cards[1];

    const isHigher = secondCard.values.numericValue > firstCard.values.numericValue;
    const isLower = secondCard.values.numericValue < firstCard.values.numericValue;
    const isCorrect =
      (isHigher && guess === 'higher') ||
      (isLower && guess === 'lower') ||
      (firstCard.values.numericValue === secondCard.values.numericValue && guess === 'same');

    const newState: PartyGameState = {
      ...current,
      currentRound: isCorrect ? current.currentRound + 1 : current.currentRound,
      isGameOver: !isCorrect,
      hasWon: false,
      cards: current.cards.map((c, i) => (i === 1 ? { ...c, showCardBack: false } : c)),
    };

    dispatch(
      isCorrect ? { type: 'ADVANCE_ROUND', cardToFlip: 1 } : { type: 'GAME_OVER', cardToFlip: 1 },
    );
    await broadcastAndSync(newState, !isCorrect);
  };

  const thirdRound = async (guess: InsideOutsideOrSame) => {
    const current = gameStateRef.current;
    const firstCard = current.cards[0];
    const secondCard = current.cards[1];
    const thirdCard = current.cards[2];

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

    const newState: PartyGameState = {
      ...current,
      currentRound: isCorrect ? current.currentRound + 1 : current.currentRound,
      isGameOver: !isCorrect,
      hasWon: false,
      cards: current.cards.map((c, i) => (i === 2 ? { ...c, showCardBack: false } : c)),
    };

    dispatch(
      isCorrect ? { type: 'ADVANCE_ROUND', cardToFlip: 2 } : { type: 'GAME_OVER', cardToFlip: 2 },
    );
    await broadcastAndSync(newState, !isCorrect);
  };

  const finalRound = async (suit: string) => {
    const current = gameStateRef.current;
    const card = current.cards[3];
    const isCorrect = card.suit === suit;

    const newState: PartyGameState = {
      ...current,
      isGameOver: true,
      hasWon: isCorrect,
      cards: current.cards.map((c, i) =>
        i === 3 || isCorrect ? { ...c, showCardBack: false } : c,
      ),
    };

    dispatch(isCorrect ? { type: 'WIN_GAME' } : { type: 'GAME_OVER', cardToFlip: 3 });
    await broadcastAndSync(newState, true);
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
