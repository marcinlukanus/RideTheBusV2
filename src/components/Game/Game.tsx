import { Card } from '../Card/Card';
import { Button } from '../ui/Button';
import { useEffect, useState } from 'react';
import {
  HigherLowerOrSame,
  InsideOutsideOrSame,
  RedOrBlack,
  suits,
  useGameState,
} from './useGameState';
import Confetti from 'react-confetti';
import { createPortal } from 'react-dom';
import { useDocumentSize } from '../../helpers/hooks/useDocumentSize';
import { postScore } from '../../api/postScore';
// import { BestScores } from '../BestScores/BestScores';
import { LongestRides } from '../LongestRides/LongestRides';
import { postCardCounts } from '../../api/postCardCounts';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProfileById } from '../../api/getProfileById';
import { queryKeys } from '../../lib/queryKeys';
import { getConfettiColors } from '../../utils/countryColors';
import { Link } from '@tanstack/react-router';
import { MedalTable } from '../MedalTable/MedalTable';

const COUNTRY_PROMPT_KEY = 'country_prompt_dismissed';

export const Game = () => {
  const { user } = useAuth();
  const { width, height } = useDocumentSize();
  const [promptDismissed, setPromptDismissed] = useState(true);

  useEffect(() => {
    setPromptDismissed(localStorage.getItem(COUNTRY_PROMPT_KEY) === '1');
  }, []);

  const { gameState, dispatch, finalRound, firstRound, secondRound, thirdRound } = useGameState();

  const { data: currentProfile, isSuccess: profileLoaded } = useQuery({
    queryKey: queryKeys.profileById(user?.id ?? ''),
    queryFn: () => getProfileById(user!.id),
    enabled: !!user?.id,
  });

  const userCountry = currentProfile?.country ?? null;
  const confettiColors = getConfettiColors(userCountry);

  // Show prompt when logged-in user with a loaded profile and no country wins
  const showCountryPrompt =
    !!user &&
    profileLoaded &&
    userCountry === null &&
    !promptDismissed &&
    gameState.isGameOver &&
    gameState.hasWon;

  const handleDismissPrompt = () => {
    localStorage.setItem(COUNTRY_PROMPT_KEY, '1');
    setPromptDismissed(true);
  };

  useEffect(() => {
    // Draw cards on initial render
    dispatch({ type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
  }, []);

  useEffect(() => {
    // Post score when game is won
    if (gameState.isGameOver && gameState.hasWon) {
      postScore(gameState.timesRedrawn, user?.id);
    }
  }, [gameState.isGameOver, gameState.hasWon, gameState.timesRedrawn, user?.id]);

  useEffect(() => {
    // Post cards after game is over
    if (gameState.isGameOver) {
      postCardCounts(gameState.cards);
    }
  }, [gameState.isGameOver, gameState.cards]);

  const renderButtons = () => {
    switch (gameState.currentRound) {
      case 1:
        return (
          <>
            {(['red', 'black'] as RedOrBlack[]).map((color) => (
              <button
                key={color}
                className={`cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md ${
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
                className="cursor-pointer rounded-lg bg-white px-4 py-2 text-lg font-bold text-black shadow-md"
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
                className="cursor-pointer rounded-lg bg-white px-4 py-2 text-lg font-bold text-black shadow-md"
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
                className={`cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md ${
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

  return (
    <>
      {gameState.hasWon &&
        createPortal(
          <Confetti
            width={width}
            height={height}
            colors={confettiColors}
            style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
          />,
          document.body,
        )}

      <div className="flex flex-col items-center justify-center">
        <div className="xs:grid-cols-4 grid grid-cols-2 justify-items-center gap-5">
          {gameState.cards.map((card, index) => (
            <Card
              key={index}
              rank={card.values.rank}
              showCardBack={card.showCardBack}
              suit={card.suit}
            />
          ))}
        </div>

        {gameState.isGameOver && (
          <div className="mt-8 flex">
            <Button
              variant="ghost"
              onClick={() =>
                dispatch({
                  type: 'DRAW_CARDS',
                  amountToDraw: 4,
                  resetScore: gameState.hasWon,
                })
              }
            >
              {gameState.hasWon ? 'Another Ride?' : 'Redraw Cards'}
            </Button>
          </div>
        )}

        {!gameState.isGameOver && <div className="mt-8 flex gap-5">{renderButtons()}</div>}

        {gameState.isGameOver && (
          <p className="mt-8 text-lg font-bold">
            {gameState.hasWon ? 'You won!' : 'Take a drink!'}
          </p>
        )}

        <p className="mt-4 text-xl font-bold">Drinks taken: {gameState.timesRedrawn}</p>

        {showCountryPrompt && (
          <div className="mt-6 flex max-w-sm items-start gap-3 rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm">
            <span className="mt-0.5 text-lg leading-none">🌍</span>
            <div className="flex-1">
              <p className="text-white">
                Which country are you drinking for? Set your flag and appear on the Medal Table.
              </p>
              <Link
                to="/$username/profile"
                params={{ username: currentProfile?.username ?? '' }}
                className="mt-1 inline-block text-sky-400 hover:underline"
                onClick={handleDismissPrompt}
              >
                Set my country →
              </Link>
            </div>
            <button
              className="mt-0.5 text-gray-400 hover:text-white"
              onClick={handleDismissPrompt}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-5">
          {/* <BestScores /> */}
          <LongestRides />
          <MedalTable />
        </div>
      </div>
    </>
  );
};
