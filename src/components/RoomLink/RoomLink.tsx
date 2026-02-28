import { useState, useEffect } from 'react';

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
    <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-800 p-4">
      <h3 className="text-xl font-bold">Room Code: {roomId}</h3>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={roomUrl}
          readOnly
          className="w-64 rounded-lg bg-gray-700 px-4 py-2 text-white sm:w-96"
        />
        <button
          onClick={copyToClipboard}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>
      <p className="text-sm text-gray-400">
        Share this link with your friends to invite them to the game!
      </p>
    </div>
  );
};
