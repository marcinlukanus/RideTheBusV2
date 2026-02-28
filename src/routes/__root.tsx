import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { queryClient } from '../lib/queryClient';
import appCss from '../index.css?url';

interface RouterContext {
  queryClient: QueryClient;
}

const WEB_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Ride The Bus',
  alternateName: ['Fuck the Bus', 'Bus Drinking Game'],
  url: 'https://ridethebus.party/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires a modern web browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Free online drinking card game. Play Ride The Bus (also known as Fuck the Bus) in your browser – no deck, no download required.',
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Ride The Bus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ride The Bus is a classic drinking card game where players guess attributes of drawn cards (Red or Black, Higher or Lower, Inside or Outside, and Suit) and drink for each wrong answer. It is also known as Fuck the Bus or Bus Drinking Game.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you play Ride The Bus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To play Ride The Bus: 1) Guess if the first card is Red or Black. 2) Guess if the next card is Higher or Lower than the previous. 3) Guess if the third card is Inside or Outside the range of the first two. 4) Guess the Suit of the fourth card. Drink once for each wrong answer – and if you get the suit wrong, you "ride the bus" and start over.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the Ride The Bus rules?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ride The Bus rules: Round 1 – Red or Black? Round 2 – Higher or Lower? Round 3 – Inside or Outside? Round 4 – Guess the Suit (Clubs, Diamonds, Spades, or Hearts). Wrong answer = drink. If you fail Round 4 you ride the bus (restart). The player with the most drinks at the end loses and must "ride the bus" one final time.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Ride The Bus free to play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes – Ride The Bus on ridethebus.party is completely free to play in your browser. No download, no account required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Fuck the Bus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fuck the Bus is another name for the Ride The Bus drinking card game. The rules are identical – guess Red/Black, Higher/Lower, Inside/Outside, and Suit, drinking for each wrong answer.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Beerdle?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beerdle is the daily Ride The Bus challenge on ridethebus.party. Every player gets the same shuffled deck each day – compete with friends to see who takes the fewest drinks. Think Wordle, but with cards and drinks.',
      },
    },
  ],
};

const GA_INLINE_SCRIPT = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-4NC7TQ8TLS');`;

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Ride The Bus – Free Online Drinking Card Game' },
      {
        name: 'description',
        content:
          'Play Ride The Bus online – the classic drinking card game, free in your browser. Also known as Fuck the Bus. No deck, no download, just drinks.',
      },
      {
        name: 'keywords',
        content:
          'ride the bus, ride the bus drinking game, ride the bus card game, fuck the bus, bus drinking game, riding the bus drinking game, ride the bus rules, how to play ride the bus, online drinking game, card drinking game, party drinking game, beerdle, party bus drinking game, multiplayer drinking game',
      },
      { name: 'author', content: 'Marcin Lukanus' },
      { property: 'og:site_name', content: 'Ride The Bus' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://ridethebus.party/' },
      { property: 'og:title', content: 'Ride The Bus – Free Online Drinking Card Game' },
      {
        property: 'og:description',
        content:
          'Play Ride The Bus (aka Fuck the Bus) free in your browser – the classic drinking card game. No deck needed. Easy to learn, hard to master.',
      },
      {
        property: 'og:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
      { property: 'og:image:alt', content: 'Ride The Bus game preview' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Ride The Bus – Free Online Drinking Card Game' },
      {
        name: 'twitter:description',
        content:
          'Play Ride The Bus (aka Fuck the Bus) free in your browser – the classic drinking card game. No deck needed.',
      },
      {
        name: 'twitter:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
      { name: 'theme-color', content: '#111827' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: [
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-4NC7TQ8TLS',
        async: true,
      },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: GA_INLINE_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APP_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="mx-auto max-w-6xl flex-grow p-8 pt-16 text-center">
                <Outlet />
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
