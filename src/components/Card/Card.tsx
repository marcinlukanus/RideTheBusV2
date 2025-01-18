import './Card.css';

type CardProps = {
  suit: 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
  value: string;
};

const HEART_SVG = () => (
  <svg
    fill='#ff0000'
    width='100px'
    height='100px'
    viewBox='0 0 56 56'
    xmlns='http://www.w3.org/2000/svg'
    stroke='#ff0000'
  >
    <g id='SVGRepo_iconCarrier'>
      <path d='M 28.0000 49.5156 C 28.4922 49.5156 29.1953 49.1875 29.6875 48.8828 C 42.9765 40.5156 51.2735 30.6250 51.2735 20.6406 C 51.2735 12.3438 45.5781 6.4844 37.9843 6.4844 C 33.6250 6.4844 30.1094 9.0625 28.0000 13.0234 C 25.8906 9.0860 22.3515 6.4844 18.0156 6.4844 C 10.4219 6.4844 4.7265 12.3438 4.7265 20.6406 C 4.7265 30.6250 12.9531 40.6328 26.2890 48.8828 C 26.8046 49.1875 27.5078 49.5156 28.0000 49.5156 Z'></path>
    </g>
  </svg>
);

const DIAMOND_SVG = () => (
  <svg
    fill='#ff0000'
    width='100px'
    height='100px'
    viewBox='0 0 56 56'
    xmlns='http://www.w3.org/2000/svg'
    stroke='#ff0000'
  >
    <g id='SVGRepo_iconCarrier'>
      <path d='M 27.9883 52 C 29.2774 52 29.9336 51.1328 31.2461 49.3516 L 45.2383 30.6719 C 45.8711 29.8047 46.2461 28.9375 46.2461 28 C 46.2461 27.0390 45.8711 26.1953 45.2383 25.3281 L 31.2461 6.6250 C 29.9336 4.8672 29.2774 4.0000 27.9883 4.0000 C 26.7227 4.0000 26.0664 4.8672 24.7539 6.6250 L 10.7617 25.3281 C 10.1289 26.1953 9.7539 27.0390 9.7539 28 C 9.7539 28.9375 10.1289 29.8047 10.7617 30.6719 L 24.7539 49.3516 C 26.0664 51.1328 26.7227 52 27.9883 52 Z'></path>
    </g>
  </svg>
);

const CLUBS_SVG = () => (
  <svg
    fill='#000000'
    width='100px'
    height='100px'
    viewBox='0 0 56 56'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g id='SVGRepo_iconCarrier'>
      <path d='M 5.9102 32.4531 C 5.9102 38.0547 10.3165 42.3906 15.9180 42.3906 C 19.0352 42.3906 22.2227 41.3594 23.6055 38.6172 L 23.8399 38.6172 C 23.8399 41.7344 20.4180 44.3125 19.0352 45.7656 C 17.3477 47.5234 18.3790 49.9609 20.5586 49.9609 L 35.4415 49.9609 C 37.5977 49.9609 38.6290 47.5234 36.9415 45.7656 C 35.5586 44.3125 32.1368 41.7344 32.1368 38.6172 L 32.3946 38.6172 C 33.7539 41.3594 36.9649 42.3906 40.0586 42.3906 C 45.6602 42.3906 50.0898 38.0547 50.0898 32.4531 C 50.0898 26.8281 45.8243 22.0703 40.2227 22.0703 C 38.0899 22.0703 35.8868 22.7969 34.1524 24.1562 C 37.0586 21.7891 38.0899 18.8125 38.0899 16.1406 C 38.0899 10.5391 33.5665 6.0391 27.9883 6.0391 C 22.4337 6.0391 17.9102 10.5391 17.9102 16.1406 C 17.9102 18.8125 18.9180 21.7891 21.8243 24.1562 C 20.1134 22.7969 17.8868 22.0703 15.7539 22.0703 C 10.1524 22.0703 5.9102 26.8281 5.9102 32.4531 Z'></path>
    </g>
  </svg>
);

const SPADES_SVG = () => (
  <svg
    fill='#000000'
    width='100px'
    height='100px'
    viewBox='0 0 56 56'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g id='SVGRepo_iconCarrier'>
      <path d='M 6.0038 33.2148 C 6.0038 38.7930 10.3163 43.1289 15.9179 43.1289 C 19.0351 43.1289 22.2226 42.0976 23.6054 39.3555 L 23.8397 39.3555 C 23.8397 42.4726 20.4179 45.0508 19.0351 46.5039 C 17.3475 48.2617 18.3788 50.6992 20.5585 50.6992 L 35.4413 50.6992 C 37.5975 50.6992 38.6288 48.2617 36.9413 46.5039 C 35.5585 45.0508 32.1366 42.4726 32.1366 39.3555 L 32.3944 39.3555 C 33.7538 42.0976 36.9648 43.1289 40.0585 43.1289 C 45.6601 43.1289 49.9962 38.7930 49.9962 33.2148 C 49.9962 22.7148 36.0273 18.2852 30.4257 6.9883 C 29.9570 6.0274 29.2304 5.3008 27.9882 5.3008 C 26.7460 5.3008 26.0429 6.0274 25.5507 6.9883 C 19.9491 18.2852 6.0038 22.7148 6.0038 33.2148 Z'></path>
    </g>
  </svg>
);

const renderCenterSuit = (suit: string) => {
  switch (suit) {
    case 'HEARTS':
      return <HEART_SVG />;
    case 'DIAMONDS':
      return <DIAMOND_SVG />;
    case 'CLUBS':
      return <CLUBS_SVG />;
    case 'SPADES':
      return <SPADES_SVG />;
    default:
      return null;
  }
};

export const Card = ({ suit, value }: CardProps) => {
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

  const cornerText = `${value}${suitSymbol(suit)}`;

  const color = suit === 'HEARTS' || suit === 'DIAMONDS' ? 'red' : 'black';

  return (
    <div className='card'>
      <div className={`corner top-left ${color}`}>{cornerText}</div>

      <div className='center-suit'>{renderCenterSuit(suit)}</div>

      <div className={`corner bottom-right ${color}`}>{cornerText}</div>
    </div>
  );
};
