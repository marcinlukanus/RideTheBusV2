// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { gameReducer, initialGameState, GameState } from './useGameState';

const stateWithCards: GameState = {
  cards: [
    { suit: 'HEARTS', values: { rank: '5', numericValue: 5 }, showCardBack: true },
    { suit: 'CLUBS', values: { rank: '8', numericValue: 8 }, showCardBack: true },
    { suit: 'DIAMONDS', values: { rank: '3', numericValue: 3 }, showCardBack: true },
    { suit: 'SPADES', values: { rank: 'K', numericValue: 13 }, showCardBack: true },
  ],
  currentRound: 2,
  hasWon: false,
  isGameOver: false,
  timesRedrawn: 0,
};

describe('initialGameState', () => {
  it('starts with empty cards array', () => {
    expect(initialGameState.cards).toEqual([]);
  });

  it('starts at round 1', () => {
    expect(initialGameState.currentRound).toBe(1);
  });

  it('starts with hasWon false', () => {
    expect(initialGameState.hasWon).toBe(false);
  });

  it('starts with isGameOver false', () => {
    expect(initialGameState.isGameOver).toBe(false);
  });

  it('starts with timesRedrawn -1', () => {
    expect(initialGameState.timesRedrawn).toBe(-1);
  });
});

describe('gameReducer — DRAW_CARDS', () => {
  it('resets currentRound to 1', () => {
    const next = gameReducer(stateWithCards, { type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
    expect(next.currentRound).toBe(1);
  });

  it('sets hasWon to false', () => {
    const wonState = { ...stateWithCards, hasWon: true };
    const next = gameReducer(wonState, { type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
    expect(next.hasWon).toBe(false);
  });

  it('sets isGameOver to false', () => {
    const overState = { ...stateWithCards, isGameOver: true };
    const next = gameReducer(overState, { type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
    expect(next.isGameOver).toBe(false);
  });

  it('increments timesRedrawn by 1', () => {
    const next = gameReducer(stateWithCards, { type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
    expect(next.timesRedrawn).toBe(1);
  });

  it('resets timesRedrawn to 0 when resetScore is true', () => {
    const next = gameReducer(stateWithCards, { type: 'DRAW_CARDS', amountToDraw: 4, resetScore: true });
    expect(next.timesRedrawn).toBe(0);
  });

  it('draws the requested number of cards', () => {
    const next = gameReducer(stateWithCards, { type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
    expect(next.cards).toHaveLength(4);
  });

  it('all drawn cards have showCardBack true', () => {
    const next = gameReducer(stateWithCards, { type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
    expect(next.cards.every((c) => c.showCardBack)).toBe(true);
  });
});

describe('gameReducer — ADVANCE_ROUND', () => {
  it('increments currentRound by 1', () => {
    const next = gameReducer(stateWithCards, { type: 'ADVANCE_ROUND', cardToFlip: 0 });
    expect(next.currentRound).toBe(3);
  });

  it('flips the card at the given index face-up', () => {
    const next = gameReducer(stateWithCards, { type: 'ADVANCE_ROUND', cardToFlip: 1 });
    expect(next.cards[1].showCardBack).toBe(false);
  });

  it('leaves other cards untouched', () => {
    const next = gameReducer(stateWithCards, { type: 'ADVANCE_ROUND', cardToFlip: 1 });
    expect(next.cards[0].showCardBack).toBe(true);
    expect(next.cards[2].showCardBack).toBe(true);
    expect(next.cards[3].showCardBack).toBe(true);
  });

  it('does not set isGameOver', () => {
    const next = gameReducer(stateWithCards, { type: 'ADVANCE_ROUND', cardToFlip: 0 });
    expect(next.isGameOver).toBe(false);
  });
});

describe('gameReducer — GAME_OVER', () => {
  it('sets isGameOver to true', () => {
    const next = gameReducer(stateWithCards, { type: 'GAME_OVER', cardToFlip: 2 });
    expect(next.isGameOver).toBe(true);
  });

  it('sets hasWon to false', () => {
    const next = gameReducer(stateWithCards, { type: 'GAME_OVER', cardToFlip: 2 });
    expect(next.hasWon).toBe(false);
  });

  it('flips the card at the given index face-up', () => {
    const next = gameReducer(stateWithCards, { type: 'GAME_OVER', cardToFlip: 2 });
    expect(next.cards[2].showCardBack).toBe(false);
  });

  it('leaves other cards untouched', () => {
    const next = gameReducer(stateWithCards, { type: 'GAME_OVER', cardToFlip: 2 });
    expect(next.cards[0].showCardBack).toBe(true);
    expect(next.cards[1].showCardBack).toBe(true);
    expect(next.cards[3].showCardBack).toBe(true);
  });

  it('does not change currentRound', () => {
    const next = gameReducer(stateWithCards, { type: 'GAME_OVER', cardToFlip: 0 });
    expect(next.currentRound).toBe(stateWithCards.currentRound);
  });
});

describe('gameReducer — WIN_GAME', () => {
  it('sets hasWon to true', () => {
    const next = gameReducer(stateWithCards, { type: 'WIN_GAME' });
    expect(next.hasWon).toBe(true);
  });

  it('sets isGameOver to true', () => {
    const next = gameReducer(stateWithCards, { type: 'WIN_GAME' });
    expect(next.isGameOver).toBe(true);
  });

  it('flips all cards face-up', () => {
    const next = gameReducer(stateWithCards, { type: 'WIN_GAME' });
    expect(next.cards.every((c) => c.showCardBack === false)).toBe(true);
  });
});
