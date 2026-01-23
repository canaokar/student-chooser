"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import Footer from "../../components/Footer";

export default function StudentSelector() {
  const [students, setStudents] = useState<string[]>([]);
  const [usedStudents, setUsedStudents] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectionHistory, setSelectionHistory] = useState<string[]>([]);

  // Load students from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("students");
    if (saved) {
      setStudents(JSON.parse(saved));
    }
    const savedUsed = localStorage.getItem("usedStudents");
    if (savedUsed) {
      setUsedStudents(JSON.parse(savedUsed));
    }
    const savedHistory = localStorage.getItem("selectionHistory");
    if (savedHistory) {
      setSelectionHistory(JSON.parse(savedHistory));
    }
    setIsLoaded(true);
  }, []);

  // Save students to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("students", JSON.stringify(students));
    }
  }, [students, isLoaded]);

  // Save used students to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("usedStudents", JSON.stringify(usedStudents));
    }
  }, [usedStudents, isLoaded]);

  // Save selection history to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("selectionHistory", JSON.stringify(selectionHistory));
    }
  }, [selectionHistory, isLoaded]);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [lastSelectedStudents, setLastSelectedStudents] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [selectCount, setSelectCount] = useState(1);
  const [highlightedStudent, setHighlightedStudent] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);

  const availableStudents = students.filter((s) => !usedStudents.includes(s));

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play drumroll sound
  const playDrumroll = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const duration = 2;
    const startTime = ctx.currentTime;

    for (let i = 0; i < 40; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 100 + Math.random() * 50;
      osc.type = "triangle";
      const time = startTime + (i * duration) / 40;
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }, [soundEnabled, getAudioContext]);

  // Play celebration sound
  const playCelebration = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const startTime = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }, [soundEnabled, getAudioContext]);

  const importStudents = () => {
    const names = bulkInput
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name && !students.includes(name));
    if (names.length > 0) {
      setStudents([...students, ...names]);
      setBulkInput("");
    }
  };

  const removeStudent = (name: string) => {
    setStudents(students.filter((s) => s !== name));
    setUsedStudents(usedStudents.filter((s) => s !== name));
    if (selectedStudents.includes(name)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== name));
    }
  };

  const clearAll = () => {
    setStudents([]);
    setUsedStudents([]);
    setSelectedStudents([]);
    setLastSelectedStudents([]);
    setSelectionHistory([]);
    setShowResult(false);
  };

  const clearHistory = () => {
    setSelectionHistory([]);
  };

  const resetUsed = () => {
    setUsedStudents([]);
    setLastSelectedStudents([]);
  };

  const undoLastPick = () => {
    if (lastSelectedStudents.length === 0) return;
    setUsedStudents(usedStudents.filter((s) => !lastSelectedStudents.includes(s)));
    setLastSelectedStudents([]);
  };

  const chooseStudents = useCallback(() => {
    if (availableStudents.length === 0 || isSelecting) return;

    const count = Math.min(selectCount, availableStudents.length);
    setIsSelecting(true);
    setShowResult(false);
    setSelectedStudents([]);
    setHighlightedStudent(null);

    playDrumroll();

    let tick = 0;
    const maxTicks = 25;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      setHighlightedStudent(availableStudents[randomIndex]);
      tick++;

      if (tick >= maxTicks) {
        clearInterval(interval);
        const shuffled = [...availableStudents].sort(() => Math.random() - 0.5);
        const winners = shuffled.slice(0, count);
        setSelectedStudents(winners);
        setLastSelectedStudents(winners);
        setUsedStudents((prev) => [...prev, ...winners]);
        setSelectionHistory((prev) => [...winners, ...prev].slice(0, 20));
        setHighlightedStudent(null);
        setIsSelecting(false);
        setShowResult(true);

        playCelebration();

        // Confetti burst
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
      }
    }, 80);
  }, [availableStudents, isSelecting, selectCount, playDrumroll, playCelebration]);

  // Keyboard shortcut (spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSelecting && availableStudents.length > 0) {
        // Don't trigger if typing in textarea
        if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
          return;
        }
        e.preventDefault();
        if (showResult) {
          setShowResult(false);
          setSelectedStudents([]);
        } else {
          chooseStudents();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chooseStudents, isSelecting, availableStudents.length, showResult]);

  const resetSelection = () => {
    setShowResult(false);
    setSelectedStudents([]);
  };

  const maxSelectable = Math.max(1, availableStudents.length);

  // Show big result screen
  if (showResult && selectedStudents.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-violet-300 text-lg uppercase tracking-widest mb-6">
            {selectedStudents.length === 1 ? "The chosen one is..." : `The chosen ${selectedStudents.length} are...`}
          </p>
          <div className="space-y-4 mb-12">
            {selectedStudents.map((student, index) => (
              <div
                key={student}
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-transparent bg-clip-text"
              >
                <p className="text-7xl md:text-8xl font-black">
                  {selectedStudents.length > 1 && <span className="text-white/50">{index + 1}. </span>}
                  {student}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={undoLastPick}
              className="px-6 py-3 bg-white/10 text-white/70 font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              Undo Pick
            </button>
            <button
              onClick={resetSelection}
              className="px-8 py-4 bg-white/20 text-white text-xl font-bold rounded-2xl hover:bg-white/30 transition-colors"
            >
              Choose Again
            </button>
          </div>
          <p className="text-violet-300/50 text-sm mt-8">Press spacebar to continue</p>
        </div>
      </div>
    );
  }

  // Show selection animation screen
  if (isSelecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2">Choosing...</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="flex flex-wrap justify-center gap-3">
              {availableStudents.map((student) => (
                <div
                  key={student}
                  className={`px-6 py-3 rounded-full text-xl font-bold transition-all duration-100 ${
                    highlightedStudent === student
                      ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white scale-125 shadow-lg shadow-orange-500/50"
                      : "bg-white/20 text-white/60"
                  }`}
                >
                  {student}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full screen mode
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-8 px-4 flex flex-col">
        <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-black text-white">Student Selector</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
            <button
              onClick={() => setFullScreen(false)}
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
            >
              Exit Full Screen
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="min-h-[120px] flex flex-col items-center justify-center mb-6">
                {students.length === 0 ? (
                  <p className="text-violet-200 text-xl">No students loaded</p>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center">
                    <p className="text-violet-200 text-xl mb-4">All students have been chosen!</p>
                    <button
                      onClick={resetUsed}
                      className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                    >
                      Reset and Start Over
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-violet-200 text-2xl mb-2">
                      {availableStudents.length} of {students.length} students available
                    </p>
                    {lastSelectedStudents.length > 0 && (
                      <button
                        onClick={undoLastPick}
                        className="text-violet-300 hover:text-white text-sm transition-colors"
                      >
                        Undo last pick ({lastSelectedStudents.join(", ")})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Select Count */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-white font-medium">Choose</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectCount(Math.max(1, selectCount - 1))}
                    disabled={selectCount <= 1}
                    className="w-12 h-12 rounded-full bg-white/20 text-white font-bold text-2xl hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-3xl font-bold text-white">
                    {selectCount}
                  </span>
                  <button
                    onClick={() => setSelectCount(Math.min(maxSelectable, selectCount + 1))}
                    disabled={selectCount >= maxSelectable}
                    className="w-12 h-12 rounded-full bg-white/20 text-white font-bold text-2xl hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-white font-medium">
                  {selectCount === 1 ? "student" : "students"}
                </span>
              </div>

              <button
                onClick={chooseStudents}
                disabled={availableStudents.length === 0}
                className="w-full py-6 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-3xl font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-500/30"
              >
                {selectCount === 1 ? "Choose a Student" : `Choose ${selectCount} Students`}
              </button>

              <p className="text-center text-violet-300/50 text-sm mt-4">
                Press spacebar to choose
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-violet-200 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
            Student Selector
          </h1>
          <p className="text-violet-200 text-lg">Random selection made fun</p>
        </div>

        {/* Choose Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20">
          <div className="min-h-[100px] flex flex-col items-center justify-center">
            {students.length === 0 ? (
              <p className="text-violet-200 text-xl">Add students to get started</p>
            ) : availableStudents.length === 0 ? (
              <div className="text-center">
                <p className="text-violet-200 text-xl mb-4">All students have been chosen!</p>
                <button
                  onClick={resetUsed}
                  className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                >
                  Reset and Start Over
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-violet-200 text-xl">
                  {availableStudents.length} of {students.length} students available
                </p>
                {lastSelectedStudents.length > 0 && (
                  <button
                    onClick={undoLastPick}
                    className="text-violet-300 hover:text-white text-sm mt-2 transition-colors"
                  >
                    Undo last pick ({lastSelectedStudents.join(", ")})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Select Count */}
          <div className="flex items-center justify-center gap-4 mt-6 mb-4">
            <span className="text-white font-medium">Choose</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectCount(Math.max(1, selectCount - 1))}
                disabled={selectCount <= 1}
                className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-2xl font-bold text-white">
                {selectCount}
              </span>
              <button
                onClick={() => setSelectCount(Math.min(maxSelectable, selectCount + 1))}
                disabled={selectCount >= maxSelectable}
                className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
            <span className="text-white font-medium">
              {selectCount === 1 ? "student" : "students"}
            </span>
          </div>

          <button
            onClick={chooseStudents}
            disabled={availableStudents.length === 0}
            className="w-full py-5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-2xl font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-500/30"
          >
            {selectCount === 1 ? "Choose a Student" : `Choose ${selectCount} Students`}
          </button>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-4 py-2 bg-white/10 text-violet-200 text-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              Sound: {soundEnabled ? "On" : "Off"}
            </button>
            <button
              onClick={() => setFullScreen(true)}
              className="px-4 py-2 bg-white/10 text-violet-200 text-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              Full Screen Mode
            </button>
          </div>

          <p className="text-center text-violet-300/50 text-sm mt-3">
            Press spacebar to choose
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Import Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Import Students
            </h2>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Paste names here (one per line)"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 text-gray-800 resize-none transition-colors"
            />
            <button
              onClick={importStudents}
              disabled={!bulkInput.trim()}
              className="w-full mt-3 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Import
            </button>
          </div>

          {/* Student List Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                Students
                <span className="ml-2 px-2 py-1 bg-violet-100 text-violet-700 text-sm rounded-full">
                  {availableStudents.length}/{students.length}
                </span>
              </h2>
              <div className="flex gap-2">
                {usedStudents.length > 0 && (
                  <button
                    onClick={resetUsed}
                    className="text-sm text-violet-500 hover:text-violet-700 font-medium transition-colors"
                  >
                    Reset used
                  </button>
                )}
                {students.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="h-[140px] overflow-y-auto">
              {students.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400 text-center">
                    No students yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {students.map((student) => {
                    const isUsed = usedStudents.includes(student);
                    return (
                      <div
                        key={student}
                        className={`group flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isUsed
                            ? "bg-gray-200 text-gray-400 line-through"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{student}</span>
                        <button
                          onClick={() => removeStudent(student)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-xs bg-gray-300 hover:bg-red-400 text-gray-600 hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selection History & Team Generator */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Selection History */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                Selection History
              </h2>
              {selectionHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="h-[100px] overflow-y-auto">
              {selectionHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">
                  No selections yet
                </p>
              ) : (
                <ol className="space-y-1">
                  {selectionHistory.map((student, index) => (
                    <li key={`${student}-${index}`} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{student}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Team Generator Link */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 flex flex-col justify-center">
            <h2 className="text-lg font-bold text-white mb-2">
              Need Teams?
            </h2>
            <p className="text-indigo-100 text-sm mb-4">
              Randomly divide your students into teams for group activities.
            </p>
            <Link
              href="/tools/teams"
              className="inline-block px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-center"
            >
              Team Generator →
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
