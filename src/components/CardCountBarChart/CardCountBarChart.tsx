import { BarChart, YAxis, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { CardCount } from '../../pages/Stats';

type CardCountBarChartProps = {
  cardCounts: CardCount[];
};
export const CardCountBarChart = ({ cardCounts }: CardCountBarChartProps) => {
  const isRed = (suit: string) => {
    return suit === 'HEARTS' || suit === 'DIAMONDS';
  };

  return (
    <div className="flex flex-col items-center">
      <BarChart
        width={1200}
        height={600}
        data={cardCounts}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="name" hide />
        <YAxis />
        <Tooltip labelStyle={{ color: 'black' }} />
        <Bar dataKey="count">
          {cardCounts.map((entry) => (
            <Cell fill={isRed(entry.card_suit) ? 'red' : 'black'} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
};
