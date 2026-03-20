import { createFileRoute, Link } from '@tanstack/react-router';
import { Game } from '../components/Game/Game';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProfileById } from '../api/getProfileById';
import { queryKeys } from '../lib/queryKeys';
import supabase from '../utils/supabase';
import { trackBeginCheckout, trackPremiumView } from '../utils/analytics';

const PREMIUM_BANNER_KEY = 'premium_banner_dismissed';

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
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);

  const { data: profile } = useQuery({
    queryKey: queryKeys.profileById(user?.id ?? ''),
    queryFn: () => getProfileById(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (localStorage.getItem(PREMIUM_BANNER_KEY) !== '1') {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (showBanner && !isPremium) {
      trackPremiumView();
    }
  }, [showBanner, isPremium]);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem(PREMIUM_BANNER_KEY, '1');
    setShowBanner(false);
  };

  const handleUpgrade = async () => {
    if (!user) return;
    trackBeginCheckout();
    setCheckoutLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const { data: urlData } = await supabase.functions.invoke('create-checkout-session', {
        body: { origin: window.location.origin },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (urlData?.url) {
        handleDismiss();
        window.location.href = urlData.url;
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const isPremium = profile?.is_premium ?? false;

  return (
    <div>
      <h1 className="mb-2 text-4xl leading-tight font-bold md:text-5xl">Ride The Bus</h1>
      <h4 className="mt-0 mb-6 text-xl italic md:text-2xl">
        The best single-player drinking game around
      </h4>

      {showBanner && !isPremium && (
        <div className="relative mx-auto mb-6 max-w-lg rounded-lg border border-amber-600/50 bg-amber-900/20 px-6 py-3 text-center text-sm">
          <button
            className="absolute top-2 right-3 text-gray-400 hover:text-white"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
          <p className="font-semibold text-amber-400">✨ Premium Card Backs are here</p>
          <p className="mt-0.5 text-gray-300">
            Upload any image as your card back for $5 — lifetime access.
          </p>
          <p className="mt-1">
            {user ? (
              <button
                className="text-amber-400 underline hover:text-amber-300 disabled:opacity-60"
                onClick={handleUpgrade}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Redirecting...' : 'Upgrade for $5'}
              </button>
            ) : (
              <Link
                to="/login"
                className="text-amber-400 underline hover:text-amber-300"
                onClick={handleDismiss}
              >
                Sign in to upgrade
              </Link>
            )}
          </p>
        </div>
      )}

      <Game />
    </div>
  );
}
