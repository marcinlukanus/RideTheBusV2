import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '../pages/Profile';

export const Route = createFileRoute('/$username/profile')({
  validateSearch: (search: Record<string, unknown>) => ({
    upgraded: search.upgraded === 'true' ? 'true' : undefined,
  }),
  component: Profile,
});
