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

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Ride The Bus – Online Drinking Game' },
      {
        name: 'description',
        content:
          'Play Ride The Bus, the classic drinking game, in your browser. Simple rules, fast rounds, and endless fun – no physical deck required.',
      },
      {
        name: 'keywords',
        content:
          'ride the bus, ride the bus drinking game, drinking game, card game, online drinking game, party game',
      },
      { name: 'author', content: 'Marcin Lukanus' },
      { property: 'og:site_name', content: 'Ride The Bus' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://ridethebus.party/' },
      { property: 'og:title', content: 'Ride The Bus – Online Drinking Game' },
      {
        property: 'og:description',
        content: 'Play the online version of Ride The Bus – easy to learn, hard to master. Try your luck now!',
      },
      {
        property: 'og:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
      { property: 'og:image:alt', content: 'Ride The Bus game preview' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Ride The Bus – Online Drinking Game' },
      {
        name: 'twitter:description',
        content: 'Play Ride The Bus in your browser – the classic drinking card game.',
      },
      {
        name: 'twitter:image',
        content: 'https://ridethebus.party/images/og/og-image.png',
      },
      { name: 'theme-color', content: '#111827' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'canonical', href: 'https://ridethebus.party/' },
      { rel: 'stylesheet', href: '/dist/styles.css' },
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
