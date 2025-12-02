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
    <div className="relative h-[100px] w-[72px] select-none perspective-[1500px] sm:h-[200px] sm:w-[144px] lg:h-[314px] lg:w-[226px]">
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
            className={`text-shadow-md absolute top-1 left-1.5 text-base font-bold sm:top-2.5 sm:left-3.5 sm:text-4xl lg:text-5xl ${color === 'red' ? 'text-red' : 'text-black'}`}
          >
            {!showCardBack && cornerText}
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="size-9 sm:size-[70px] lg:size-[100px]">
              {!showCardBack && renderCenterSuit(suit)}
            </div>
          </div>
          <div
            className={`text-shadow-md absolute right-1.5 bottom-1 rotate-180 text-base font-bold sm:right-3.5 sm:bottom-2.5 sm:text-4xl lg:text-5xl ${color === 'red' ? 'text-red' : 'text-black'}`}
          >
            {!showCardBack && cornerText}
          </div>
        </div>

        <div className="card-back absolute h-full w-full rotate-y-180 overflow-hidden rounded-[10px] bg-white shadow-lg backface-hidden before:absolute before:left-0 before:h-[200%] before:w-[200%] before:bg-gradient-to-b before:from-[#ffffff] before:via-[#ffd700] before:to-[#d99200] before:shadow-lg after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:bg-radial after:from-[rgba(255,255,255,0.05)] after:via-transparent after:to-transparent" />
      </div>
    </div>
  );
};
