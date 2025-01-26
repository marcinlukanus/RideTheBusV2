import './Card.css';
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
    <div className={`card-container ${showCardBack ? 'flipped' : ''}`}>
      <div className='h-full w-full rounded-[10px] absolute backface-hidden transition-transform duration-600 transform-3d card'>
        <div className={`card-front ${showCardBack ? 'opacity-0' : ''}`}>
          <div className={`corner top-2.5 left-3.5 text-${color}`}>
            {!showCardBack && cornerText}
          </div>
          <div className='flex justify-center items-center h-full'>
            {!showCardBack && renderCenterSuit(suit)}
          </div>
          <div
            className={`corner bottom-2.5 right-3.5 rotate-180 text-${color}`}
          >
            {!showCardBack && cornerText}
          </div>
        </div>

        <div className='card-back' />
      </div>
    </div>
  );
};
