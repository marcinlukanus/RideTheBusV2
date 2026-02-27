import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/party-bus')({
  head: () => ({
    meta: [
      { title: 'Ride The Party Bus' },
      { rel: 'canonical', href: 'https://ridethebus.party/party-bus' },
      {
        name: 'description',
        content:
          'Ride The Bus with friends! Create or join a room and play the classic drinking game together in real-time.',
      },
    ],
  }),
  component: PartyBusLayout,
});

function PartyBusLayout() {
  return <Outlet />;
}
