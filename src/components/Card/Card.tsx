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
    <div className='relative w-[144px] h-[200px] sm:w-[226px] sm:h-[314px] perspective-[1500px] select-none'>
      <div
        className={`h-full w-full rounded-[10px] absolute backface-hidden transition-transform duration-600 transform-3d ${
          showCardBack ? 'rotate-y-180' : ''
        }`}
      >
        <div
          className={`h-full w-full absolute backface-hidden rounded-[10px]
             bg-white rotate-y-0 shadow-lg border-2 border-solid ${
               showCardBack ? 'opacity-0' : ''
             }`}
        >
          <div
            className={`absolute text-5xl font-bold text-shadow-md xs:text-4xl top-2.5 left-3.5 text-${color}`}
          >
            {!showCardBack && cornerText}
          </div>
          <div className='flex justify-center items-center h-full'>
            {!showCardBack && renderCenterSuit(suit)}
          </div>
          <div
            className={`absolute text-5xl font-bold text-shadow-md xs:text-4xl bottom-2.5 right-3.5 rotate-180 text-${color}`}
          >
            {!showCardBack && cornerText}
          </div>
        </div>

        <div
          className='h-full w-full absolute backface-hidden rounded-[10px] card-back
         bg-white shadow-lg rotate-y-180 overflow-hidden before:absolute 
         before:left-0 before:w-[200%] before:h-[200%] before:shadow-lg 
         before:bg-gradient-to-b before:from-[#ffffff] before:via-[#ffd700] before:to-[#d99200]
          after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-radial 
          after:from-[rgba(255,255,255,0.05)] after:via-transparent after:to-transparent 
          after:pointer-events-none'
        />
      </div>
    </div>
  );
};
