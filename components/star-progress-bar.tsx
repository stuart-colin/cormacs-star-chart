// components/star-progress-bar.tsx
'use client';

import * as React from "react"

import { Progress } from "@/components/ui/progress"

interface StarProgressBarProps {
  currentStars: number;
  targetStars: number;
}

export function StarProgressBar({ currentStars, targetStars }: StarProgressBarProps) {
  // Calculate the percentage, ensuring it doesn't go above 100
  const progressPercentage = Math.min((currentStars / targetStars) * 100, 100);

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>Stars Earned: {currentStars}</span>
        <span>Goal: {targetStars} Stars</span>
      </div>
      <Progress value={progressPercentage} className="w-full" />
      {currentStars >= targetStars && (
        <p className="text-center text-lg font-semibold text-yellow-600">Prize Earned! 🎉</p>
      )}
    </div>
  )
}