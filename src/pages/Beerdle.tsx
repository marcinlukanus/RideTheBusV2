import { BeerdleGame } from '../components/BeerdleGame/BeerdleGame';
import { Helmet } from 'react-helmet-async';

export const Beerdle = () => {
  return (
    <div>
      <Helmet prioritizeSeoTags>
        <title>Beerdle - Daily Ride The Bus Challenge</title>
        <link rel="canonical" href="https://ridethebus.party/beerdle" />
        <meta
          name="description"
          content="Beerdle - The daily Ride The Bus challenge. Same cards for everyone, compete for the lowest score. Like Wordle, but with drinks!"
        />
        <meta
          name="keywords"
          content="beerdle, daily drinking game, ride the bus, wordle drinking game, daily card game, daily challenge, drinking card game"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ride The Bus" />
        <meta property="og:title" content="Beerdle - Daily Ride The Bus Challenge" />
        <meta
          property="og:description"
          content="Same cards for everyone. How many drinks will you take today? Play the daily Ride The Bus challenge!"
        />
        <meta property="og:url" content="https://ridethebus.party/beerdle" />
        <meta property="og:image" content="https://ridethebus.party/images/og/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Beerdle - Daily Ride The Bus Challenge" />
        <meta
          name="twitter:description"
          content="Same cards for everyone. How many drinks will you take today? Play the daily Ride The Bus challenge!"
        />
        <meta name="twitter:image" content="https://ridethebus.party/images/og/og-image.png" />
      </Helmet>

      <h1 className="mb-2 text-4xl leading-tight font-bold md:text-5xl">
        <span className="text-amber-400">Beerdle</span>
      </h1>
      <h4 className="mt-0 mb-6 text-xl italic md:text-2xl">
        Daily Challenge - Same cards for everyone
      </h4>

      <BeerdleGame />
    </div>
  );
};
