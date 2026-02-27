import { createFileRoute } from '@tanstack/react-router';
import { SignUp } from '../pages/SignUp';

export const Route = createFileRoute('/sign-up')({
  head: () => ({
    meta: [
      { title: 'Sign Up – Ride The Bus' },
      { name: 'robots', content: 'noindex, nofollow' },
      { rel: 'canonical', href: 'https://ridethebus.party/sign-up' },
    ],
  }),
  component: SignUp,
});
