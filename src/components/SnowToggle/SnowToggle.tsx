import { useState, useEffect } from 'react';

const SNOW_STORAGE_KEY = 'snow-effect-enabled';

export const SnowToggle = () => {
  const [isSnowEnabled, setIsSnowEnabled] = useState(() => {
    const stored = localStorage.getItem(SNOW_STORAGE_KEY);
    const enabled = stored === 'true';
    // Set initial body class immediately
    if (enabled) {
      document.body.classList.add('snow-enabled');
    } else {
      document.body.classList.remove('snow-enabled');
    }
    return enabled;
  });

  useEffect(() => {
    // Update body class and localStorage when state changes
    if (isSnowEnabled) {
      document.body.classList.add('snow-enabled');
      localStorage.setItem(SNOW_STORAGE_KEY, 'true');
    } else {
      document.body.classList.remove('snow-enabled');
      localStorage.setItem(SNOW_STORAGE_KEY, 'false');
    }
  }, [isSnowEnabled]);

  return (
    <button
      onClick={() => setIsSnowEnabled(!isSnowEnabled)}
      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
      title={isSnowEnabled ? 'Disable snow' : 'Enable snow'}
      aria-label={isSnowEnabled ? 'Disable snow effect' : 'Enable snow effect'}
    >
      <span
        className={'text-lg transition-opacity duration-200' + (isSnowEnabled ? '' : ' opacity-40')}
      >
        ❄️
      </span>
    </button>
  );
};
