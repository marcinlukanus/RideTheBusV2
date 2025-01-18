import './Game.css';
import { Card } from '../Card/Card';

export const Game = () => {
  return (
    <div className='game-container'>
      <Card suit='DIAMONDS' value='A' />
      <Card suit='CLUBS' value='A' />
      <Card suit='HEARTS' value='A' />
      <Card suit='SPADES' value='A' />
    </div>
  );
};
