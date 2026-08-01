// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { partyGameReducer } from './usePartyGameState';
import type { PartyGameReducerState } from './usePartyGameState';
import type { Card } from '../Game/useGameState';

const card = (suit: Card['suit'], numericValue: number): Card => ({
  suit,
  values: { rank: String(numericValue), numericValue },
  showCardBack: true,
});

const HEARTS_5 = card('HEARTS', 5);
const CLUBS_8 = card('CLUBS', 8);
const DIAMONDS_3 = card('DIAMONDS', 3);
const SPADES_K = card('SPADES', 13);

const baseState: PartyGameReducerState = {
  gameState: {
    cards: [HEARTS_5, CLUBS_8, DIAMONDS_3, SPADES_K],
    currentRound: 2,
    hasWon: false,
    isGameOver: false,
    timesRedrawn: 1,
  },
  playersState: {},
};

// ─── DRAW_CARDS ──────────────────────────────────────────────────────────────

describe('partyGameReducer — DRAW_CARDS', () => {
  const newCards = [card('SPADES', 2), card('HEARTS', 7), card('CLUBS', 10), card('DIAMONDS', 9)];

  it('uses the provided cards exactly (does not re-generate)', () => {
    const next = partyGameReducer(baseState, { type: 'DRAW_CARDS', cards: newCards, resetScore: false });
    expect(next.gameState.cards).toStrictEqual(newCards);
  });

  it('resets currentRound to 1', () => {
    const next = partyGameReducer(baseState, { type: 'DRAW_CARDS', cards: newCards, resetScore: false });
    expect(next.gameState.currentRound).toBe(1);
  });

  it('clears hasWon', () => {
    const won = { ...baseState, gameState: { ...baseState.gameState, hasWon: true } };
    const next = partyGameReducer(won, { type: 'DRAW_CARDS', cards: newCards, resetScore: false });
    expect(next.gameState.hasWon).toBe(false);
  });

  it('clears isGameOver', () => {
    const over = { ...baseState, gameState: { ...baseState.gameState, isGameOver: true } };
    const next = partyGameReducer(over, { type: 'DRAW_CARDS', cards: newCards, resetScore: false });
    expect(next.gameState.isGameOver).toBe(false);
  });

  it('increments timesRedrawn by 1 when resetScore is false', () => {
    const next = partyGameReducer(baseState, { type: 'DRAW_CARDS', cards: newCards, resetScore: false });
    expect(next.gameState.timesRedrawn).toBe(2);
  });

  it('resets timesRedrawn to 0 when resetScore is true', () => {
    const next = partyGameReducer(baseState, { type: 'DRAW_CARDS', cards: newCards, resetScore: true });
    expect(next.gameState.timesRedrawn).toBe(0);
  });

  it('does not modify playersState', () => {
    const withPlayers = {
      ...baseState,
      playersState: {
        Bob: { nickname: 'Bob', cards: [], currentRound: 1, hasWon: false, isGameOver: false, timesRedrawn: 0 },
      },
    };
    const next = partyGameReducer(withPlayers, { type: 'DRAW_CARDS', cards: newCards, resetScore: false });
    expect(next.playersState).toStrictEqual(withPlayers.playersState);
  });
});

// ─── ADVANCE_ROUND ───────────────────────────────────────────────────────────

describe('partyGameReducer — ADVANCE_ROUND', () => {
  it('increments currentRound by 1', () => {
    const next = partyGameReducer(baseState, { type: 'ADVANCE_ROUND', cardToFlip: 0 });
    expect(next.gameState.currentRound).toBe(3);
  });

  it('flips the specified card face-up', () => {
    const next = partyGameReducer(baseState, { type: 'ADVANCE_ROUND', cardToFlip: 1 });
    expect(next.gameState.cards[1].showCardBack).toBe(false);
  });

  it('leaves all other cards face-down', () => {
    const next = partyGameReducer(baseState, { type: 'ADVANCE_ROUND', cardToFlip: 1 });
    expect(next.gameState.cards[0].showCardBack).toBe(true);
    expect(next.gameState.cards[2].showCardBack).toBe(true);
    expect(next.gameState.cards[3].showCardBack).toBe(true);
  });

  it('does not set isGameOver', () => {
    const next = partyGameReducer(baseState, { type: 'ADVANCE_ROUND', cardToFlip: 0 });
    expect(next.gameState.isGameOver).toBe(false);
  });
});

