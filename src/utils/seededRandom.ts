type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';

type Value = {
  rank: string;
  numericValue: number;
};

export type Card = {
  suit: Suit;
  values: Value;
  showCardBack: boolean;
};

const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
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

/**
 * Mulberry32 - A simple and fast seeded PRNG
 * Returns a function that generates random numbers between 0 and 1
 */
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a full deck of 52 cards
 */
const generateDeck = (): Omit<Card, 'showCardBack'>[] =>
  suits.flatMap((suit) => values.map((value) => ({ suit, values: value })));

/**
 * Draw cards deterministically based on a seed and draw number
 * Each draw number produces a unique but reproducible set of 4 cards
 */
export function drawSeededCards(seed: number, drawNumber: number): Card[] {
  // Create a unique seed for this specific draw by combining base seed with draw number
  const drawSeed = seed + drawNumber * 7919; // Using a prime number for better distribution
  const rng = mulberry32(drawSeed);

  const deck = generateDeck();
  const selectedCards: Card[] = [];

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(rng() * deck.length);
    selectedCards.push({ ...deck[randomIndex], showCardBack: true });
    deck.splice(randomIndex, 1);
  }

  return selectedCards;
}

/**
 * Get today's date string in YYYY-MM-DD format (UTC)
 */
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
