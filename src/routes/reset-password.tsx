import { createFileRoute } from '@tanstack/react-router';
import { ResetPassword } from '../pages/ResetPassword';

export const Route = createFileRoute('/reset-password')({
  head: () => ({
    meta: [
      { title: 'Reset Password – Ride The Bus' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ResetPassword,
});
