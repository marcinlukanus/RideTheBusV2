import { createFileRoute } from '@tanstack/react-router';
import { Game } from '../components/Game/Game';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Ride The Bus – Free Online Drinking Card Game' },
      {
        name: 'description',
        content:
          'Play Ride The Bus online – the classic drinking card game, free in your browser. Also known as Fuck the Bus or the Bus Drinking Game. Guess Red/Black, Higher/Lower, Inside/Outside, and Suit. No deck needed.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://ridethebus.party/' }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1 className="mb-2 text-4xl leading-tight font-bold md:text-5xl">Ride The Bus</h1>
      <h4 className="mt-0 mb-6 text-xl italic md:text-2xl">
        The best single-player drinking card game – free in your browser
      </h4>
      <Game />
    </div>
  );
}
