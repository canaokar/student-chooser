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
  const [manualMinutes, setManualMinutes] = useState<string>("");
  const [manualSeconds, setManualSeconds] = useState<string>("");

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

  // Handle manual time entry
  const handleManualSet = () => {
    const mins = parseInt(manualMinutes) || 0;
    const secs = parseInt(manualSeconds) || 0;

    if (mins < 0 || secs < 0 || secs >= 60) return;

    const totalSeconds = mins * 60 + secs;
    if (totalSeconds === 0) return;

    handlePreset(totalSeconds);
    setManualMinutes("");
    setManualSeconds("");
  };

  // Preset buttons
  const presets = [
    { label: "1 min", seconds: 60 },
    { label: "5 min", seconds: 300 },
    { label: "10 min", seconds: 600 },
    { label: "15 min", seconds: 900 },
    { label: "20 min", seconds: 1200 },
    { label: "30 min", seconds: 1800 },
    { label: "45 min", seconds: 2700 },
    { label: "60 min", seconds: 3600 },
  ];

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
          <div className="text-8xl mb-6">⏰</div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4">Time&apos;s Up!</h2>
          {title && <p className="text-2xl text-white/90 mb-8">{title}</p>}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setShowCompletionScreen(false);
                resetTimer();
              }}
              className="px-8 py-4 bg-white/20 backdrop-blur-lg text-white text-xl font-bold rounded-2xl hover:bg-white/30 transition-colors border border-white/30"
            >
              Start New Timer
            </button>
            <button
              onClick={() => {
                setShowCompletionScreen(false);
                setTimeRemaining(duration);
                startTimer();
              }}
              className="px-8 py-4 bg-white text-orange-600 text-xl font-bold rounded-2xl hover:bg-white/90 transition-colors shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-8 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2 text-lg font-medium"
          >
            <span>← Back to Dashboard</span>
          </Link>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-3xl hover:scale-110 transition-transform"
            title={soundEnabled ? "Sound On" : "Sound Off"}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-8">
          Class Timer ⏱️
        </h1>

        {/* Timer Display Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-6">
          <div className="text-center">
            {/* Timer Display */}
            <div className={`text-7xl md:text-8xl font-black ${timerColorClass} mb-4 font-mono`}>
              {formatTime(timeRemaining)}
            </div>

            {/* Title Display */}
            {title && (
              <div className="text-2xl text-white/90 font-medium mb-4">{title}</div>
            )}

            {/* Progress Bar */}
            {duration > 0 && (
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-6">
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-white font-bold mb-2 text-lg">Timer Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Short Break, Group Discussion, Quiz Time"
              disabled={isRunning}
              className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Manual Time Entry */}
          <div className="mb-6">
            <label className="block text-white font-bold mb-2 text-lg">Set Custom Time</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                placeholder="Minutes"
                min="0"
                disabled={isRunning}
                className="flex-1 px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
              />
              <input
                type="number"
                value={manualSeconds}
                onChange={(e) => setManualSeconds(e.target.value)}
                placeholder="Seconds"
                min="0"
                max="59"
                disabled={isRunning}
                className="flex-1 px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleManualSet}
                disabled={isRunning || (!manualMinutes && !manualSeconds)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
              >
                Set
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mb-6">
            <label className="block text-white font-bold mb-2 text-lg">Quick Presets</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => handlePreset(preset.seconds)}
                  disabled={isRunning}
                  className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isRunning && !isPaused && (
              <button
                onClick={startTimer}
                disabled={duration === 0}
                className="flex-1 px-6 py-4 bg-white text-orange-600 font-black text-xl rounded-2xl hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Timer
              </button>
            )}

            {isRunning && (
              <button
                onClick={pauseTimer}
                className="flex-1 px-6 py-4 bg-white text-orange-600 font-black text-xl rounded-2xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Pause
              </button>
            )}

            {isPaused && (
              <button
                onClick={resumeTimer}
                className="flex-1 px-6 py-4 bg-white text-orange-600 font-black text-xl rounded-2xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Resume
              </button>
            )}

            {(isRunning || isPaused) && (
              <button
                onClick={resetTimer}
                className="flex-1 px-6 py-4 bg-white/20 text-white font-bold text-xl rounded-2xl hover:bg-white/30 transition-all duration-200 border border-white/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
