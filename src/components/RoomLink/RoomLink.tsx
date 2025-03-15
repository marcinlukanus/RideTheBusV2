import { useState } from 'react';

type RoomLinkProps = {
  roomId: string;
};

export const RoomLink = ({ roomId }: RoomLinkProps) => {
  const [copied, setCopied] = useState(false);

  const roomUrl = `${window.location.origin}/party-bus/${roomId}`;

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
    <div className='flex flex-col items-center gap-4 p-4 bg-gray-800 rounded-lg'>
      <h3 className='text-xl font-bold'>Room Code: {roomId}</h3>
      <div className='flex items-center gap-2'>
        <input
          type='text'
          value={roomUrl}
          readOnly
          className='px-4 py-2 bg-gray-700 rounded-lg text-white w-64 sm:w-96'
        />
        <button
          onClick={copyToClipboard}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>
      <p className='text-sm text-gray-400'>
        Share this link with your friends to invite them to the game!
      </p>
    </div>
  );
};
