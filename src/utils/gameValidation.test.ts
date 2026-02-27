// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  validateFirstRound,
  validateSecondRound,
  validateThirdRound,
  validateFinalRound,
  Suit,
} from './gameValidation';
import { Card } from './seededRandom';

function card(suit: Suit, numericValue: number): Card {
  return { suit, values: { rank: String(numericValue), numericValue }, showCardBack: false };
}

describe('validateFirstRound', () => {
  it('returns true for HEARTS with red guess', () => {
    expect(validateFirstRound(card('HEARTS', 5), 'red')).toBe(true);
  });

  it('returns true for DIAMONDS with red guess', () => {
    expect(validateFirstRound(card('DIAMONDS', 5), 'red')).toBe(true);
  });

  it('returns true for CLUBS with black guess', () => {
    expect(validateFirstRound(card('CLUBS', 5), 'black')).toBe(true);
  });

  it('returns true for SPADES with black guess', () => {
    expect(validateFirstRound(card('SPADES', 5), 'black')).toBe(true);
  });

  it('returns false for HEARTS with black guess', () => {
    expect(validateFirstRound(card('HEARTS', 5), 'black')).toBe(false);
  });

  it('returns false for DIAMONDS with black guess', () => {
    expect(validateFirstRound(card('DIAMONDS', 5), 'black')).toBe(false);
  });

  it('returns false for CLUBS with red guess', () => {
    expect(validateFirstRound(card('CLUBS', 5), 'red')).toBe(false);
  });

  it('returns false for SPADES with red guess', () => {
    expect(validateFirstRound(card('SPADES', 5), 'red')).toBe(false);
  });
});

describe('validateSecondRound', () => {
  it('returns true when card2 is higher and guess is higher', () => {
    expect(validateSecondRound(card('HEARTS', 5), card('CLUBS', 8), 'higher')).toBe(true);
  });

  it('returns true when card2 is lower and guess is lower', () => {
    expect(validateSecondRound(card('HEARTS', 8), card('CLUBS', 5), 'lower')).toBe(true);
  });

  it('returns true when cards are equal and guess is same', () => {
    expect(validateSecondRound(card('HEARTS', 7), card('CLUBS', 7), 'same')).toBe(true);
  });

  it('returns false when card2 is higher but guess is lower', () => {
    expect(validateSecondRound(card('HEARTS', 5), card('CLUBS', 8), 'lower')).toBe(false);
  });

  it('returns false when card2 is lower but guess is higher', () => {
    expect(validateSecondRound(card('HEARTS', 8), card('CLUBS', 5), 'higher')).toBe(false);
  });

  it('returns false when cards are equal but guess is higher', () => {
    expect(validateSecondRound(card('HEARTS', 7), card('CLUBS', 7), 'higher')).toBe(false);
  });

  it('returns false when cards are equal but guess is lower', () => {
    expect(validateSecondRound(card('HEARTS', 7), card('CLUBS', 7), 'lower')).toBe(false);
  });

  it('returns false when card2 is higher but guess is same', () => {
    expect(validateSecondRound(card('HEARTS', 5), card('CLUBS', 8), 'same')).toBe(false);
  });

  it('Ace (14) is treated as highest', () => {
    expect(validateSecondRound(card('HEARTS', 13), card('CLUBS', 14), 'higher')).toBe(true);
  });

  it('2 is treated as lowest', () => {
    expect(validateSecondRound(card('HEARTS', 3), card('CLUBS', 2), 'lower')).toBe(true);
  });

  it('returns false for wrong same guess when cards differ', () => {
    expect(validateSecondRound(card('HEARTS', 5), card('CLUBS', 6), 'same')).toBe(false);
  });
});

describe('validateThirdRound', () => {
  it('returns true when card3 is strictly inside', () => {
    expect(validateThirdRound(card('HEARTS', 3), card('CLUBS', 10), card('DIAMONDS', 7), 'inside')).toBe(true);
  });

  it('returns true when card3 is outside below both', () => {
    expect(validateThirdRound(card('HEARTS', 5), card('CLUBS', 10), card('DIAMONDS', 2), 'outside')).toBe(true);
  });

  it('returns true when card3 is outside above both', () => {
    expect(validateThirdRound(card('HEARTS', 3), card('CLUBS', 8), card('DIAMONDS', 11), 'outside')).toBe(true);
  });

  it('returns true when card3 equals lower boundary (same)', () => {
    expect(validateThirdRound(card('HEARTS', 3), card('CLUBS', 10), card('DIAMONDS', 3), 'same')).toBe(true);
  });

  it('returns true when card3 equals upper boundary (same)', () => {
    expect(validateThirdRound(card('HEARTS', 3), card('CLUBS', 10), card('DIAMONDS', 10), 'same')).toBe(true);
  });

  it('returns false when card3 is inside but guess is outside', () => {
    expect(validateThirdRound(card('HEARTS', 3), card('CLUBS', 10), card('DIAMONDS', 7), 'outside')).toBe(false);
  });

  it('returns false when card3 is outside but guess is inside', () => {
    expect(validateThirdRound(card('HEARTS', 5), card('CLUBS', 10), card('DIAMONDS', 2), 'inside')).toBe(false);
  });

  it('handles card1 > card2 order correctly for inside', () => {
    expect(validateThirdRound(card('HEARTS', 10), card('CLUBS', 3), card('DIAMONDS', 7), 'inside')).toBe(true);
  });

  it('returns false when card3 is on lower boundary but guess is inside', () => {
    expect(validateThirdRound(card('HEARTS', 3), card('CLUBS', 10), card('DIAMONDS', 3), 'inside')).toBe(false);
  });

  it('returns false when card3 is on upper boundary but guess is inside', () => {
    expect(validateThirdRound(card('HEARTS', 3), card('CLUBS', 10), card('DIAMONDS', 10), 'inside')).toBe(false);
  });
});

describe('validateFinalRound', () => {
  it('returns true when suit matches HEARTS', () => {
    expect(validateFinalRound(card('HEARTS', 5), 'HEARTS')).toBe(true);
  });

  it('returns true when suit matches DIAMONDS', () => {
    expect(validateFinalRound(card('DIAMONDS', 5), 'DIAMONDS')).toBe(true);
  });

  it('returns true when suit matches CLUBS', () => {
    expect(validateFinalRound(card('CLUBS', 5), 'CLUBS')).toBe(true);
  });

  it('returns true when suit matches SPADES', () => {
    expect(validateFinalRound(card('SPADES', 5), 'SPADES')).toBe(true);
  });

  it('returns false when suit does not match', () => {
    expect(validateFinalRound(card('HEARTS', 5), 'CLUBS')).toBe(false);
  });

  it('returns false when suit does not match (SPADES vs HEARTS)', () => {
    expect(validateFinalRound(card('SPADES', 5), 'HEARTS')).toBe(false);
  });
});
