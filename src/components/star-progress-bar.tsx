// components/star-progress-bar.tsx
'use client';

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

interface StarProgressBarProps {
  currentStars: number;
  targetStars: number;
}

export function StarProgressBar({ currentStars, targetStars }: StarProgressBarProps) {
  // Calculate the percentage, ensuring it doesn't go above 100
  const progressPercentage = Math.min((currentStars / targetStars) * 100, 100);

  return (
    <div className="w-full mx-auto space-y-2"> {/* Removed max-w-md */}
      <div className="flex justify-between text-sm font-medium">
        <span>Stars Earned: {currentStars}</span>
        <span>Goal: {targetStars} Stars</span>
      </div>
      <ProgressPrimitive.Root
        value={progressPercentage}
        // The Root has the full gradient that will be revealed from left to right.
        // It also needs the standard container styles for shape and overflow.
        className="relative h-4 w-full overflow-hidden rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-green-500"
      >
        <ProgressPrimitive.Indicator
          // This "Indicator" acts as a cover for the unearned portion.
          // It's the color of the empty track and moves to the right.
          // `absolute` positioning is important here.
          className="absolute top-0 left-0 h-full w-full bg-slate-200 dark:bg-slate-800 transition-transform duration-300 ease-linear"
          style={{ transform: `translateX(${progressPercentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {currentStars >= targetStars && (
        // Added flex, items-center, justify-center and increased px-6
        <p className="fixed bottom-4 left-1/2 -translate-x-1/2 transform z-40
                       flex items-center justify-center px-6 py-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600
                       text-white text-2xl font-bold rounded-lg shadow-xl
                       animate-bounce whitespace-nowrap"> {/* Added whitespace-nowrap and increased px to px-8 */}
          🥳 Prize Earned! 🏆
        </p>
      )}
    </div>
  )
}