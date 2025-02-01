import { useState } from 'react';
import { BarChart, YAxis, Bar, XAxis, Tooltip } from 'recharts';
import { CardCount } from '../../pages/Stats';

type CardCountBarChartProps = {
  cardCounts: CardCount[];
};

const rankOrder = [
  'A',
  'K',
  'Q',
  'J',
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
];

export const CardCountBarChart = ({ cardCounts }: CardCountBarChartProps) => {
  const [sortCriteria, setSortCriteria] = useState<'rank' | 'suit'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortCardCounts = (counts: CardCount[]) => {
    return counts.sort((a, b) => {
      if (sortCriteria === 'rank') {
        const rankComparison =
          rankOrder.indexOf(a.card_rank) - rankOrder.indexOf(b.card_rank);
        return sortOrder === 'asc' ? rankComparison : -rankComparison;
      } else {
        if (sortOrder === 'asc') {
          return a.card_suit.localeCompare(b.card_suit);
        } else {
          return b.card_suit.localeCompare(a.card_suit);
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
    <div className='flex flex-col items-center'>
      <BarChart
        width={1200}
        height={600}
        data={sortedCardCounts}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey='name' hide />
        <YAxis />
        <Tooltip labelStyle={{ color: 'black' }} />
        <Bar
          dataKey='count'
          fill='#8884d8'
          label={{ fill: 'black', fontSize: 14 }}
        />
      </BarChart>

      <div className='mt-4 flex gap-3'>
        <button
          className='py-2 px-4 mr-2 bg-blue-500 text-white rounded hover:cursor-pointer'
          onClick={() => setSortCriteria('rank')}
        >
          Sort by Rank
        </button>
        <button
          className='py-2 px-4 mr-2 bg-blue-500 text-white rounded hover:cursor-pointer'
          onClick={() => setSortCriteria('suit')}
        >
          Sort by Suit
        </button>
        <button
          className='py-2 px-4 bg-blue-500 text-white rounded hover:cursor-pointer'
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>
    </div>
  );
};
