import { useState, useEffect } from 'react';

export const useDocumentSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: Math.max(document.documentElement.scrollHeight, window.innerHeight),
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: Math.max(document.documentElement.scrollHeight, window.innerHeight),
      });
    };

    // Update on resize and scroll
    window.addEventListener('resize', updateSize);
    window.addEventListener('scroll', updateSize, { passive: true });

    // Use MutationObserver to watch for DOM changes that might affect height
    const observer = new MutationObserver(updateSize);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Initial update
    updateSize();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('scroll', updateSize);
      observer.disconnect();
    };
  }, []);

  return size;
};

