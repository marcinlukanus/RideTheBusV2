import { Game } from './components/Game/Game';

function App() {
  return (
    <div>
      <h1 className='text-4xl md:text-5xl font-bold leading-tight mb-2'>
        Ride The Bus
      </h1>
      <h4 className='text-xl md:text-2xl italic mt-0 mb-6'>
        The best single-player drinking game around
      </h4>
      <Game />
    </div>
  );
}

export default App;
