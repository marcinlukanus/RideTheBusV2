import { Outlet } from 'react-router';
import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <title>Ride The Bus</title>
      <meta
        name="description"
        content="Play Ride The Bus, the classic drinking game, in your browser. Simple rules, fast rounds, and endless fun – no physical deck required."
      />
      <meta
        name="keywords"
        content="ride the bus, ride the bus drinking game, drinking game, card game, online drinking game, party game"
      />
      <meta name="author" content="Marcin Lukanus" />
      <link rel="canonical" href="https://ridethebus.party/" />

      {/* Open Graph */}
      <meta property="og:site_name" content="Ride The Bus" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://ridethebus.party/" />
      <meta property="og:title" content="Ride The Bus – Online Drinking Game" />
      <meta
        property="og:description"
        content="Play the online version of Ride The Bus – easy to learn, hard to master. Try your luck now!"
      />
      <meta property="og:image" content="https://ridethebus.party/images/og/og-image.png" />
      <meta property="og:image:alt" content="Ride The Bus game preview" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Ride The Bus – Online Drinking Game" />
      <meta
        name="twitter:description"
        content="Play Ride The Bus in your browser – the classic drinking card game."
      />
      <meta name="twitter:image" content="https://ridethebus.party/images/og/og-image.png" />

      {/* PWA/Theme */}
      <meta name="theme-color" content="#111827" />
      <Header />
<main className="mx-auto max-w-6xl flex-grow p-8 pt-16 text-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
