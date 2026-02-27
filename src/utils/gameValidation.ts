import { Card } from './seededRandom';

export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
export type RedOrBlack = 'red' | 'black';
export type HigherLowerOrSame = 'higher' | 'lower' | 'same';
export type InsideOutsideOrSame = 'inside' | 'outside' | 'same';

export function validateFirstRound(card: Card, guess: RedOrBlack): boolean {
  const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
  return isRed === (guess === 'red');
}

export function validateSecondRound(card1: Card, card2: Card, guess: HigherLowerOrSame): boolean {
  const isHigher = card2.values.numericValue > card1.values.numericValue;
  const isLower = card2.values.numericValue < card1.values.numericValue;
  return (
    (isHigher && guess === 'higher') ||
    (isLower && guess === 'lower') ||
    (card1.values.numericValue === card2.values.numericValue && guess === 'same')
  );
}

export function validateThirdRound(
  card1: Card,
  card2: Card,
  card3: Card,
  guess: InsideOutsideOrSame,
): boolean {
  const isInside =
    Math.min(card1.values.numericValue, card2.values.numericValue) <
      card3.values.numericValue &&
    card3.values.numericValue <
      Math.max(card1.values.numericValue, card2.values.numericValue);

  const isOutside =
    (card3.values.numericValue > card1.values.numericValue &&
      card3.values.numericValue > card2.values.numericValue) ||
    (card3.values.numericValue < card1.values.numericValue &&
      card3.values.numericValue < card2.values.numericValue);

  const isSame =
    card1.values.numericValue === card3.values.numericValue ||
    card2.values.numericValue === card3.values.numericValue;

  return (
    (isInside && guess === 'inside') ||
    (isOutside && guess === 'outside') ||
    (isSame && guess === 'same')
  );
}

export function validateFinalRound(card: Card, guess: Suit): boolean {
  return card.suit === guess;
}
