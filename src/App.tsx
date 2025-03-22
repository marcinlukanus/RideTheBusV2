import { Game } from './components/Game/Game';

function App() {
  return (
    <div>
      <h1 className="mb-2 text-4xl leading-tight font-bold md:text-5xl">Ride The Bus</h1>
      <h4 className="mt-0 mb-6 text-xl italic md:text-2xl">
        The best single-player drinking game around
      </h4>
      <Game />
    </div>
  );
}

export default App;
