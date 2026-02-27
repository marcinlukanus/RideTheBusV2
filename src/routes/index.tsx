import { createFileRoute } from '@tanstack/react-router';
import { Game } from '../components/Game/Game';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Ride The Bus' },
      {
        name: 'description',
        content:
          'Play Ride The Bus online. A fast, simple, and fun drinking card game. No deck needed – start riding the bus now!',
      },
      { rel: 'canonical', href: 'https://ridethebus.party/' },
    ],
  }),
  component: HomePage,
});

function HomePage() {
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
