import { createFileRoute } from '@tanstack/react-router';
import { PartyBus } from '../pages/PartyBus';

export const Route = createFileRoute('/party-bus/')({
  component: PartyBus,
});
