"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

export default function Home() {
  const [students, setStudents] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [selectCount, setSelectCount] = useState(1);
  const [highlightedStudent, setHighlightedStudent] = useState<string | null>(null);

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
    if (selectedStudents.includes(name)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== name));
    }
  };

  const clearAll = () => {
    setStudents([]);
    setSelectedStudents([]);
    setShowResult(false);
  };

  const chooseStudents = () => {
    if (students.length === 0) return;

    const count = Math.min(selectCount, students.length);
    setIsSelecting(true);
    setShowResult(false);
    setSelectedStudents([]);
    setHighlightedStudent(null);

    let tick = 0;
    const maxTicks = 25;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setHighlightedStudent(students[randomIndex]);
      tick++;

      if (tick >= maxTicks) {
        clearInterval(interval);
        const shuffled = [...students].sort(() => Math.random() - 0.5);
        const winners = shuffled.slice(0, count);
        setSelectedStudents(winners);
        setHighlightedStudent(null);
        setIsSelecting(false);
        setShowResult(true);

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
  };

  const resetSelection = () => {
    setShowResult(false);
    setSelectedStudents([]);
  };

  const maxSelectable = Math.max(1, students.length);

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
          <button
            onClick={resetSelection}
            className="px-8 py-4 bg-white/20 text-white text-xl font-bold rounded-2xl hover:bg-white/30 transition-colors"
          >
            Choose Again
          </button>
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
              {students.map((student) => (
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

  // Default screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
            Student Chooser
          </h1>
          <p className="text-violet-200 text-lg">Random selection made fun</p>
        </div>

        {/* Choose Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20">
          <div className="min-h-[100px] flex flex-col items-center justify-center">
            <p className="text-violet-200 text-xl">
              {students.length === 0
                ? "Add students to get started"
                : "Ready to choose!"}
            </p>
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
            disabled={students.length === 0}
            className="w-full py-5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-2xl font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-500/30"
          >
            {selectCount === 1 ? "Choose a Student" : `Choose ${selectCount} Students`}
          </button>
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
                  {students.length}
                </span>
              </h2>
              {students.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Clear all
                </button>
              )}
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
                  {students.map((student) => (
                    <div
                      key={student}
                      className="group flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                    >
                      <span>{student}</span>
                      <button
                        onClick={() => removeStudent(student)}
                        className="w-5 h-5 flex items-center justify-center rounded-full text-xs bg-gray-300 hover:bg-red-400 text-gray-600 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-violet-300 text-sm">
            Made by{" "}
            <a
              href="https://github.com/canaokar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-pink-300 transition-colors"
            >
              @canaokar
            </a>
            {" · "}
            <a
              href="https://github.com/canaokar/student-chooser"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-pink-300 transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
