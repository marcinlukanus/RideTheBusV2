// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePartyGameState } from './usePartyGameState';
import type { PlayerState } from './usePartyGameState';

// ─── Supabase mock ────────────────────────────────────────────────────────────
// vi.hoisted runs before vi.mock factories (both are hoisted), letting us share
// mock objects across the factory boundary without the usual closure restrictions.

const { mockSend, mockUpdate, mockChannelInstance, triggerBroadcast } = vi.hoisted(() => {
  const mockSend = vi.fn().mockResolvedValue('ok');
  const mockUpdate = vi.fn();

  let capturedBroadcastCb: ((e: { payload: unknown }) => void) | null = null;

  const mockChannelInstance = {
    on: vi.fn().mockImplementation(function (
      this: object,
      _type: string,
      _event: object,
      cb: (e: { payload: unknown }) => void,
    ) {
      capturedBroadcastCb = cb;
      return this;
    }),
    subscribe: vi.fn().mockImplementation(function (this: object) {
      return this;
    }),
    send: mockSend,
  };

  // Builds a chainable Supabase query builder that resolves to { data, error }.
  const makeBuilder = (data: unknown = null) => {
    type Builder = {
      select: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      then: (resolve: (v: { data: unknown; error: null }) => unknown, reject?: (e: unknown) => unknown) => Promise<unknown>;
      catch: (reject: (e: unknown) => unknown) => Promise<unknown>;
      finally: (cb: () => void) => Promise<unknown>;
    };
    const b: Builder = {
      select: vi.fn(),
      eq: vi.fn(),
      update: vi.fn(),
      then: (resolve, reject) => Promise.resolve({ data, error: null }).then(resolve, reject),
      catch: (reject) => Promise.resolve({ data, error: null }).catch(reject),
      finally: (cb) => Promise.resolve({ data, error: null }).finally(cb),
    };
    b.select.mockReturnValue(b);
    b.eq.mockReturnValue(b);
    b.update.mockImplementation(() => {
      mockUpdate();
      return b;
    });
    return b;
  };

  return {
    mockSend,
    mockUpdate,
    mockChannelInstance,
    triggerBroadcast: (payload: unknown) => capturedBroadcastCb?.({ payload }),
    makeBuilder,
  };
});

vi.mock('../../utils/supabase', () => ({
  default: {
    channel: vi.fn(() => mockChannelInstance),
    removeChannel: vi.fn(),
    from: vi.fn(() => {
      const b = {
        select: vi.fn(),
        eq: vi.fn(),
        update: vi.fn(),
        then: (resolve: (v: { data: unknown; error: null }) => unknown, reject?: (e: unknown) => unknown) =>
          Promise.resolve({ data: [], error: null }).then(resolve, reject),
        catch: (reject: (e: unknown) => unknown) =>
          Promise.resolve({ data: [], error: null }).catch(reject),
        finally: (cb: () => void) =>
          Promise.resolve({ data: [], error: null }).finally(cb),
      };
      b.select.mockReturnValue(b);
      b.eq.mockReturnValue(b);
      b.update.mockImplementation(() => {
        mockUpdate();
        return b;
      });
      return b;
    }),
  },
}));

// Import after vi.mock so we get the mocked version
import supabase from '../../utils/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROOM_ID = 'room-abc';
const NICKNAME = 'Alice';

const bobState: PlayerState = {
  nickname: 'Bob',
  cards: [{ suit: 'CLUBS', values: { rank: '5', numericValue: 5 }, showCardBack: false }],
  currentRound: 2,
  hasWon: false,
  isGameOver: false,
  timesRedrawn: 0,
};

// ─── Channel subscription ─────────────────────────────────────────────────────

describe('broadcast subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to the party-game channel on mount', () => {
    renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));
    expect(vi.mocked(supabase).channel).toHaveBeenCalledWith(`party-game:${ROOM_ID}`);
  });

  it('adds other players to playersState when a broadcast arrives', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      triggerBroadcast({ nickname: 'Bob', newState: bobState });
    });

    expect(result.current.playersState['Bob']).toStrictEqual(bobState);
  });

  it('ignores broadcast events from the local player', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      triggerBroadcast({ nickname: NICKNAME, newState: bobState });
    });

    expect(result.current.playersState[NICKNAME]).toBeUndefined();
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));
    unmount();
    expect(vi.mocked(supabase).removeChannel).toHaveBeenCalledWith(mockChannelInstance);
  });
});

