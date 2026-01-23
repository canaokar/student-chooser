"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import Footer from "../../components/Footer";

const teamColors = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-amber-500",
  "from-indigo-500 to-violet-500",
  "from-teal-500 to-green-500",
  "from-rose-500 to-red-500",
];

const teamColorsBg = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-rose-500",
];

export default function TeamGenerator() {
  const [students, setStudents] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Load students from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("students");
    if (saved) {
      setStudents(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playCelebration = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50];

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

  const generateTeams = () => {
    if (students.length === 0) return;

    setIsGenerating(true);
    setTeams([]);

    setTimeout(() => {
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      const newTeams: string[][] = Array.from({ length: teamCount }, () => []);

      shuffled.forEach((student, index) => {
        newTeams[index % teamCount].push(student);
      });

      setTeams(newTeams);
      setIsGenerating(false);

      playCelebration();

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    }, 500);
  };

  const maxTeams = Math.min(8, Math.max(2, students.length));

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-1">Team Generator</h1>
            <p className="text-violet-200">Randomly divide students into teams</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        {students.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            <p className="text-violet-200 text-xl mb-4">No students loaded</p>
            <Link
              href="/tools/selector"
              className="inline-block px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
            >
              Go add students first
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-white font-medium">Divide</span>
                  <span className="text-2xl font-bold text-white">{students.length}</span>
                  <span className="text-white font-medium">students into</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTeamCount(Math.max(2, teamCount - 1))}
                    disabled={teamCount <= 2}
                    className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-2xl font-bold text-white">
                    {teamCount}
                  </span>
                  <button
                    onClick={() => setTeamCount(Math.min(maxTeams, teamCount + 1))}
                    disabled={teamCount >= maxTeams}
                    className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>

                <span className="text-white font-medium">teams</span>
              </div>

              <button
                onClick={generateTeams}
                disabled={isGenerating}
                className="w-full mt-6 py-5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-2xl font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-500/30"
              >
                {isGenerating ? "Generating..." : "Generate Teams"}
              </button>
            </div>

            {/* Teams Display */}
            {teams.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teams.map((team, teamIndex) => (
                  <div
                    key={teamIndex}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className={`bg-gradient-to-r ${teamColors[teamIndex % teamColors.length]} px-4 py-3`}>
                      <h3 className="text-white font-bold text-lg">
                        Team {teamIndex + 1}
                        <span className="ml-2 text-white/70 text-sm font-normal">
                          ({team.length} {team.length === 1 ? "member" : "members"})
                        </span>
                      </h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {team.map((student, studentIndex) => (
                          <li
                            key={student}
                            className="flex items-center gap-2"
                          >
                            <span className={`w-6 h-6 rounded-full ${teamColorsBg[teamIndex % teamColorsBg.length]} text-white text-xs flex items-center justify-center font-medium`}>
                              {studentIndex + 1}
                            </span>
                            <span className="text-gray-700">{student}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {teams.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={generateTeams}
                  className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                >
                  Shuffle Again
                </button>
              </div>
            )}
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
