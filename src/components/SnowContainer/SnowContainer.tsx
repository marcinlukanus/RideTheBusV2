import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Snowfall } from 'react-snowfall';

export const SnowContainer = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkSnowEnabled = () => {
      setIsEnabled(document.body.classList.contains('snow-enabled'));
    };

    // Check initial state
    checkSnowEnabled();

    // Watch for changes
    const observer = new MutationObserver(checkSnowEnabled);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!isEnabled) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50">
      <Snowfall snowflakeCount={400} speed={[0.5, 3]} wind={[-0.5, 2]} radius={[0.5, 3]} />
    </div>,
    document.body,
  );
};
