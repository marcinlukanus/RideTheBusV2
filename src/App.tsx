import './App.css';
import { Game } from './components/Game/Game';

function App() {
  return (
    <>
      <h1 className='header'>Ride The Bus</h1>
      <h4 className='tagline'>The best single-player drinking game around</h4>
      <Game />
    </>
  );
}

export default App;