// ─── GAME_OVER ────────────────────────────────────────────────────────────────

describe('partyGameReducer — GAME_OVER', () => {
  it('sets isGameOver to true', () => {
    const next = partyGameReducer(baseState, { type: 'GAME_OVER', cardToFlip: 0 });
    expect(next.gameState.isGameOver).toBe(true);
  });

  it('sets hasWon to false', () => {
    const next = partyGameReducer(baseState, { type: 'GAME_OVER', cardToFlip: 0 });
    expect(next.gameState.hasWon).toBe(false);
  });

  it('flips the specified card face-up', () => {
    const next = partyGameReducer(baseState, { type: 'GAME_OVER', cardToFlip: 2 });
    expect(next.gameState.cards[2].showCardBack).toBe(false);
  });

  it('leaves all other cards face-down', () => {
    const next = partyGameReducer(baseState, { type: 'GAME_OVER', cardToFlip: 2 });
    expect(next.gameState.cards[0].showCardBack).toBe(true);
    expect(next.gameState.cards[1].showCardBack).toBe(true);
    expect(next.gameState.cards[3].showCardBack).toBe(true);
  });

  it('does not change currentRound', () => {
    const next = partyGameReducer(baseState, { type: 'GAME_OVER', cardToFlip: 0 });
    expect(next.gameState.currentRound).toBe(baseState.gameState.currentRound);
  });
});

// ─── WIN_GAME ─────────────────────────────────────────────────────────────────

describe('partyGameReducer — WIN_GAME', () => {
  it('sets hasWon to true', () => {
    const next = partyGameReducer(baseState, { type: 'WIN_GAME' });
    expect(next.gameState.hasWon).toBe(true);
  });

  it('sets isGameOver to true', () => {
    const next = partyGameReducer(baseState, { type: 'WIN_GAME' });
    expect(next.gameState.isGameOver).toBe(true);
  });

  it('flips all cards face-up', () => {
    const next = partyGameReducer(baseState, { type: 'WIN_GAME' });
    expect(next.gameState.cards.every((c) => c.showCardBack === false)).toBe(true);
  });
});

// ─── UPDATE_PLAYER_STATE ─────────────────────────────────────────────────────

describe('partyGameReducer — UPDATE_PLAYER_STATE', () => {
  const bobState = {
    nickname: 'Bob',
    cards: [card('CLUBS', 3)],
    currentRound: 3,
    hasWon: false,
    isGameOver: false,
    timesRedrawn: 2,
  };

  it('adds a new player to playersState', () => {
    const next = partyGameReducer(baseState, {
      type: 'UPDATE_PLAYER_STATE',
      nickname: 'Bob',
      state: bobState,
    });
    expect(next.playersState['Bob']).toStrictEqual(bobState);
  });

  it('overwrites an existing player entry', () => {
    const withBob = {
      ...baseState,
      playersState: { Bob: { ...bobState, currentRound: 1 } },
    };
    const next = partyGameReducer(withBob, {
      type: 'UPDATE_PLAYER_STATE',
      nickname: 'Bob',
      state: bobState,
    });
    expect(next.playersState['Bob'].currentRound).toBe(3);
  });

  it('does not affect other players already in playersState', () => {
    const alice = { nickname: 'Alice', cards: [], currentRound: 2, hasWon: false, isGameOver: false, timesRedrawn: 0 };
    const withAlice = { ...baseState, playersState: { Alice: alice } };
    const next = partyGameReducer(withAlice, {
      type: 'UPDATE_PLAYER_STATE',
      nickname: 'Bob',
      state: bobState,
    });
    expect(next.playersState['Alice']).toStrictEqual(alice);
  });

  it('does not modify gameState', () => {
    const next = partyGameReducer(baseState, {
      type: 'UPDATE_PLAYER_STATE',
      nickname: 'Bob',
      state: bobState,
    });
    expect(next.gameState).toStrictEqual(baseState.gameState);
  });
});
