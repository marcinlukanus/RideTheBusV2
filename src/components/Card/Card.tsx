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
      <div className='card'>
        <div className={`card-front ${showCardBack ? 'hidden' : ''}`}>
          <div className={`corner top-left ${color}`}>
            {!showCardBack && cornerText}
          </div>
          <div className='center-suit'>
            {!showCardBack && renderCenterSuit(suit)}
          </div>
          <div className={`corner bottom-right ${color}`}>
            {!showCardBack && cornerText}
          </div>
        </div>

        <div className='card-back' />
      </div>
    </div>
  );
};
