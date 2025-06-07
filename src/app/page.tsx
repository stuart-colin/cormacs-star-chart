// app/page.tsx
'use client';
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils"; // Import cn for conditional class joining
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { FireworksOverlay } from '@/components/fireworks-overlay'; // Import the FireworksOverlay
import { StarProgressBar } from '@/components/star-progress-bar'; // Import the new component
import { StarIcon } from '@/components/star-icon'; // Import the new StarIcon component
import { db } from '@/lib/firebase'; // Import Firestore instance from your firebase.ts
import { doc, onSnapshot, setDoc } from 'firebase/firestore'; // Import Firestore functions

interface Task {
  id: string;
  name: string;
  completed: boolean;
  starColorClass?: string | null; // To store the randomized color class, allowing null
  starBounceSpeedClass?: string | null; // To store the randomized bounce speed, allowing null
}

interface DaySchedule {
  id: string;
  dayName: string;
  tasks: Task[];
}

const commonTasks: Omit<Task, 'id' | 'completed'>[] = [
  { name: 'Get Dressed Without Fuss' },
  { name: 'Eat Breakfast Nicely' },
  { name: 'Brush Teeth (Morning)' },
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
  'animate-bounce',             // Normal speed (Tailwind's default 1s)
  'animate-bounce-slow',        // Slower speed (1.5s) - Matches globals.css
  'animate-bounce-slow-medium', // Slower-medium speed (1.25s) - Matches globals.css
  'animate-bounce-medium-fast', // Medium-fast speed (0.75s) - Matches globals.css
  'animate-bounce-fast',        // Faster speed (0.5s) - Matches globals.css

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

const FIRESTORE_COLLECTION = 'starCharts'; // Must match your API route if you still use it for writes
const FIRESTORE_DOCUMENT_ID = 'cormacWeeklySchedule'; // Must match your API route

// Helper function to remove undefined properties recursively
// Firestore doesn't support undefined values.
function cleanScheduleForFirestore(schedule: DaySchedule[]): DaySchedule[] {
  return JSON.parse(JSON.stringify(schedule), (key, value) => {
    // If you want to explicitly store nulls for cleared optional fields:
    // if (value === undefined && (key === 'starColorClass' || key === 'starBounceSpeedClass')) {
    //   return null;
    // }
    // If you prefer to omit the fields entirely when undefined:
    return value === undefined ? null : value; // Or simply: return value === undefined ? undefined : value; and let stringify remove them
    // However, converting to null is safer if other parts of your app expect the keys.
    // For this case, let's convert to null to be explicit.
  });
}

async function saveScheduleToCloud(schedule: DaySchedule[]) {
  // This function now directly uses the client SDK for writes.
  // Your API POST route is still available if you prefer writes through the backend.
  try {
    // Ensure db is imported from '@/lib/firebase'
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT_ID);
    // We store the schedule array under a field, e.g., 'scheduleData'
    // Using setDoc will overwrite the document or create it if it doesn't exist.
    // If you want to merge, you can pass { merge: true } as a third argument to setDoc,
    // but for this use case, overwriting the entire scheduleData array is appropriate.
    const cleanedSchedule = cleanScheduleForFirestore(schedule);
    await setDoc(docRef, { scheduleData: cleanedSchedule });
    console.log("Schedule saved to cloud successfully.");
  } catch (error) {
    console.error("Error saving schedule to cloud:", error);
    // Optionally, notify the user about the save failure
  }
}

