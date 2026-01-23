import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { FeedbackType, FeedbackItem, FeedbackSession } from "@/app/types/feedback";

// Generate unique session ID
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
};

// Create new feedback session
export const createSession = async (expiresInHours: number = 8): Promise<string> => {
  const sessionId = generateSessionId();
  const now = Date.now();
  const expiresAt = now + expiresInHours * 60 * 60 * 1000;

  await setDoc(doc(db, "sessions", sessionId), {
    id: sessionId,
    createdAt: now,
    expiresAt: expiresAt,
    isActive: true,
  });

  return sessionId;
};

// Get session data
export const getSession = async (sessionId: string): Promise<FeedbackSession | null> => {
  const docRef = doc(db, "sessions", sessionId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: data.id,
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
    isActive: data.isActive,
  };
};

// Close session
export const closeSession = async (sessionId: string): Promise<void> => {
  await updateDoc(doc(db, "sessions", sessionId), {
    isActive: false,
  });
};

// Submit feedback
export const submitFeedback = async (
  sessionId: string,
  type: FeedbackType
): Promise<void> => {
  const feedbackRef = doc(collection(db, "sessions", sessionId, "feedback"));
  await setDoc(feedbackRef, {
    type,
    timestamp: Date.now(),
  });
};

// Subscribe to real-time feedback updates
export const subscribeToFeedback = (
  sessionId: string,
  callback: (feedback: FeedbackItem[]) => void
): (() => void) => {
  const feedbackRef = collection(db, "sessions", sessionId, "feedback");
  const q = query(feedbackRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items: FeedbackItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        type: data.type as FeedbackType,
        timestamp: data.timestamp,
      });
    });
    callback(items);
  });

  return unsubscribe;
};
