// app/page.tsx
'use client';
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils"; // Import cn for conditional class joining
import { Label } from "@/components/ui/label";
import { Star } from 'lucide-react'; // Import Smile and CheckCircle2
import { Switch } from "@/components/ui/switch"; // Import Switch
import { FireworksOverlay } from '@/components/fireworks-overlay'; // Import the FireworksOverlay
import { StarProgressBar } from '@/components/star-progress-bar'; // Import the new component

interface Task {
  id: string;
  name: string;
  completed: boolean;
  starColorClass?: string; // To store the randomized color class
  starBounceSpeedClass?: string; // To store the randomized bounce speed
}

interface DaySchedule {
  id: string;
  dayName: string;
  tasks: Task[];
}

const commonTasks: Omit<Task, 'id' | 'completed'>[] = [
  { name: 'Get Dressed Without Fuss' },
  { name: 'Brush Teeth (Morning)' },
  { name: 'Eat Breakfast Nicely' },
  { name: 'Clean Up Toys' },
  { name: 'Eat Dinner Nicely' },
  { name: 'Brush Teeth (Evening)' },
  { name: 'Bath Time Without Fuss' },
  { name: 'Get Ready for Bed Calmly' },
];

// Define a list of fun star color classes
const starColorClasses = [
  'text-yellow-400 fill-yellow-400',
  'text-orange-500 fill-orange-500',
  'text-pink-500 fill-pink-500',
  'text-purple-500 fill-purple-500',
  'text-teal-500 fill-teal-500', // Changed blue to teal for more variety
  'text-lime-500 fill-lime-500',   // Changed green to lime for more variety
];

// Define a list of bounce speed classes
const starBounceSpeedClasses = [
  'animate-bounce',        // Normal speed (Tailwind's default 1s)
  'animate-bounce-slow',   // Slower speed (1.5s)
  'animate-bounce-mediumfast', // Medium fast speed (0.75s)
  'animate-bounce-fast',   // Faster speed (0.7s)
];

// Start the week with Sunday
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const initialWeeklySchedule: DaySchedule[] = daysOfWeek.map(day => ({
  id: day.toLowerCase(),
  dayName: day,
  tasks: commonTasks.map((task, index) => ({
    id: `${day.toLowerCase()}-${index}`,
    name: task.name,
    starColorClass: undefined, // Initialize starColorClass
    starBounceSpeedClass: undefined, // Initialize bounce speed class
    completed: false,
  })),
}));