export default function CormacsStarChartPage() {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(initialWeeklySchedule);
  const [hideWeekends, setHideWeekends] = useState(true); // State to toggle weekend visibility, true by default to hide
  const PRIZE_TARGET = 20; // Define the target number of stars for the prize
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For loading state


  const toggleTaskCompletion = (dayId: string, taskId: string) => {
    setWeeklySchedule(prevSchedule => {
      const newSchedule = prevSchedule.map(day => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          tasks: day.tasks.map(task => {
            if (task.id !== taskId) return task;

            const isCompleting = !task.completed;
            const newColorClass = isCompleting
              ? starColorClasses[Math.floor(Math.random() * starColorClasses.length)]
              : null; // Set to null instead of undefined
            const newBounceSpeedClass = isCompleting
              ? starBounceSpeedClasses[Math.floor(Math.random() * starBounceSpeedClasses.length)]
              : null; // Set to null instead of undefined

            return { ...task, completed: isCompleting, starColorClass: newColorClass, starBounceSpeedClass: newBounceSpeedClass };
          }),
        };
      });
      saveScheduleToCloud(newSchedule); // Save to cloud after state update
      return newSchedule; // Return the new schedule to update state
    });
  };

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    setIsLoading(true);
    // Ensure db is imported from '@/lib/firebase'
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT_ID);

    const unsubscribe = onSnapshot(
      docRef,
      // Success callback for onSnapshot
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Make sure 'scheduleData' exists and is an array
          const cloudSchedule = data.scheduleData as DaySchedule[] | undefined;
          if (Array.isArray(cloudSchedule) && cloudSchedule.length > 0) {
            setWeeklySchedule(cloudSchedule);
          } else {
            // Document exists but scheduleData is missing, empty, or not an array.
            // save the initial schedule to establish a baseline.
            setWeeklySchedule(initialWeeklySchedule);
            saveScheduleToCloud(initialWeeklySchedule);
          }
        } else {
          // Document does not exist, save initial schedule to create it
          console.log("No such document! Initializing with default schedule in Firestore.");
          setWeeklySchedule(initialWeeklySchedule);
          saveScheduleToCloud(initialWeeklySchedule);
        }
        setIsLoading(false); // This should be at the end of the success callback's logic
      },
      // Error callback for onSnapshot
      (error) => {
        console.error("Error subscribing to schedule updates:", error);
        setWeeklySchedule(initialWeeklySchedule); // Fallback on error
        setIsLoading(false); // Correctly placed inside the error callback
      });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

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
      // If stars drop below target (e.g., after reset), ensure celebration is hidden
      setShowCelebration(false);
    }
  }, [totalStars, PRIZE_TARGET]);

  const resetWeek = () => {
    // Create a deep copy to avoid modifying the original initialWeeklySchedule structure
    // and ensure starColorClass is also reset
    const newInitialSchedule = JSON.parse(JSON.stringify(initialWeeklySchedule));
    const resetSchedule = newInitialSchedule.map((day: DaySchedule) => ({
      ...day, // Keep other day properties
      tasks: day.tasks.map((task: Task) => ({ ...task, completed: false, starColorClass: null, starBounceSpeedClass: null })), // Reset to null
    }));
    setWeeklySchedule(resetSchedule);
    saveScheduleToCloud(resetSchedule); // Save the reset schedule to cloud
    setShowCelebration(false); // Hide celebration on reset
  }

  const displayedSchedule = hideWeekends
    ? weeklySchedule.filter(day => day.dayName !== "Saturday" && day.dayName !== "Sunday")
    : weeklySchedule;

  if (isLoading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <p className="text-2xl text-blue-600">Loading Cormac&apos;s Star Chart...</p>
      </main>
    );
  }
  return (
    <main className="max-w-screen-3xl mx-auto p-4 md:p-8">
      <FireworksOverlay // Assuming FireworksOverlay is your confetti component
        isVisible={showCelebration}
      />
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 flex flex-col items-center mb-8 gap-4 bg-white pb-4"> {/* Added sticky, top-0, z-10, bg-white, and pb-4 */}
        {/* Main Header - Adjusted text size for responsiveness */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-blue-600 group whitespace-nowrap">
          Cormac&apos;s Star Chart <span className="inline-block transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 ease-out">✨</span> {/* Applied font-chewy to the text part */}
        </h1>
        <div className="w-full max-w-3xl"> {/* Increased max-width for controls and progress bar */}
          {/* Row for Total Stars, Hide Weekends toggle, and Reset Week button */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <p className="text-2xl font-bold text-amber-500">Total Stars: {totalStars}</p> {/* Adjusted for consistency */}
            <div className="flex items-center space-x-3"> {/* Increased space from space-x-2 to space-x-3 */}
              <Switch
                id="show-weekends"
                checked={hideWeekends} // Bind to hideWeekends state
                className="transform scale-110 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-blue-500" // Added transform scale-110
                onCheckedChange={setHideWeekends} // Update hideWeekends state
                aria-label="Toggle weekend visibility"
              />
              <Label htmlFor="show-weekends" className="text-base font-medium text-gray-700"> {/* Changed text-sm to text-base */}
                Hide Weekends
              </Label>
            </div>
            <Button onClick={resetWeek} variant="outline" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base">Reset Week</Button>
          </div>
          <StarProgressBar currentStars={totalStars} targetStars={PRIZE_TARGET} /> {/* Add the progress bar */}
        </div>
      </div>

      {/* Use Flexbox to center the cards in the row, allowing them to wrap */}
      <div className="flex flex-wrap justify-center gap-4">
        {displayedSchedule.map(day => {
          const dailyStars = day.tasks.filter(task => task.completed).length;
          return (
            <Card
              key={day.id}
              // Add position: relative for absolute positioning of the star count
              className="flex flex-col bg-white shadow-lg rounded-xl border-2 border-sky-200 w-80" // Removed 'relative' as it's no longer needed for this
            >
              {/* Removed the absolutely positioned daily star count div from here */}

              <CardHeader className="flex justify-between items-center"> {/* Make CardHeader a flex container */}
                <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-500 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                  {day.dayName}
                </CardTitle>
                {/* Daily Star Count Display - now inline with CardTitle */}
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-700 mr-1">{dailyStars}</span>
                  <StarIcon
                    isCompleted={true} // Always show as "filled" for display purposes
                    colorClass="animate-rainbow-fade" // Apply the new animation class
                    baseClassName="h-5 w-5" // Ensure size is appropriate
                  />
                </div>
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
                      className={cn(
                        "h-5 flex-grow cursor-pointer text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis text-base",
                        task.completed && "line-through text-slate-400",
                      )}
                    >
                      {task.name}
                    </Label>
                    <StarIcon
                      isCompleted={task.completed}
                      colorClass={task.starColorClass ?? undefined}
                      bounceClass={task.starBounceSpeedClass ?? undefined}
                      baseClassName="h-5 w-5"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}