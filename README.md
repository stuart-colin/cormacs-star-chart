# Cormac's Star Chart ✨

A fun and interactive weekly behavioral reward chart built with Next.js and ShadCN UI, designed to encourage good behavior and task completion for young children.

## Overview

"Cormac's Star Chart" is a personalized web application created to help parents track and reward a child's daily tasks and behaviors throughout the week. Instead of a traditional paper chart, this digital version offers engaging visual feedback like colorful, bouncing stars and a celebratory confetti display upon reaching weekly goals.

## Features

*   **Weekly Calendar View:** Displays tasks for each day of the week, starting with Sunday.
*   **Hide Weekends Toggle:** Option to focus specifically on weekday/school-day behaviors.
*   **Task Tracking:** Check off completed tasks for each day.
*   **Randomized Star Rewards:** Each completed task earns a star with a random color and a fun bounce animation with randomized speed variations.
*   **Progress Bar:** Visually tracks the total number of stars earned towards a weekly prize goal.
*   **Prize Celebration:** A full-screen confetti display erupts when the weekly star target is reached.
*   **Responsive Design:** Built with ShadCN UI and Tailwind CSS for a clean, playful look that works across different devices.

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Confetti Animation:** `react-confetti`

## Getting Started

```bash
git clone [your-repo-url]
cd cormacs-star-chart
npm install # or yarn install
npm run dev # or yarn dev
```

## Future Enhancements (Potential)

*   Data persistence (e.g., using Google Cloud Storage) to save progress between sessions.
*   Customization options for tasks and prize goals.
*   Different types of rewards or visual milestones.
*   User accounts (if needed for multiple children or charts).