import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

type RoomLinkProps = {
  roomId: string;
};

export const RoomLink = ({ roomId }: RoomLinkProps) => {
  const [copied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState('');

  useEffect(() => {
    setRoomUrl(`${window.location.origin}/party-bus/${roomId}`);
  }, [roomId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Panel className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold">Room Code: {roomId}</h3>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={roomUrl}
          readOnly
          className="w-64 rounded-lg bg-surface-input px-4 py-2 text-white sm:w-96"
        />
        <Button variant="ghost" onClick={copyToClipboard}>
          {copied ? '✓ Copied!' : 'Copy Link'}
        </Button>
      </div>
      <p className="text-sm text-gray-400">
        Share this link with your friends to invite them to the game!
      </p>
    </Panel>
  );
};
