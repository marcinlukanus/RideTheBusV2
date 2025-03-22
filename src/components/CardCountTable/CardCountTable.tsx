import { CardCount } from '../../pages/Stats';

type CardCountTableProps = {
  cardCounts: CardCount[];
};

export const CardCountTable = ({ cardCounts }: CardCountTableProps) => {
  return (
    <table className="mx-auto w-full max-w-2xl">
      <thead>
        <tr>
          <th className="border-b px-4 py-2">Card</th>
          <th className="border-b px-4 py-2">Count</th>
        </tr>
      </thead>
      <tbody>
        {cardCounts.map((cardCount) => (
          <tr key={`${cardCount.card_rank}${cardCount.card_suit}`}>
            <td className="border-b px-4 py-2">
              {cardCount.card_rank} of {cardCount.card_suit}
            </td>
            <td className="border-b px-4 py-2">{cardCount.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
