import { createFileRoute } from '@tanstack/react-router';
import { Stats } from '../pages/Stats';

export const Route = createFileRoute('/stats')({
  head: () => ({
    meta: [
      { title: 'Ride The Bus Card Counts' },
      {
        name: 'description',
        content:
          'Explore card distribution and stats for Ride The Bus. See counts and probabilities to improve your strategy.',
      },
      { rel: 'canonical', href: 'https://ridethebus.party/stats' },
    ],
  }),
  component: Stats,
});
