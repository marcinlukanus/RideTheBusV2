import { CardCount } from '../../pages/Stats';

type CardCountTableProps = {
  cardCounts: CardCount[];
};

export const CardCountTable = ({ cardCounts }: CardCountTableProps) => {
  return (
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
  );
};
