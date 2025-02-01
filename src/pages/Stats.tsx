import { useEffect, useState } from 'react';
import { getCardCounts } from '../api/getCardCounts';
import { CardCountBarChart } from '../components/CardCountBarChart/CardCountBarChart';

export type CardCount = {
  card_rank: string;
  card_suit: string;
  count: number;
};

const rankOrder = [
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
const suitOrder = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];

const sortCardCounts = (cardCounts: CardCount[]): CardCount[] => {
  return cardCounts.sort((a, b) => {
    const rankComparison =
      rankOrder.indexOf(a.card_rank) - rankOrder.indexOf(b.card_rank);
    if (rankComparison !== 0) {
      return rankComparison;
    }
    return suitOrder.indexOf(a.card_suit) - suitOrder.indexOf(b.card_suit);
  });
};

export const Stats = (): JSX.Element => {
  const [cardCounts, setCardCounts] = useState<CardCount[]>([]);

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

      <CardCountBarChart cardCounts={cardCounts} />

      <table className='max-w-2xl w-full mx-auto'>
        <thead>
          <tr>
            <th className='py-2 px-4 border-b'>Card</th>
            <th className='py-2 px-4 border-b'>Count</th>
          </tr>
        </thead>
        <tbody>
          {cardCounts.map((cardCount) => (
            <tr key={`${cardCount.card_rank}${cardCount.card_suit}`}>
              <td className='py-2 px-4 border-b'>
                {cardCount.card_rank} of {cardCount.card_suit}
              </td>
              <td className='py-2 px-4 border-b'>{cardCount.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
