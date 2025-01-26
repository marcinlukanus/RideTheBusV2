import { useEffect, useState } from 'react';
import { getCardCounts } from '../api/getCardCounts';

type CardCount = {
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

const Stats = (): JSX.Element => {
  const [cardCounts, setCardCounts] = useState<CardCount[]>([]);

  useEffect(() => {
    const fetchCardCounts = async () => {
      const counts = await getCardCounts();
      setCardCounts(sortCardCounts(counts));
    };

    fetchCardCounts();
  }, []);

  return (
    <div>
      <h1>Card Counts</h1>
      <table>
        <thead>
          <tr>
            <th>Card</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {cardCounts.map((cardCount) => (
            <tr key={`${cardCount.card_rank}${cardCount.card_suit}`}>
              <td>
                {cardCount.card_rank} of {cardCount.card_suit}
              </td>
              <td>{cardCount.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Stats;
