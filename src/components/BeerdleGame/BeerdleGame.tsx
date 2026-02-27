import { Card } from '../Card/Card';
import { useEffect, useState } from 'react';
import {
  HigherLowerOrSame,
  InsideOutsideOrSame,
  RedOrBlack,
  suits,
  useBeerdleGameState,
} from './useBeerdleGameState';
import Confetti from 'react-confetti';
import { createPortal } from 'react-dom';
import { useDocumentSize } from '../../helpers/hooks/useDocumentSize';
import { useAuth } from '../../contexts/AuthContext';
import { getDailySeed } from '../../api/getDailySeed';
import { postBeerdleScore } from '../../api/postBeerdleScore';
import { getTodayBeerdleScore, getUserBeerdleStats } from '../../api/getUserBeerdleStats';
import { BeerdleWinModal } from './BeerdleWinModal';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export const BeerdleGame = () => {
  const { user } = useAuth();
  const { width, height } = useDocumentSize();

  const {
    gameState,
    setSeed,
    drawCards,
    firstRound,
    secondRound,
    thirdRound,
    finalRound,
    generateShareText,
  } = useBeerdleGameState();

  const [showWinModal, setShowWinModal] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);

  const dailySeedQuery = useQuery({
    queryKey: queryKeys.dailySeed,
    queryFn: getDailySeed,
    staleTime: Infinity,
  });

  const beerdleStatsQuery = useQuery({
    queryKey: queryKeys.userBeerdleStats(user?.id ?? ''),
    queryFn: () => getUserBeerdleStats(user!.id),
    enabled: !!user?.id,
  });

  const todayScoreQuery = useQuery({
    queryKey: queryKeys.todayBeerdleScore(user?.id ?? ''),
    queryFn: () => getTodayBeerdleScore(user!.id),
    enabled: !!user?.id,
  });

  const dailySeedData = dailySeedQuery.data ?? null;
  const alreadyCompleted = !!todayScoreQuery.data;
  const existingScore = todayScoreQuery.data ?? null;
  const userBestScore = beerdleStatsQuery.data?.bestScore ?? null;
  const error = dailySeedQuery.error ? "Failed to load today's game. Please refresh the page." : null;

  const postBeerdleMutation = useMutation({
    mutationFn: ({ userId, date, score }: { userId: string; date: string; score: number }) =>
      postBeerdleScore(userId, date, score),
    onSuccess: (_, { score }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayBeerdleScore(user!.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userBeerdleStats(user!.id) });
      if (userBestScore !== null) {
        setIsNewBest(score < userBestScore);
        setPreviousBest(userBestScore);
      }
      setShowWinModal(true);
    },
    onError: () => setShowWinModal(true),
  });

  // Initialize seed once data is ready
  useEffect(() => {
    if (!dailySeedQuery.data) return;
    if (user?.id && todayScoreQuery.isPending) return;
    if (alreadyCompleted) return;
    setSeed(dailySeedQuery.data.seed, dailySeedQuery.data.day_number, dailySeedQuery.data.game_date);
  }, [dailySeedQuery.data, todayScoreQuery.isPending, alreadyCompleted, user?.id, setSeed]);

  // Save score when game is won
  useEffect(() => {
    if (
      !gameState.isGameOver ||
      !gameState.hasWon ||
      alreadyCompleted ||
      postBeerdleMutation.isPending ||
      postBeerdleMutation.isSuccess
    )
      return;

    if (user?.id && gameState.gameDate) {
      postBeerdleMutation.mutate({
        userId: user.id,
        date: gameState.gameDate,
        score: gameState.attempts,
      });
    } else if (!user) {
      // Show modal for non-logged-in users
      setShowWinModal(true);
    }
  }, [
    gameState.isGameOver,
    gameState.hasWon,
    gameState.attempts,
    gameState.gameDate,
    user,
    alreadyCompleted,
    postBeerdleMutation.isPending,
    postBeerdleMutation.isSuccess,
  ]);

  const renderButtons = () => {
    switch (gameState.currentRound) {
      case 1:
        return (
          <>
            {(['red', 'black'] as RedOrBlack[]).map((color) => (
              <button
                key={color}
                className={`cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md transition-transform hover:scale-105 ${
                  color === 'red' ? 'bg-red-600 text-white' : 'bg-black text-white'
                }`}
                onClick={() => firstRound(color)}
              >
                {color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      case 2:
        return (
          <>
            {(['higher', 'lower', 'same'] as HigherLowerOrSame[]).map((guess) => (
              <button
                key={guess}
                className="cursor-pointer rounded-lg bg-white px-4 py-2 text-lg font-bold text-black shadow-md transition-transform hover:scale-105"
                onClick={() => secondRound(guess)}
              >
                {guess.charAt(0).toUpperCase() + guess.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      case 3:
        return (
          <>
            {(['inside', 'outside', 'same'] as InsideOutsideOrSame[]).map((guess) => (
              <button
                key={guess}
                className="cursor-pointer rounded-lg bg-white px-4 py-2 text-lg font-bold text-black shadow-md transition-transform hover:scale-105"
                onClick={() => thirdRound(guess)}
              >
                {guess.charAt(0).toUpperCase() + guess.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      case 4:
        return (
          <>
            {suits.map((suit) => (
              <button
                key={suit}
                className={`cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md transition-transform hover:scale-105 ${
                  suit === 'HEARTS' || suit === 'DIAMONDS'
                    ? 'bg-red-600 text-white'
                    : 'bg-black text-white'
                }`}
                onClick={() => finalRound(suit)}
              >
                {suit.charAt(0).toUpperCase() + suit.slice(1).toLowerCase()}
              </button>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-500"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if ((dailySeedQuery.isLoading || (!!user?.id && todayScoreQuery.isPending)) && !alreadyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
        <p className="mt-4 text-lg">Loading today&apos;s game...</p>
      </div>
    );
  }

  // Show completed state if user has already played today
  if (alreadyCompleted && existingScore && dailySeedData) {
    const isPerfectGame = existingScore.score === 0;
    const beers = isPerfectGame ? '🏆' : '🍺'.repeat(existingScore.score);
    const shareText = `Beerdle #${dailySeedData.day_number + 1}\n\n${isPerfectGame ? '🏆 Stayed dry!' : beers}\n\nhttps://ridethebus.party/beerdle`;

    return (
      <div className="flex flex-col items-center justify-center">
        {/* Day indicator */}
        <div className="mb-6 rounded-full bg-amber-600/20 px-4 py-1">
          <span className="text-amber-400">Beerdle #{dailySeedData.day_number + 1}</span>
        </div>

        <div className="mb-6 rounded-xl bg-gray-800 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-xl ${isPerfectGame ? 'bg-yellow-500/90' : 'bg-green-600/90'}`}
            >
              <span className="text-3xl">{isPerfectGame ? '🏆' : '✓'}</span>
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">Already Completed!</h2>
          <p className="mb-4 text-gray-300">
            {isPerfectGame ? (
              <>
                You finished today&apos;s Beerdle with{' '}
                <span className="font-bold text-yellow-400">no drinks</span>!
              </>
            ) : (
              <>
                You finished today&apos;s Beerdle with{' '}
                <span className="font-bold text-amber-400">{existingScore.score}</span> drink
                {existingScore.score !== 1 ? 's' : ''}
              </>
            )}
          </p>

          <div className="mb-6 rounded-lg bg-gray-700 p-4">
            <p className="mb-2 text-sm text-gray-400">
              {isPerfectGame ? 'Result:' : 'Your drinks:'}
            </p>
            <p className="text-3xl">{beers}</p>
          </div>

          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareText);
                alert('Copied to clipboard!');
              } catch {
                // Clipboard API not available - prompt user to copy manually
                prompt('Copy your result:', shareText);
              }
            }}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-amber-500"
          >
            Share Result
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>

          <p className="text-sm text-gray-400">Come back tomorrow for a new challenge!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="align-center mb-2 flex items-center justify-center gap-2 text-4xl leading-tight font-bold md:text-5xl">
        <span className="text-amber-400">Beerdle</span>
        {gameState.dayNumber && (
          <span className="flex h-fit items-center rounded-full bg-amber-600/20 px-3 py-1 text-lg text-amber-400 md:text-xl">
            #{gameState.dayNumber + 1}
          </span>
        )}
      </h1>

      <h4 className="mt-0 mb-6 text-xl italic md:text-2xl">
        Daily Challenge - Same cards for everyone
      </h4>

      {gameState.hasWon &&
        createPortal(
          <Confetti
            width={width}
            height={height}
            style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
          />,
          document.body,
        )}

      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-2 justify-items-center gap-5 sm:grid-cols-4">
          {gameState.cards.map((card, index) => (
            <Card
              key={index}
              rank={card.values.rank}
              showCardBack={card.showCardBack}
              suit={card.suit}
            />
          ))}
        </div>

        {gameState.isGameOver && !gameState.hasWon && (
          <div className="mt-8 flex">
            <button
              className="cursor-pointer rounded-lg bg-amber-600 px-6 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-amber-500 active:translate-y-1"
              onClick={drawCards}
            >
              Try Again 🍺
            </button>
          </div>
        )}

        {gameState.isGameOver && gameState.hasWon && (
          <div className="mt-8 flex flex-col items-center gap-5">
            <button
              className="cursor-pointer rounded-lg bg-amber-600 px-6 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-amber-500"
              onClick={() => setShowWinModal(true)}
            >
              Share Result 📤
            </button>
            <p className="text-sm text-gray-400">Come back tomorrow for a new challenge!</p>
          </div>
        )}

        {!gameState.isGameOver && <div className="mt-8 flex gap-5">{renderButtons()}</div>}

        {gameState.isGameOver && !gameState.hasWon && (
          <p className="mt-8 text-lg font-bold text-red-400">Take a drink! 🍺</p>
        )}

        <p className="mt-4 text-xl font-bold">
          Drinks taken: <span className="text-amber-400">{gameState.attempts}</span>
        </p>

        {!user && (
          <p className="mt-4 text-sm text-gray-400">
            <a href="/login" className="text-amber-400 underline hover:text-amber-300">
              Log in
            </a>{' '}
            to save your score and track your streak!
          </p>
        )}
      </div>
      <BeerdleWinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        attempts={gameState.attempts}
        dayNumber={gameState.dayNumber || 0}
        shareText={generateShareText()}
        isNewBest={isNewBest}
        previousBest={previousBest}
      />
    </>
  );
};
