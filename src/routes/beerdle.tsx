import { createFileRoute } from '@tanstack/react-router';
import { BeerdleGame } from '../components/BeerdleGame/BeerdleGame';

export const Route = createFileRoute('/beerdle')({
  head: () => ({
    meta: [
      { title: 'Beerdle - Daily Ride The Bus Challenge' },
      {
        name: 'description',
        content:
          'Beerdle - The daily Ride The Bus challenge. Same cards for everyone, compete for the lowest score. Like Wordle, but with drinks!',
      },
      {
        name: 'keywords',
        content:
          'beerdle, daily drinking game, ride the bus, wordle drinking game, daily card game, daily challenge, drinking card game',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Ride The Bus' },
      { property: 'og:title', content: 'Beerdle - Daily Ride The Bus Challenge' },
      {
        property: 'og:description',
        content:
          'Same cards for everyone. How many drinks will you take today? Play the daily Ride The Bus challenge!',
      },
      { property: 'og:url', content: 'https://ridethebus.party/beerdle' },
      {
        property: 'og:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Beerdle - Daily Ride The Bus Challenge' },
      {
        name: 'twitter:description',
        content:
          'Same cards for everyone. How many drinks will you take today? Play the daily Ride The Bus challenge!',
      },
      {
        name: 'twitter:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
      { rel: 'canonical', href: 'https://ridethebus.party/beerdle' },
    ],
  }),
  component: BeerdlePage,
});

function BeerdlePage() {
  return (
    <div>
      <BeerdleGame />
    </div>
  );
}
