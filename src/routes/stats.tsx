import { createFileRoute } from '@tanstack/react-router';
import { Stats } from '../pages/Stats';

export const Route = createFileRoute('/stats')({
  head: () => ({
    meta: [
      { title: 'Ride The Bus Card Stats & Probabilities' },
      {
        name: 'description',
        content:
          'Explore card distribution and draw statistics for Ride The Bus. See counts and probabilities to sharpen your strategy.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://ridethebus.party/stats' }],
  }),
  component: Stats,
});
