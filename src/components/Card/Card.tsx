import { Clubs } from './Suits/Clubs';
import { Diamonds } from './Suits/Diamonds';
import { Hearts } from './Suits/Hearts';
import { Spades } from './Suits/Spades';

export type CardProps = {
  suit: 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
  rank: string;
  showCardBack: boolean;
};

const renderCenterSuit = (suit: string) => {
  switch (suit) {
    case 'HEARTS':
      return <Hearts />;
    case 'DIAMONDS':
      return <Diamonds />;
    case 'CLUBS':
      return <Clubs />;
    case 'SPADES':
      return <Spades />;
    default:
      return null;
  }
};

const suitSymbol = (suit: string) => {
  switch (suit) {
    case 'HEARTS':
      return '♥';
    case 'DIAMONDS':
      return '♦';
    case 'CLUBS':
      return '♣';
    case 'SPADES':
      return '♠';
    default:
      return '';
  }
};

export const Card = ({ rank, showCardBack, suit }: CardProps) => {
  const cornerText = `${rank}${suitSymbol(suit)}`;

  const color = suit === 'HEARTS' || suit === 'DIAMONDS' ? 'red' : 'black';

  return (
    <div className="relative h-[200px] w-[144px] select-none perspective-[1500px] sm:h-[314px] sm:w-[226px]">
      <div
        className={`absolute h-full w-full rounded-[10px] transition-transform duration-600 backface-hidden transform-3d ${
          showCardBack ? 'rotate-y-180' : ''
        }`}
      >
        <div
          className={`absolute h-full w-full rotate-y-0 rounded-[10px] border-2 border-solid bg-white shadow-lg backface-hidden ${
            showCardBack ? 'opacity-0' : ''
          }`}
        >
          <div
            className={`text-shadow-md xs:text-4xl absolute top-2.5 left-3.5 text-5xl font-bold text-${color}`}
          >
            {!showCardBack && cornerText}
          </div>
          <div className="flex h-full items-center justify-center">
            {!showCardBack && renderCenterSuit(suit)}
          </div>
          <div
            className={`text-shadow-md xs:text-4xl absolute right-3.5 bottom-2.5 rotate-180 text-5xl font-bold text-${color}`}
          >
            {!showCardBack && cornerText}
          </div>
        </div>

        <div className="card-back absolute h-full w-full rotate-y-180 overflow-hidden rounded-[10px] bg-white shadow-lg backface-hidden before:absolute before:left-0 before:h-[200%] before:w-[200%] before:bg-gradient-to-b before:from-[#ffffff] before:via-[#ffd700] before:to-[#d99200] before:shadow-lg after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:bg-radial after:from-[rgba(255,255,255,0.05)] after:via-transparent after:to-transparent" />
      </div>
    </div>
  );
};
