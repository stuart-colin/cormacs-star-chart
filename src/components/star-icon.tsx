'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react'; // Using lucide-react Star directly
import { cn } from '@/lib/utils';

// Constants for spin animations (should match definitions in globals.css or tailwind.config.ts)
const starSpinAnimationClasses = [
  'animate-spin-once',
  'animate-spin-slow-once',
];
const spinAnimationDurations: { [key: string]: number } = {
  'animate-spin-once': 700, // Corresponds to 0.7s in globals.css
  'animate-spin-slow-once': 1200, // Corresponds to 1.2s in globals.css
};

const PERIODIC_SPIN_INTERVAL_MS = 7000; // e.g., attempt a spin every 7 seconds
const PERIODIC_SPIN_CHANCE = 0.15; // 15% chance for a periodic spin

interface StarIconProps {
  isCompleted: boolean;
  colorClass?: string;
  bounceClass?: string;
  baseClassName?: string; // For common classes like h-6 w-6
}

export const StarIcon: React.FC<StarIconProps> = ({
  isCompleted,
  colorClass,
  bounceClass,
  baseClassName,
}) => {
  const [currentSpinClass, setCurrentSpinClass] = useState<string | undefined>(undefined);
  const spinClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const periodicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to apply a spin and set a timeout to clear it
  const applySpin = (spinClass: string) => {
    if (spinClearTimeoutRef.current) {
      clearTimeout(spinClearTimeoutRef.current); // Clear any pre-existing timeout
    }
    setCurrentSpinClass(spinClass);
    const duration = spinAnimationDurations[spinClass] || 0;
    if (duration > 0) {
      spinClearTimeoutRef.current = setTimeout(() => {
        setCurrentSpinClass(undefined);
        spinClearTimeoutRef.current = null;
      }, duration);
    } else {
      setCurrentSpinClass(undefined); // If no duration, clear immediately (should not happen with current setup)
    }
  };

  // Effect for the initial spin when 'isCompleted' becomes true
  useEffect(() => {
    if (isCompleted) {
      const initialSpin = starSpinAnimationClasses[Math.floor(Math.random() * starSpinAnimationClasses.length)];
      applySpin(initialSpin);
    } else {
      // If task is uncompleted, clear current spin and any pending timeout
      if (spinClearTimeoutRef.current) {
        clearTimeout(spinClearTimeoutRef.current);
        spinClearTimeoutRef.current = null;
      }
      setCurrentSpinClass(undefined);
    }
    // Cleanup for this effect (clears timeout if component unmounts or isCompleted changes)
    return () => {
      if (spinClearTimeoutRef.current) {
        clearTimeout(spinClearTimeoutRef.current);
        spinClearTimeoutRef.current = null;
      }
    };
  }, [isCompleted]);

  // Effect for periodic random spins while 'isCompleted' is true
  useEffect(() => {
    if (isCompleted) {
      periodicIntervalRef.current = setInterval(() => {
        if (isCompleted && !currentSpinClass && Math.random() < PERIODIC_SPIN_CHANCE) {
          const periodicSpin = starSpinAnimationClasses[Math.floor(Math.random() * starSpinAnimationClasses.length)];
          applySpin(periodicSpin);
        }
      }, PERIODIC_SPIN_INTERVAL_MS);
    }
    // Cleanup: clear interval when isCompleted becomes false or component unmounts
    return () => {
      if (periodicIntervalRef.current) {
        clearInterval(periodicIntervalRef.current);
        periodicIntervalRef.current = null;
      }
    };
  }, [isCompleted, currentSpinClass]); // Re-evaluate if isCompleted changes or a spin starts/ends

  if (!isCompleted) {
    return null; // Don't render the star if the task is not completed
  }

  return (
    <div
      className={cn(
        baseClassName, // Applies size (e.g., h-5 w-5) to the wrapper
        bounceClass,   // Bounce animation applied to the wrapper
        // Ensures the div behaves like an icon and centers the star
        'inline-flex items-center justify-center'
      )}
    >
      <Star
        className={cn(
          // Star should fill the wrapper
          'h-full w-full',
          colorClass,        // Color applied to the Star SVG
          currentSpinClass   // Spin animation applied to the Star SVG
        )}
      />
    </div>
  );
};