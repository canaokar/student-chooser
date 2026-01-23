"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { createSession, subscribeToFeedback, closeSession } from "@/lib/feedbackService";
import { FeedbackItem, SessionStats, FEEDBACK_CONFIG, FeedbackType } from "@/app/types/feedback";

export default function FeedbackTool() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    understanding: 0,
    lost: 0,
    slower: 0,
    faster: 0,
    total: 0,
  });
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const prevFeedbackCount = useRef(0);

  const joinUrl = sessionId ? `${window.location.origin}/feedback/${sessionId}` : "";

  // Calculate stats from feedback
  const calculateStats = (items: FeedbackItem[]): SessionStats => {
    const stats = {
      understanding: 0,
      lost: 0,
      slower: 0,
      faster: 0,
      total: items.length,
    };
    items.forEach((item) => {
      stats[item.type]++;
    });
    return stats;
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 800;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  };

  // Create new session
  const handleCreateSession = async () => {
    const id = await createSession(8); // 8 hours expiry
    setSessionId(id);
    const expires = Date.now() + 8 * 60 * 60 * 1000;
    setExpiresAt(expires);
    localStorage.setItem("lastSessionId", id);
    localStorage.setItem("lastSessionExpires", expires.toString());
  };

  // Close session
  const handleCloseSession = async () => {
    if (sessionId && confirm("Are you sure you want to close this session?")) {
      await closeSession(sessionId);
      setSessionId(null);
      setFeedback([]);
      setStats({ understanding: 0, lost: 0, slower: 0, faster: 0, total: 0 });
      localStorage.removeItem("lastSessionId");
      localStorage.removeItem("lastSessionExpires");
    }
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csv = [
      ["Timestamp", "Type", "Emoji", "Label"],
      ...feedback.map((f) => [
        new Date(f.timestamp).toISOString(),
        f.type,
        FEEDBACK_CONFIG[f.type].emoji,
        FEEDBACK_CONFIG[f.type].label,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${sessionId}-${Date.now()}.csv`;
    a.click();
  };

  // Format time ago
  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Format time remaining
  const timeRemaining = (): string => {
    if (!expiresAt) return "";
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return "Expired";
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m remaining`;
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToFeedback(sessionId, (items) => {
      setFeedback(items);
      const newStats = calculateStats(items);
      setStats(newStats);

      // Play sound on new feedback
      if (items.length > prevFeedbackCount.current && prevFeedbackCount.current > 0) {
        playNotificationSound();
      }
      prevFeedbackCount.current = items.length;
    });

    return () => unsubscribe();
  }, [sessionId, soundEnabled]);

  // Restore session from localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem("lastSessionId");
    const savedExpires = localStorage.getItem("lastSessionExpires");
    if (savedSessionId && savedExpires) {
      const expires = parseInt(savedExpires);
      if (expires > Date.now()) {
        setSessionId(savedSessionId);
        setExpiresAt(expires);
      } else {
        localStorage.removeItem("lastSessionId");
        localStorage.removeItem("lastSessionExpires");
      }
    }
  }, []);

  // Chart data
  const chartData = [
    {
      name: "👍 Understand",
      count: stats.understanding,
      fill: FEEDBACK_CONFIG.understanding.color,
    },
    {
      name: "👎 Lost",
      count: stats.lost,
      fill: FEEDBACK_CONFIG.lost.color,
    },
    {
      name: "🐌 Slower",
      count: stats.slower,
      fill: FEEDBACK_CONFIG.slower.color,
    },
    {
      name: "🚀 Faster",
      count: stats.faster,
      fill: FEEDBACK_CONFIG.faster.color,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Live Feedback 💬</h1>
          <p className="text-gray-300">Collect real-time anonymous feedback from your students</p>
        </div>

        {!sessionId ? (
          /* Create Session View */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="mb-8">
                <div className="text-8xl mb-4">💬</div>
                <h2 className="text-3xl font-bold text-white mb-2">Ready to Start?</h2>
                <p className="text-gray-300 mb-8">
                  Create a feedback session and share it with your students
                </p>
              </div>
              <button
                onClick={handleCreateSession}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Feedback Session
              </button>
            </div>
          </div>
        ) : (
          /* Active Session View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - QR Code & Session Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* QR Code Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Share Session</h3>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <QRCodeSVG value={joinUrl} size={200} className="w-full h-auto" />
                </div>
                <div className="space-y-2">
                  <div className="bg-white/5 rounded p-3 break-all text-sm text-gray-300">
                    {joinUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Session Controls */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{stats.total}</div>
                    <div className="text-gray-300 text-sm">Total Feedback</div>
                  </div>
                  <div className="text-center text-sm text-gray-300">{timeRemaining()}</div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors"
                  >
                    {soundEnabled ? "🔔 Sound On" : "🔕 Sound Off"}
                  </button>
                  <button
                    onClick={exportToCSV}
                    disabled={feedback.length === 0}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={handleCloseSession}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded transition-colors"
                  >
                    Close Session
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Chart & Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Chart Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Feedback Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Live Feed Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Live Feed</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {feedback.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      Waiting for feedback...
                    </div>
                  ) : (
                    feedback.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/5 rounded-lg p-3 flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{FEEDBACK_CONFIG[item.type].emoji}</span>
                          <span className="text-white">{FEEDBACK_CONFIG[item.type].label}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{timeAgo(item.timestamp)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
