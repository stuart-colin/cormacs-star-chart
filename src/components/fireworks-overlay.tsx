// src/components/fireworks-overlay.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

// Simple hook to get window size
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

interface FireworksOverlayProps {
  isVisible: boolean;
}

export function FireworksOverlay({ isVisible }: FireworksOverlayProps) {
  const { width, height } = useWindowSize();

  if (!isVisible) {
    return null;
  }

  return (
    // The Confetti component will render a canvas over the whole screen
    // We pass the window dimensions to ensure it covers everything
    <Confetti
      width={width}
      height={height}
      recycle={false} // Confetti stops after a burst
      numberOfPieces={500} // Adjust number of pieces
      gravity={0.1} // Adjust gravity for slower/faster fall
      tweenDuration={5000} // Duration of the initial burst animation
    />
  );
}