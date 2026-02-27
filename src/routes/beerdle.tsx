import { createFileRoute } from '@tanstack/react-router';
import { BeerdleGame } from '../components/BeerdleGame/BeerdleGame';

export const Route = createFileRoute('/beerdle')({
  head: () => ({
    meta: [
      { title: 'Beerdle – Daily Ride The Bus Card Game Challenge' },
      {
        name: 'description',
        content:
          'Beerdle is the daily Ride The Bus challenge. Every player gets the same deck – compete to take the fewest drinks. Like Wordle, but with cards and drinking. Free to play.',
      },
      {
        name: 'keywords',
        content:
          'beerdle, daily drinking game, daily card game challenge, ride the bus daily, wordle drinking game, daily challenge drinking game',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Ride The Bus' },
      { property: 'og:title', content: 'Beerdle – Daily Ride The Bus Card Game Challenge' },
      {
        property: 'og:description',
        content:
          'Same deck for everyone, every day. How many drinks will you take today? Play Beerdle – the daily Ride The Bus challenge.',
      },
      { property: 'og:url', content: 'https://ridethebus.party/beerdle' },
      {
        property: 'og:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Beerdle – Daily Ride The Bus Card Game Challenge' },
      {
        name: 'twitter:description',
        content:
          'Same deck for everyone, every day. How many drinks will you take today? Play Beerdle – the daily Ride The Bus challenge.',
      },
      {
        name: 'twitter:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://ridethebus.party/beerdle' }],
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