// ─── redrawCards ──────────────────────────────────────────────────────────────

describe('redrawCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('always broadcasts the new state', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false);
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'broadcast', event: 'player_action' }),
    );
  });

  it('always writes to the DB as a checkpoint', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false);
    });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('increments timesRedrawn when not initial draw', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, false);
    });

    expect(result.current.gameState.timesRedrawn).toBe(1);
  });

  it('keeps timesRedrawn at 0 for initial draw', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    expect(result.current.gameState.timesRedrawn).toBe(0);
  });

  it('draws exactly 4 cards', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    expect(result.current.gameState.cards).toHaveLength(4);
  });

  it('all drawn cards start face-down', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    expect(result.current.gameState.cards.every((c) => c.showCardBack === true)).toBe(true);
  });
});

// ─── firstRound ───────────────────────────────────────────────────────────────

describe('firstRound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('advances round and only broadcasts (no DB write) on a correct guess', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    const firstCard = result.current.gameState.cards[0];
    const isRed = firstCard.suit === 'HEARTS' || firstCard.suit === 'DIAMONDS';
    const correctGuess = isRed ? 'red' : 'black';

    const sendCallsBefore = mockSend.mock.calls.length;
    const updateCallsBefore = mockUpdate.mock.calls.length;

    await act(async () => {
      await result.current.firstRound(correctGuess);
    });

    expect(mockSend.mock.calls.length).toBe(sendCallsBefore + 1);
    expect(mockUpdate.mock.calls.length).toBe(updateCallsBefore); // no DB write
    expect(result.current.gameState.currentRound).toBe(2);
    expect(result.current.gameState.isGameOver).toBe(false);
  });

  it('sets game over and writes to DB on a wrong guess', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    const firstCard = result.current.gameState.cards[0];
    const isRed = firstCard.suit === 'HEARTS' || firstCard.suit === 'DIAMONDS';
    const wrongGuess = isRed ? 'black' : 'red';

    const updateCallsBefore = mockUpdate.mock.calls.length;

    await act(async () => {
      await result.current.firstRound(wrongGuess);
    });

    expect(result.current.gameState.isGameOver).toBe(true);
    expect(result.current.gameState.hasWon).toBe(false);
    expect(mockUpdate.mock.calls.length).toBeGreaterThan(updateCallsBefore);
  });
});

// ─── finalRound ───────────────────────────────────────────────────────────────

describe('finalRound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets hasWon and writes to DB on a correct suit guess', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    const fourthCard = result.current.gameState.cards[3];
    const updateCallsBefore = mockUpdate.mock.calls.length;

    await act(async () => {
      await result.current.finalRound(fourthCard.suit);
    });

    expect(result.current.gameState.hasWon).toBe(true);
    expect(result.current.gameState.isGameOver).toBe(true);
    expect(mockUpdate.mock.calls.length).toBeGreaterThan(updateCallsBefore);
  });

  it('sets game over without win and writes to DB on a wrong suit guess', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    const fourthCard = result.current.gameState.cards[3];
    const wrongSuit = (['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] as const).find(
      (s) => s !== fourthCard.suit,
    )!;
    const updateCallsBefore = mockUpdate.mock.calls.length;

    await act(async () => {
      await result.current.finalRound(wrongSuit);
    });

    expect(result.current.gameState.hasWon).toBe(false);
    expect(result.current.gameState.isGameOver).toBe(true);
    expect(mockUpdate.mock.calls.length).toBeGreaterThan(updateCallsBefore);
  });

  it('flips all cards face-up on a win', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    const fourthCard = result.current.gameState.cards[3];

    await act(async () => {
      await result.current.finalRound(fourthCard.suit);
    });

    expect(result.current.gameState.cards.every((c) => c.showCardBack === false)).toBe(true);
  });
});

// ─── Broadcast payload shape ──────────────────────────────────────────────────

describe('broadcast payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes the local nickname in every broadcast', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    const sentPayload = mockSend.mock.calls[0]?.[0];
    expect(sentPayload?.payload?.nickname).toBe(NICKNAME);
  });

  it('broadcast newState cards match local gameState after a draw', async () => {
    const { result } = renderHook(() => usePartyGameState(ROOM_ID, NICKNAME));

    await act(async () => {
      await result.current.redrawCards(false, true);
    });

    const sentPayload = mockSend.mock.calls[0]?.[0];
    expect(sentPayload?.payload?.newState?.cards).toStrictEqual(result.current.gameState.cards);
  });
});
