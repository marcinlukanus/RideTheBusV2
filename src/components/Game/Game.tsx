import { Card } from '../Card/Card';
import { Button } from '../ui/Button';
import { useEffect, useRef, useState } from 'react';
import {
  HigherLowerOrSame,
  InsideOutsideOrSame,
  NoHandsPreset,
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
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfileById } from '../../api/getProfileById';
import { queryKeys } from '../../lib/queryKeys';
import { getConfettiColors } from '../../utils/countryColors';
import { Link } from '@tanstack/react-router';
import { MedalTable } from '../MedalTable/MedalTable';
import { NoHandsMode } from './NoHandsMode';
import supabase from '../../utils/supabase';
import { queryClient } from '../../lib/queryClient';

const COUNTRY_PROMPT_KEY = 'country_prompt_dismissed';
const NO_HANDS_ACTIVE_KEY = 'no_hands_active';
// Delay between auto-played rounds (ms)
const ROUND_DELAY = 1200;
// Longer pause after an incorrect guess so the user can take their drink
const DRINK_DELAY = 3000;

export const Game = () => {
  const { user } = useAuth();
  const { width, height } = useDocumentSize();
  const [promptDismissed, setPromptDismissed] = useState(true);
  const [noHandsActive, setNoHandsActive] = useState(false);
  const noHandsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPromptDismissed(localStorage.getItem(COUNTRY_PROMPT_KEY) === '1');
    setNoHandsActive(localStorage.getItem(NO_HANDS_ACTIVE_KEY) === '1');
  }, []);

  const { gameState, dispatch, finalRound, firstRound, secondRound, thirdRound } = useGameState();
  const initializedRef = useRef(false);

  const { data: currentProfile, isSuccess: profileLoaded } = useQuery({
    queryKey: queryKeys.profileById(user?.id ?? ''),
    queryFn: () => getProfileById(user!.id),
    enabled: !!user?.id,
  });

  const noHandsPreset = (currentProfile?.no_hands_preset as NoHandsPreset | null | undefined) ?? null;

  const noHandsPresetMutation = useMutation({
    mutationFn: async (preset: NoHandsPreset) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('profiles')
        .update({ no_hands_preset: preset })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profileById(user!.id) });
    },
  });

  const handleToggleNoHands = (active: boolean) => {
    setNoHandsActive(active);
    localStorage.setItem(NO_HANDS_ACTIVE_KEY, active ? '1' : '0');
  };

  const userCountry = currentProfile?.country ?? null;
  const isPerfectRide = gameState.hasWon && gameState.timesRedrawn === 0;
  const confettiColors = getConfettiColors(
    currentProfile?.country_confetti !== false && isPerfectRide ? userCountry : null,
  );

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
    // Draw cards on initial render — ref guard prevents double-dispatch in React Strict Mode,
    // which preserves state across its simulated unmount/remount cycle.
    if (initializedRef.current) return;
    initializedRef.current = true;
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

  // No Hands: auto-play the current round after a brief pause
  useEffect(() => {
    if (!noHandsActive || !noHandsPreset || gameState.cards.length === 0 || gameState.isGameOver) {
      return;
    }
    if (noHandsTimerRef.current) clearTimeout(noHandsTimerRef.current);
    noHandsTimerRef.current = setTimeout(() => {
      switch (gameState.currentRound) {
        case 1: firstRound(noHandsPreset.round1); break;
        case 2: secondRound(noHandsPreset.round2); break;
        case 3: thirdRound(noHandsPreset.round3); break;
        case 4: finalRound(noHandsPreset.round4); break;
      }
    }, ROUND_DELAY);
    return () => {
      if (noHandsTimerRef.current) clearTimeout(noHandsTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noHandsActive, noHandsPreset, gameState.currentRound, gameState.cards.length, gameState.isGameOver]);

  // No Hands: auto-redraw after a miss — pause so the user can drink, then loop again.
  // On a win, stop and let the user restart manually.
  useEffect(() => {
    if (!noHandsActive || !gameState.isGameOver || gameState.hasWon) return;
    if (noHandsTimerRef.current) clearTimeout(noHandsTimerRef.current);
    noHandsTimerRef.current = setTimeout(() => {
      dispatch({ type: 'DRAW_CARDS', amountToDraw: 4, resetScore: false });
    }, DRINK_DELAY);
    return () => {
      if (noHandsTimerRef.current) clearTimeout(noHandsTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noHandsActive, gameState.isGameOver, gameState.hasWon]);

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
              cardBackUrl={currentProfile?.card_back_url}
            />
          ))}
        </div>

        {gameState.isGameOver && (!noHandsActive || gameState.hasWon) && (
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

        {!gameState.isGameOver && !noHandsActive && (
          <div className="mt-8 flex gap-5">{renderButtons()}</div>
        )}

        {gameState.isGameOver && (
          <p className="mt-8 text-lg font-bold">
            {gameState.hasWon ? 'You won!' : 'Take a drink!'}
          </p>
        )}

        {noHandsActive && !gameState.isGameOver && (
          <p className="mt-8 text-sm text-amber-400/70 italic">No Hands is driving...</p>
        )}

        {gameState.cards.length > 0 && (
          <p className="mt-4 text-xl font-bold">Drinks taken: {gameState.timesRedrawn}</p>
        )}

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

        {currentProfile?.is_premium && user && (
          <NoHandsMode
            isActive={noHandsActive}
            preset={noHandsPreset}
            isSaving={noHandsPresetMutation.isPending}
            onToggle={handleToggleNoHands}
            onSavePreset={(preset) => noHandsPresetMutation.mutate(preset)}
          />
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
