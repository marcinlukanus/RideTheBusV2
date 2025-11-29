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
import { useWindowSize } from '../../helpers/hooks/useWindowSize';
import { useAuth } from '../../contexts/AuthContext';
import { getDailySeed, DailySeed } from '../../api/getDailySeed';
import { postBeerdleScore } from '../../api/postBeerdleScore';
import { getTodayBeerdleScore, BeerdleScore } from '../../api/getUserBeerdleStats';
import { BeerdleWinModal } from './BeerdleWinModal';

export const BeerdleGame = () => {
  const { width, height } = useWindowSize();
  const { user } = useAuth();

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
  const [error, setError] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingScore, setExistingScore] = useState<BeerdleScore | null>(null);
  const [dailySeedData, setDailySeedData] = useState<DailySeed | null>(null);

  // Fetch daily seed and check for existing score on mount
  useEffect(() => {
    const fetchSeedAndCheckScore = async () => {
      try {
        const seedData = await getDailySeed();
        setDailySeedData(seedData);

        // Check if logged-in user has already completed today's Beerdle
        if (user?.id) {
          const todayScore = await getTodayBeerdleScore(user.id);
          if (todayScore) {
            setAlreadyCompleted(true);
            setExistingScore(todayScore);
            return; // Don't initialize the game if already completed
          }
        }

        setSeed(seedData.seed, seedData.day_number, seedData.game_date);
      } catch (err) {
        setError("Failed to load today's game. Please refresh the page.");
        console.error('Failed to fetch daily seed:', err);
      }
    };

    fetchSeedAndCheckScore();
  }, [setSeed, user?.id]);

  // Save score when game is won (only if not already completed)
  useEffect(() => {
    const saveScore = async () => {
      if (
        gameState.isGameOver &&
        gameState.hasWon &&
        user?.id &&
        gameState.gameDate &&
        !alreadyCompleted
      ) {
        try {
          await postBeerdleScore(user.id, gameState.gameDate, gameState.attempts);
          setAlreadyCompleted(true);
          setExistingScore({
            id: 0,
            user_id: user.id,
            game_date: gameState.gameDate,
            score: gameState.attempts,
            created_at: new Date().toISOString(),
          });
          setIsNewBest(true);
          setPreviousBest(null);
          setShowWinModal(true);
        } catch (err) {
          console.error('Failed to save score:', err);
          // Still show modal even if save fails
          setShowWinModal(true);
        }
      } else if (gameState.isGameOver && gameState.hasWon && !user) {
        // Show modal for non-logged-in users too
        setShowWinModal(true);
      }
    };

    saveScore();
  }, [
    gameState.isGameOver,
    gameState.hasWon,
    gameState.attempts,
    gameState.gameDate,
    user,
    alreadyCompleted,
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

  if (gameState.isLoading && !alreadyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
        <p className="mt-4 text-lg">Loading today&apos;s game...</p>
      </div>
    );
  }

  // Show completed state if user has already played today
  if (alreadyCompleted && existingScore && dailySeedData) {
    const beers = '🍺'.repeat(existingScore.score);
    const shareText = `Beerdle #${dailySeedData.day_number}\n\n${beers}\n\nhttps://ridethebus.party/beerdle`;

    return (
      <div className="flex flex-col items-center justify-center">
        {/* Day indicator */}
        <div className="mb-6 rounded-full bg-amber-600/20 px-4 py-1">
          <span className="text-amber-400">Beerdle #{dailySeedData.day_number}</span>
        </div>

        <div className="mb-6 rounded-xl bg-gray-800 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-600/90">
              <span className="text-3xl">✓</span>
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">Already Completed!</h2>
          <p className="mb-4 text-gray-300">
            You finished today&apos;s Beerdle in{' '}
            <span className="font-bold text-amber-400">{existingScore.score}</span> attempt
            {existingScore.score !== 1 ? 's' : ''}
          </p>

          <div className="mb-6 rounded-lg bg-gray-700 p-4">
            <p className="mb-2 text-sm text-gray-400">Your result:</p>
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
      {gameState.hasWon && <Confetti width={width} height={height} />}

      <div className="flex flex-col items-center justify-center">
        {/* Day indicator */}
        {gameState.dayNumber && (
          <div className="mb-6 rounded-full bg-amber-600/20 px-4 py-1">
            <span className="text-amber-400">Beerdle #{gameState.dayNumber}</span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-5">
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
          Attempts: <span className="text-amber-400">{gameState.attempts}</span>
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
