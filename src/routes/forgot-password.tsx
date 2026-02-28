import { createFileRoute } from '@tanstack/react-router';
import { ForgotPassword } from '../pages/ForgotPassword';

export const Route = createFileRoute('/forgot-password')({
  head: () => ({
    meta: [
      { title: 'Forgot Password – Ride The Bus' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ForgotPassword,
});
