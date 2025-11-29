import { useState, useEffect } from 'react';

type BeerdleWinModalProps = {
  isOpen: boolean;
  onClose: () => void;
  attempts: number;
  dayNumber: number;
  shareText: string;
  isNewBest: boolean;
  previousBest: number | null;
};

export const BeerdleWinModal = ({
  isOpen,
  onClose,
  attempts,
  dayNumber,
  shareText,
  isNewBest,
  previousBest,
}: BeerdleWinModalProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Beerdle #${dayNumber}`,
          text: shareText,
        });
      } catch {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const beers = attempts === 0 ? '🏆' : '🍺'.repeat(attempts);
  const isPerfectGame = attempts === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-gray-900 p-6 text-center shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 transition-colors hover:text-white"
          aria-label="Close"
        >
          ×
        </button>

        {/* Star icon */}
        <div className="mb-4 flex justify-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-xl ${isPerfectGame ? 'bg-yellow-500/90' : 'bg-amber-600/90'}`}
          >
            <span className="text-3xl">{isPerfectGame ? '🏆' : '⭐'}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-3xl font-bold text-white">
          {isPerfectGame ? 'Perfect Game!' : 'Congratulations!'}
        </h2>

        {/* Subtitle */}
        <p className="mb-6 text-lg text-gray-300">
          {isPerfectGame ? (
            <>
              You completed today&apos;s Beerdle with{' '}
              <span className="font-bold text-yellow-400">no drinks</span>!
            </>
          ) : (
            <>
              You completed today&apos;s Beerdle with{' '}
              <span className="font-bold text-amber-400">{attempts}</span> drink
              {attempts !== 1 ? 's' : ''}!
            </>
          )}
        </p>

        {/* New best indicator */}
        {isNewBest && previousBest !== null && (
          <div className="mb-4 rounded-lg bg-green-900/50 p-3">
            <p className="text-green-400">
              🎉 New personal best! Previous: {previousBest} attempt{previousBest !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Beer emojis */}
        <div className="mb-6 rounded-xl bg-gray-800 p-4">
          <p className="mb-2 text-sm text-gray-400">
            {isPerfectGame ? 'Result:' : "Today's drinks:"}
          </p>
          <p className="text-3xl">{beers}</p>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:cursor-pointer hover:bg-amber-500"
        >
          {copied ? 'Copied!' : 'Share'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </button>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="text-sm text-gray-400 underline transition-colors hover:cursor-pointer hover:text-white"
        >
          {copied ? 'Copied to clipboard!' : 'Copy result to clipboard'}
        </button>
      </div>
    </div>
  );
};
