export type FeedbackType = "understanding" | "lost" | "slower" | "faster";

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  timestamp: number;
}

export interface FeedbackSession {
  id: string;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
}

export interface SessionStats {
  understanding: number;
  lost: number;
  slower: number;
  faster: number;
  total: number;
}

// Emoji mapping for feedback types
export const FEEDBACK_CONFIG = {
  understanding: { emoji: "👍", label: "I understand", color: "#10b981" },
  lost: { emoji: "👎", label: "I'm lost", color: "#ef4444" },
  slower: { emoji: "🐌", label: "Go slower", color: "#f59e0b" },
  faster: { emoji: "🚀", label: "Go faster", color: "#3b82f6" },
} as const;
