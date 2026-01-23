"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import Footer from "../../components/Footer";

export default function ClassTimer() {
  // Timer state
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState<boolean>(false);

  // UI state
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState<string>("");

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSound = localStorage.getItem("timer_soundEnabled");
    if (savedSound !== null) {
      setSoundEnabled(JSON.parse(savedSound));
    }
    setIsLoaded(true);
  }, []);

  // Save sound preference to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("timer_soundEnabled", JSON.stringify(soundEnabled));
    }
  }, [soundEnabled, isLoaded]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play completion sound
  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();

    // Ascending chime pattern
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const startTime = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });

    // Add a final bell-like tone
    const finalOsc = ctx.createOscillator();
    const finalGain = ctx.createGain();
    finalOsc.connect(finalGain);
    finalGain.connect(ctx.destination);
    finalOsc.frequency.value = 880;
    finalOsc.type = "sine";
    const finalTime = ctx.currentTime + 0.8;
    finalGain.gain.setValueAtTime(0.4, finalTime);
    finalGain.gain.exponentialRampToValueAtTime(0.01, finalTime + 1);
    finalOsc.start(finalTime);
    finalOsc.stop(finalTime + 1);
  }, [soundEnabled, getAudioContext]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playCompletionSound();
    setShowCompletionScreen(true);

    // Confetti celebration
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 200);
  }, [playCompletionSound]);

  // Start timer
  const startTimer = () => {
    if (duration <= 0) return;

    setTimeRemaining(duration);
    setIsRunning(true);
    setIsPaused(false);
    setShowCompletionScreen(false);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setIsRunning(false);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Pause timer
  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsPaused(true);
    setIsRunning(false);
  };

  // Resume timer
  const resumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setIsRunning(false);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Reset timer
  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(duration);
    setShowCompletionScreen(false);
  };

  // Handle preset button click
  const handlePreset = (seconds: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setDuration(seconds);
    setTimeRemaining(seconds);
    setIsRunning(false);
    setIsPaused(false);
    setShowCompletionScreen(false);
  };

  // Handle clicking on timer to edit
  const handleTimerClick = () => {
    if (isRunning) return;
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    setTimeInput(formatTime(timeRemaining));
    setIsEditingTime(true);
  };

  // Parse time input (accepts formats like "5:30", "05:30", "10", "0:45")
  const parseTimeInput = (input: string): number => {
    const trimmed = input.trim();
    if (!trimmed) return 0;

    // Check if it contains a colon (MM:SS format)
    if (trimmed.includes(':')) {
      const [minStr, secStr] = trimmed.split(':');
      const mins = parseInt(minStr) || 0;
      const secs = parseInt(secStr) || 0;
      if (mins < 0 || secs < 0 || secs >= 60) return 0;
      return mins * 60 + secs;
    } else {
      // Just minutes
      const mins = parseInt(trimmed) || 0;
      if (mins < 0) return 0;
      return mins * 60;
    }
  };

  // Handle saving edited time
  const handleSaveTime = () => {
    const totalSeconds = parseTimeInput(timeInput);
    if (totalSeconds === 0) return;

    handlePreset(totalSeconds);
    setIsEditingTime(false);
    setTimeInput("");
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditingTime(false);
    setTimeInput("");
  };

  // Handle key press in time input
  const handleTimeInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTime();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Combined presets with title and duration
  const combinedPresets = [
    { title: "Short Break", seconds: 300, icon: "☕" },
    { title: "Lunch Break", seconds: 1800, icon: "🍽️" },
    { title: "Group Discussion", seconds: 900, icon: "💬" },
    { title: "Quiz Time", seconds: 600, icon: "📝" },
    { title: "Work Time", seconds: 1500, icon: "💼" },
    { title: "Reading Time", seconds: 1200, icon: "📚" },
  ];

  // Quick time presets (no title)
  const quickTimePresets = [
    { label: "1 min", seconds: 60 },
    { label: "5 min", seconds: 300 },
    { label: "10 min", seconds: 600 },
    { label: "15 min", seconds: 900 },
    { label: "30 min", seconds: 1800 },
    { label: "60 min", seconds: 3600 },
  ];

  // Handle combined preset
  const handleCombinedPreset = (title: string, seconds: number) => {
    setTitle(title);
    handlePreset(seconds);
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0;

  // Timer color class (red and pulsing in last 10 seconds)
  const timerColorClass =
    timeRemaining <= 10 && isRunning ? "text-red-400 animate-pulse" : "text-white";

  // Show completion screen
  if (showCompletionScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4">⏰</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">Time&apos;s Up!</h2>
          {title && <p className="text-xl text-white/90 mb-6">{title}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setShowCompletionScreen(false);
                resetTimer();
              }}
              className="px-6 py-3 bg-white/20 backdrop-blur-lg text-white text-lg font-bold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            >
              Start New Timer
            </button>
            <button
              onClick={() => {
                setShowCompletionScreen(false);
                setTimeRemaining(duration);
                startTimer();
              }}
              className="px-6 py-3 bg-white text-orange-600 text-lg font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
            >
              Repeat Timer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main timer screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-6 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2 font-medium"
          >
            <span>← Back to Dashboard</span>
          </Link>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-2xl hover:scale-110 transition-transform"
            title={soundEnabled ? "Sound On" : "Sound Off"}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-6">
          Class Timer ⏱️
        </h1>

        {/* Timer Display Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-4">
          <div className="text-center">
            {/* Title Display - Show Above Timer */}
            {title && !isEditingTime && (
              <div className="text-xl md:text-2xl text-white/90 font-bold mb-3">{title}</div>
            )}

            {/* Timer Display */}
            {isEditingTime ? (
              <div className="mb-3">
                <div className="mb-4">
                  <input
                    type="text"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    onKeyDown={handleTimeInputKeyPress}
                    placeholder="MM:SS or MM"
                    autoFocus
                    className="w-full max-w-sm mx-auto px-4 py-3 bg-white/20 border-2 border-white/40 rounded-xl text-white text-4xl font-mono text-center placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/25 transition-all"
                  />
                  <p className="text-white/60 text-xs mt-2">Enter time as 5:30 or just 10 for 10 minutes</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleSaveTime}
                    className="px-6 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-white/90 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Set Time
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition-all border border-white/30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleTimerClick}
                className={`text-6xl md:text-7xl font-black ${timerColorClass} mb-3 font-mono ${
                  !isRunning ? "cursor-pointer hover:scale-105 transition-transform" : ""
                }`}
                title={!isRunning ? "Click to edit time" : ""}
              >
                {formatTime(timeRemaining)}
              </div>
            )}

            {/* Progress Bar */}
            {duration > 0 && !isEditingTime && (
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-white to-white/80 transition-all duration-1000 ease-linear shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Start Button - Always Prominent */}
        {!isRunning && !isPaused && !isEditingTime && duration > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={startTimer}
              className="px-12 py-4 bg-gradient-to-r from-green-400 to-green-500 text-white font-black text-xl rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-200 shadow-2xl hover:shadow-green-500/50 hover:scale-[1.05] active:scale-[0.95] border-2 border-green-300/50"
            >
              ▶ Start Timer
            </button>
          </div>
        )}

        {/* Quick Start Presets */}
        {!isRunning && !isPaused && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-4">
            <h2 className="text-lg font-bold text-white mb-3">Quick Start</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {combinedPresets.map((preset) => (
                <button
                  key={preset.title}
                  onClick={() => handleCombinedPreset(preset.title, preset.seconds)}
                  className="group relative px-4 py-4 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <div className="text-3xl mb-1">{preset.icon}</div>
                  <div className="font-bold text-base mb-0.5">{preset.title}</div>
                  <div className="text-white/70 text-xs">
                    {Math.floor(preset.seconds / 60)} min
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Setup */}
        {!isRunning && !isPaused && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-4">
            <h2 className="text-lg font-bold text-white mb-3">Custom Timer</h2>

            {/* Message Input */}
            <div className="mb-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Timer message (optional)"
                className="w-full px-3 py-2 bg-white/20 border-2 border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/25 transition-all"
              />
            </div>

            {/* Quick Time Buttons */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {quickTimePresets.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => handlePreset(preset.seconds)}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all duration-200 border border-white/30 hover:scale-[1.05] active:scale-[0.95] text-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-white/60 text-xs mt-2 text-center">
              Or click the timer above to enter a custom time
            </p>
          </div>
        )}

        {/* Running Timer Controls */}
        {(isRunning || isPaused) && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {isRunning && (
              <button
                onClick={pauseTimer}
                className="flex-1 px-6 py-3 bg-white text-orange-600 font-bold text-lg rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                ⏸ Pause
              </button>
            )}

            {isPaused && (
              <button
                onClick={resumeTimer}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-lg rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] border-2 border-green-300/50"
              >
                ▶ Resume
              </button>
            )}

            <button
              onClick={resetTimer}
              className="flex-1 px-6 py-3 bg-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              🔄 Reset
            </button>
          </div>
        )}

        <div className="mt-4">
          <Footer />
        </div>
      </div>
    </div>
  );
}