export default function CormacsStarChartPage() {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(initialWeeklySchedule);
  const [hideWeekends, setHideWeekends] = useState(true); // State to toggle weekend visibility, true by default to hide
  const PRIZE_TARGET = 20; // Define the target number of stars for the prize
  const [showCelebration, setShowCelebration] = useState(false);


  const toggleTaskCompletion = (dayId: string, taskId: string) => {
    setWeeklySchedule(prevSchedule =>
      prevSchedule.map(day => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          tasks: day.tasks.map(task => {
            if (task.id !== taskId) return task;

            const isCompleting = !task.completed;
            const newColorClass = isCompleting
              ? starColorClasses[Math.floor(Math.random() * starColorClasses.length)]
              : undefined; // Clear color if unchecking
            const newBounceSpeedClass = isCompleting
              ? starBounceSpeedClasses[Math.floor(Math.random() * starBounceSpeedClasses.length)]
              : undefined; // Clear bounce speed if unchecking

            return { ...task, completed: isCompleting, starColorClass: newColorClass, starBounceSpeedClass: newBounceSpeedClass };
          }),
        };
      })
    );
  };

  const totalStars = React.useMemo(() => {
    return weeklySchedule.reduce((total, day) => {
      return total + day.tasks.filter(task => task.completed).length;
    }, 0);
  }, [weeklySchedule]);

  useEffect(() => {
    if (totalStars >= PRIZE_TARGET) {
      setShowCelebration(true);
      // Automatically hide celebration after a few seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 10000); // Celebration visible for 8 seconds (adjust as needed)

      // Cleanup the timer if the component unmounts or dependencies change before timeout
      return () => clearTimeout(timer);
    } else {
      // If stars drop below target, ensure celebration is hidden
      setShowCelebration(false);
    }
  }, [totalStars, PRIZE_TARGET]);

  const resetWeek = () => {
    // Create a deep copy to avoid modifying the original initialWeeklySchedule structure
    // and ensure starColorClass is also reset
    const newInitialSchedule = JSON.parse(JSON.stringify(initialWeeklySchedule));
    const resetSchedule = newInitialSchedule.map((day: DaySchedule) => ({
      ...day,
      tasks: day.tasks.map((task: Task) => ({ ...task, completed: false, starColorClass: undefined, starBounceSpeedClass: undefined })),
    }));
    setWeeklySchedule(resetSchedule);
    setShowCelebration(false); // Hide celebration on reset
  }

  const displayedSchedule = hideWeekends
    ? weeklySchedule.filter(day => day.dayName !== "Saturday" && day.dayName !== "Sunday")
    : weeklySchedule;

  return (
    <main className="max-w-screen-3xl mx-auto p-4 md:p-8">
      <FireworksOverlay // Assuming FireworksOverlay is your confetti component
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)} // onClose might not be strictly needed if auto-hiding
      />
      <div className="flex flex-col items-center mb-8 gap-4">
        <h1 className="text-5xl font-bold text-center text-blue-600 group whitespace-nowrap">
          Cormac&apos;s Star Chart <span className="inline-block transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 ease-out">✨</span> {/* Applied font-chewy to the text part */}
        </h1>
        <div className="w-full max-w-3xl"> {/* Increased max-width for controls and progress bar */}
          {/* Row for Total Stars, Hide Weekends toggle, and Reset Week button */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <p className="text-2xl font-bold text-amber-500">Total Stars: {totalStars}</p>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-weekends"
                checked={hideWeekends} // Bind to hideWeekends state
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-blue-500" // Colorful gradient when checked
                onCheckedChange={setHideWeekends} // Update hideWeekends state
                aria-label="Toggle weekend visibility"
              />
              <Label htmlFor="show-weekends" className="text-sm font-medium text-gray-700">
                Hide Weekends
              </Label>
            </div>
            <Button onClick={resetWeek} variant="outline" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base">Reset Week</Button>
          </div>
          <StarProgressBar currentStars={totalStars} targetStars={PRIZE_TARGET} /> {/* Add the progress bar */}
        </div>
      </div>

      {/* Use Flexbox to center the cards in the row, allowing them to wrap */}
      <div className="flex flex-wrap justify-center gap-6 pb-4">
        {displayedSchedule.map(day => (
          <Card
            key={day.id}
            // Give cards a consistent width. Adjust w-72 (18rem, 288px) as needed for your content.
            className="flex flex-col bg-white shadow-lg rounded-xl border-2 border-sky-200 w-80" // Reverted to w-80 as per previous successful state
          >
            <CardHeader>
              <CardTitle className="text-2xl text-center font-semibold bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-500 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                {day.dayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              {day.tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`${day.id}-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(day.id, task.id)}
                    aria-label={`Mark ${task.name} as completed`}
                  />
                  <Label
                    htmlFor={`${day.id}-${task.id}`}
                    className={cn( // Use cn for conditional classes
                      "flex-grow cursor-pointer text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis", // Added whitespace-nowrap, overflow-hidden, text-ellipsis
                      task.completed && "line-through text-slate-400", // Changed single quotes to double quotes
                      // Optional: Add a subtle color to the label based on completion
                      // task.completed ? 'text-green-700' : 'text-gray-700'
                      // Optional: Add a subtle color to the label based on completion
                    )}
                  >
                    {task.name}
                  </Label>
                  {task.completed && task.starColorClass && <Star className={cn(
                    "h-6 w-6 transform scale-110 transition-transform duration-200",
                    task.starColorClass,
                    task.starBounceSpeedClass // Apply the randomized bounce speed class
                  )} />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}