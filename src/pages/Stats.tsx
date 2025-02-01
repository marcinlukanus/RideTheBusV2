import { useEffect, useState } from 'react';
import { getCardCounts } from '../api/getCardCounts';
import { CardCountBarChart } from '../components/CardCountBarChart/CardCountBarChart';
import { CardCountTable } from '../components/CardCountTable/CardCountTable';

export type CardCount = {
  card_rank: string;
  card_suit: string;
  count: number;
};

const RANK_ORDER = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
];
const SUIT_ORDER = ['CLUBS', 'DIAMONDS', 'SPADES', 'HEARTS'];

export const Stats = (): JSX.Element => {
  const [cardCounts, setCardCounts] = useState<CardCount[]>([]);
  const [sortCriteria, setSortCriteria] = useState<'rank' | 'suit' | 'count'>(
    'rank'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortCardCounts = (counts: CardCount[]) => {
    return counts.sort((a, b) => {
      if (sortCriteria === 'rank') {
        const rankComparison =
          RANK_ORDER.indexOf(a.card_rank) - RANK_ORDER.indexOf(b.card_rank);
        return sortOrder === 'asc' ? rankComparison : -rankComparison;
      } else if (sortCriteria === 'suit') {
        const suitComparison =
          SUIT_ORDER.indexOf(a.card_suit) - SUIT_ORDER.indexOf(b.card_suit);
        if (suitComparison !== 0) {
          return suitComparison;
        } else {
          const rankComparison =
            RANK_ORDER.indexOf(a.card_rank) - RANK_ORDER.indexOf(b.card_rank);
          return sortOrder === 'asc' ? rankComparison : -rankComparison;
        }
      } else if (sortCriteria === 'count') {
        return sortOrder === 'asc' ? a.count - b.count : b.count - a.count;
      } else {
        if (sortOrder === 'asc') {
          const suitComparison =
            SUIT_ORDER.indexOf(a.card_suit) - SUIT_ORDER.indexOf(b.card_suit);
          return suitComparison !== 0
            ? suitComparison
            : a.card_rank.localeCompare(b.card_rank);
        } else {
          const suitComparison =
            SUIT_ORDER.indexOf(b.card_suit) - SUIT_ORDER.indexOf(a.card_suit);
          return suitComparison !== 0
            ? suitComparison
            : a.card_rank.localeCompare(b.card_rank);
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

  useEffect(() => {
    const fetchCardCounts = async () => {
      const counts = await getCardCounts();
      setCardCounts(sortCardCounts(counts));
    };

    fetchCardCounts();
  }, []);

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Card Counts</h1>

      <CardCountBarChart cardCounts={sortedCardCounts} />

      <div className='my-6 flex gap-3 justify-center'>
        <button
          className='py-2 px-4 mr-2 bg-blue-500 text-white rounded hover:cursor-pointer hover:bg-blue-400'
          onClick={() => setSortCriteria('rank')}
        >
          Sort by Rank
        </button>
        <button
          className='py-2 px-4 mr-2 bg-blue-500 text-white rounded hover:cursor-pointer hover:bg-blue-400'
          onClick={() => setSortCriteria('suit')}
        >
          Sort by Suit
        </button>
        <button
          className='py-2 px-4 mr-2 bg-blue-500 text-white rounded hover:cursor-pointer hover:bg-blue-400'
          onClick={() => setSortCriteria('count')}
        >
          Sort by Count
        </button>
        <button
          className='py-2 px-4 bg-blue-500 text-white rounded hover:cursor-pointer hover:bg-blue-400'
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      <CardCountTable cardCounts={sortedCardCounts} />
    </div>
  );
};
