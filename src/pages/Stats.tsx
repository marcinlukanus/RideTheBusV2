import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCardCounts } from '../api/getCardCounts';
import { CardCountBarChart } from '../components/CardCountBarChart/CardCountBarChart';
import { CardCountTable } from '../components/CardCountTable/CardCountTable';
import { queryKeys } from '../lib/queryKeys';

export type CardCount = {
  card_rank: string;
  card_suit: string;
  count: number;
};

const RANK_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_ORDER = ['CLUBS', 'DIAMONDS', 'SPADES', 'HEARTS'];

export const Stats = (): JSX.Element => {
  const [sortCriteria, setSortCriteria] = useState<'rank' | 'suit' | 'count'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: cardCounts = [] } = useQuery({
    queryKey: queryKeys.cardCounts,
    queryFn: getCardCounts,
  });

  const sortCardCounts = (counts: CardCount[]) => {
    return counts.sort((a, b) => {
      if (sortCriteria === 'rank') {
        const rankComparison = RANK_ORDER.indexOf(a.card_rank) - RANK_ORDER.indexOf(b.card_rank);
        return sortOrder === 'asc' ? rankComparison : -rankComparison;
      } else if (sortCriteria === 'suit') {
        const suitComparison = SUIT_ORDER.indexOf(a.card_suit) - SUIT_ORDER.indexOf(b.card_suit);
        if (suitComparison !== 0) {
          return suitComparison;
        } else {
          const rankComparison = RANK_ORDER.indexOf(a.card_rank) - RANK_ORDER.indexOf(b.card_rank);
          return sortOrder === 'asc' ? rankComparison : -rankComparison;
        }
      } else if (sortCriteria === 'count') {
        return sortOrder === 'asc' ? a.count - b.count : b.count - a.count;
      } else {
        if (sortOrder === 'asc') {
          const suitComparison = SUIT_ORDER.indexOf(a.card_suit) - SUIT_ORDER.indexOf(b.card_suit);
          return suitComparison !== 0 ? suitComparison : a.card_rank.localeCompare(b.card_rank);
        } else {
          const suitComparison = SUIT_ORDER.indexOf(b.card_suit) - SUIT_ORDER.indexOf(a.card_suit);
          return suitComparison !== 0 ? suitComparison : a.card_rank.localeCompare(b.card_rank);
        }
      }
    });
  };

  const sortedCardCounts = sortCardCounts([...cardCounts]).map((cardCount) => {
    return {
      ...cardCount,
      name: `${cardCount.card_rank} of ${cardCount.card_suit}`,
    };
  });

  return (
    <div className="p-4">
      <title>Ride The Bus Card Counts</title>
      <link rel="canonical" href="https://ridethebus.party/stats" />
      <meta
        name="description"
        content="Explore card distribution and stats for Ride The Bus. See counts and probabilities to improve your strategy."
      />
      <h1 className="mb-4 text-2xl font-bold">Card Counts</h1>

      <CardCountBarChart cardCounts={sortedCardCounts} />

      <div className="my-6 flex justify-center gap-3">
        <button
          className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-400"
          onClick={() => setSortCriteria('rank')}
        >
          Sort by Rank
        </button>
        <button
          className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-400"
          onClick={() => setSortCriteria('suit')}
        >
          Sort by Suit
        </button>
        <button
          className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-400"
          onClick={() => setSortCriteria('count')}
        >
          Sort by Count
        </button>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-400"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      <CardCountTable cardCounts={sortedCardCounts} />
    </div>
  );
};
