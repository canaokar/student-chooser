"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession, submitFeedback } from "@/lib/feedbackService";
import { FeedbackSession, FeedbackType, FEEDBACK_CONFIG } from "@/app/types/feedback";

export default function StudentFeedbackPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<FeedbackSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<FeedbackType | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<FeedbackType | null>(null);

  // Validate session on load
  useEffect(() => {
    const validateSession = async () => {
      try {
        const data = await getSession(sessionId);
        setSession(data);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, [sessionId]);

  // Submit feedback handler
  const handleFeedback = async (type: FeedbackType) => {
    if (submitting || !session?.isActive) return;

    setSubmitting(type);
    try {
      await submitFeedback(sessionId, type);
      setLastSubmitted(type);

      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Clear success message after 2 seconds
      setTimeout(() => {
        setLastSubmitted(null);
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  // Session not found
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-2">Session Not Found</h1>
          <p className="text-gray-300">
            This feedback session doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  // Session expired
  const isExpired = session.expiresAt < Date.now();
  if (isExpired || !session.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-4">⏱️</div>
          <h1 className="text-3xl font-bold text-white mb-2">Session Ended</h1>
          <p className="text-gray-300">
            This feedback session is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  // Active session - show feedback buttons
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Share Your Feedback</h1>
          <p className="text-gray-300">Your response is anonymous</p>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(Object.keys(FEEDBACK_CONFIG) as FeedbackType[]).map((type) => {
            const config = FEEDBACK_CONFIG[type];
            const isSubmitting = submitting === type;
            const wasSubmitted = lastSubmitted === type;

            return (
              <button
                key={type}
                onClick={() => handleFeedback(type)}
                disabled={submitting !== null}
                className={`
                  relative bg-white/10 backdrop-blur-lg rounded-2xl p-8
                  border-2 transition-all transform hover:scale-105
                  ${wasSubmitted ? "border-white scale-105" : "border-white/20"}
                  ${isSubmitting ? "animate-pulse" : ""}
                  hover:bg-white/20 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-h-[180px] flex flex-col items-center justify-center
                `}
                style={{
                  borderColor: wasSubmitted ? config.color : undefined,
                }}
              >
                <div className="text-6xl mb-4">{config.emoji}</div>
                <div className="text-white text-xl font-semibold text-center">
                  {config.label}
                </div>
                {wasSubmitted && (
                  <div className="absolute top-2 right-2 text-2xl">✓</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Success Message */}
        {lastSubmitted && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-6 py-3 rounded-full border border-green-500/30">
              <span className="text-xl">✓</span>
              <span className="font-semibold">Feedback sent!</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>You can submit feedback multiple times during the session</p>
        </div>
      </div>
    </div>
  );
}
