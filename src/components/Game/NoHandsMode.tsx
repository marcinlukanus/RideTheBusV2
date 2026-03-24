import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  NoHandsPreset,
  RedOrBlack,
  HigherLowerOrSame,
  InsideOutsideOrSame,
  Suit,
  suits,
} from './useGameState';

interface Props {
  isActive: boolean;
  preset: NoHandsPreset | null;
  isSaving: boolean;
  onToggle: (active: boolean) => void;
  onSavePreset: (preset: NoHandsPreset) => void;
}

const ROUND1_OPTIONS: RedOrBlack[] = ['red', 'black'];
const ROUND2_OPTIONS: HigherLowerOrSame[] = ['higher', 'lower', 'same'];
const ROUND3_OPTIONS: InsideOutsideOrSame[] = ['inside', 'outside', 'same'];

const formatSuit = (suit: Suit) => suit.charAt(0) + suit.slice(1).toLowerCase();
const formatLabel = (val: string) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();

const DEFAULT_DRAFT: NoHandsPreset = {
  round1: 'red',
  round2: 'higher',
  round3: 'inside',
  round4: 'HEARTS',
};

const presetSummary = (p: NoHandsPreset) =>
  `${formatLabel(p.round1)} · ${formatLabel(p.round2)} · ${formatLabel(p.round3)} · ${formatSuit(p.round4)}`;

export const NoHandsMode = ({ isActive, preset, isSaving, onToggle, onSavePreset }: Props) => {
  const [showSetup, setShowSetup] = useState(false);
  const [draft, setDraft] = useState<NoHandsPreset>(preset ?? DEFAULT_DRAFT);

  const handleOpenSetup = () => {
    setDraft(preset ?? DEFAULT_DRAFT);
    setShowSetup(true);
  };

  const handleSave = () => {
    onSavePreset(draft);
    setShowSetup(false);
  };

  const inactive = 'border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white';

  const redBlackClass = (opt: RedOrBlack, selected: boolean) =>
    selected
      ? `cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md text-white ${opt === 'red' ? 'bg-red-600' : 'bg-black'}`
      : `cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md transition-colors ${inactive}`;

  const whiteClass = (selected: boolean) =>
    selected
      ? 'cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md bg-white text-black'
      : `cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md transition-colors ${inactive}`;

  const suitClass = (suit: Suit, selected: boolean) => {
    const isRed = suit === 'HEARTS' || suit === 'DIAMONDS';
    return selected
      ? `cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md text-white ${isRed ? 'bg-red-600' : 'bg-black'}`
      : `cursor-pointer rounded-lg px-4 py-2 text-lg font-bold shadow-md transition-colors ${inactive}`;
  };

  const modal = showSetup && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setShowSetup(false); }}
    >
      <div className="w-full max-w-sm rounded-xl border border-amber-600/40 bg-surface-raised p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-400">🙌 Call your shot</p>
            <p className="mt-0.5 text-xs text-gray-400">Pick one answer per round. The bus drives itself. You just drink.</p>
          </div>
          <button
            className="text-gray-500 hover:text-white transition-colors"
            onClick={() => setShowSetup(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-500">Round 1</p>
            <div className="grid grid-cols-2 gap-2">
              {ROUND1_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={redBlackClass(opt, draft.round1 === opt)}
                  onClick={() => setDraft((d) => ({ ...d, round1: opt }))}
                >
                  {formatLabel(opt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">Round 2</p>
            <div className="grid grid-cols-3 gap-2">
              {ROUND2_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={whiteClass(draft.round2 === opt)}
                  onClick={() => setDraft((d) => ({ ...d, round2: opt }))}
                >
                  {formatLabel(opt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">Round 3</p>
            <div className="grid grid-cols-3 gap-2">
              {ROUND3_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={whiteClass(draft.round3 === opt)}
                  onClick={() => setDraft((d) => ({ ...d, round3: opt }))}
                >
                  {formatLabel(opt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">Round 4</p>
            <div className="grid grid-cols-2 gap-2">
              {suits.map((suit) => (
                <button
                  key={suit}
                  className={suitClass(suit, draft.round4 === suit)}
                  onClick={() => setDraft((d) => ({ ...d, round4: suit }))}
                >
                  {formatSuit(suit)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60 transition-colors"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowSetup(false)}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showSetup && createPortal(modal, document.body)}

      <div className="mt-6 flex items-center gap-3 rounded-md border border-amber-600/40 bg-amber-900/10 px-3 py-2">
        <span className="text-sm font-semibold text-amber-400">🙌 No Hands</span>

        {preset ? (
          <>
            <span className="flex-1 text-xs text-gray-400">{presetSummary(preset)}</span>
            <button
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              onClick={handleOpenSetup}
            >
              Edit
            </button>
            <div
              className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${isActive ? 'bg-amber-600' : 'bg-gray-600'}`}
              onClick={() => onToggle(!isActive)}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </div>
          </>
        ) : (
          <button
            className="rounded border border-amber-600/60 px-2 py-0.5 text-xs text-amber-400 hover:border-amber-500 hover:text-amber-300 transition-colors"
            onClick={handleOpenSetup}
          >
            Set up
          </button>
        )}
      </div>
    </>
  );
};
