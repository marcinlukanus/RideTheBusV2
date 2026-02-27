import { createFileRoute } from '@tanstack/react-router';
import { Login } from '../pages/Login';

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: 'Login – Ride The Bus' },
      { name: 'robots', content: 'noindex, nofollow' },
      { rel: 'canonical', href: 'https://ridethebus.party/login' },
    ],
  }),
  component: Login,
});
