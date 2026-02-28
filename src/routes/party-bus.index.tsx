import { createFileRoute } from '@tanstack/react-router';
import { PartyBus } from '../pages/PartyBus';

export const Route = createFileRoute('/party-bus/')({
  head: () => ({
    meta: [
      { title: 'Party Bus – Multiplayer Ride The Bus Drinking Game' },
      {
        name: 'description',
        content:
          'Play Ride The Bus with friends online. Create or join a room and play the classic drinking card game together – the multiplayer Party Bus experience.',
      },
      {
        name: 'keywords',
        content:
          'party bus drinking game, multiplayer drinking game, ride the bus multiplayer, online drinking game with friends, party card game online',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://ridethebus.party/party-bus' }],
  }),
  component: PartyBus,
});
