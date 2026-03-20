import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '../pages/Profile';

export const Route = createFileRoute('/$username/profile')({
  component: Profile,
});
