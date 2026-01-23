import { Tool } from "../types/tools";

export const tools: Tool[] = [
  {
    id: "selector",
    name: "Student Selector",
    description: "Randomly pick students for participation with fun animations and confetti",
    icon: "🎯",
    path: "/tools/selector",
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
  },
  {
    id: "teams",
    name: "Team Generator",
    description: "Randomly divide students into teams for group activities and projects",
    icon: "👥",
    path: "/tools/teams",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
  },
  {
    id: "timer",
    name: "Class Timer",
    description: "Customizable countdown timer for activities, breaks, and sessions with presets",
    icon: "⏱️",
    path: "/tools/timer",
    gradient: "from-orange-500 via-red-500 to-pink-500",
  },
  {
    id: "feedback",
    name: "Live Feedback",
    description: "Collect real-time anonymous feedback during training sessions",
    icon: "💬",
    path: "/tools/feedback",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
];
