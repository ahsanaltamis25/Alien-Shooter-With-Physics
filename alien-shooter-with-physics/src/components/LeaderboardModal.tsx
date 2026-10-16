/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types/game';
import { getLeaderboard } from '../services/firebase';
import { Trophy, Medal, Award, X, RotateCw, Flame, BookOpen } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  currentUserId?: string;
  onClose: () => void;
}

const AVATAR_MAP: Record<string, string> = {
  pilot: '🚀',
  scientist: '🔬',
  cyber: '🤖',
  cosmonaut: '👨‍🚀',
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  currentUserId,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'score' | 'physics'>('score');
  const [isLoading, setIsLoading] = useState(false);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard();
      setEntries(data);
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sortedList = [...entries].sort((a, b) => {
    if (filter === 'physics') {
      return b.questionsCorrect - a.questionsCorrect;
    }
    return b.highScore - a.highScore;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/70 rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden font-mono text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-950/90 to-slate-900 border-b border-amber-700/50">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Trophy size={22} className="animate-pulse" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                Galactic Physics Leaderboard
              </h2>
              <p className="text-[10px] text-amber-300/80">
                Top Flight Academy Cadets & High Scorers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRankings}
              disabled={isLoading}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 transition-colors"
              title="Refresh Leaderboard"
            >
              <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-950 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setFilter('score')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
              filter === 'score'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame size={14} />
            <span>TOP COMBAT SCORES</span>
          </button>
          <button
            onClick={() => setFilter('physics')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
              filter === 'physics'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} />
            <span>TOP PHYSICISTS (SOLVED)</span>
          </button>
        </div>

        {/* Leaderboard Table List */}
        <div className="p-4 overflow-y-auto space-y-2">
          {sortedList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No flight cadet records recorded yet. Complete wave runs to claim rank #1!
            </div>
          ) : (
            sortedList.map((entry, idx) => {
              const isCurrent = entry.uid === currentUserId;
              const emoji = AVATAR_MAP[entry.avatar] || '🚀';

              let rankBadge = (
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  #{idx + 1}
                </span>
              );

              if (idx === 0) {
                rankBadge = (
                  <span className="w-6 flex items-center justify-center text-amber-400" title="Gold - Rank 1">
                    <Trophy size={18} />
                  </span>
                );
              } else if (idx === 1) {
                rankBadge = (
                  <span className="w-6 flex items-center justify-center text-slate-300" title="Silver - Rank 2">
                    <Medal size={18} />
                  </span>
                );
              } else if (idx === 2) {
                rankBadge = (
                  <span className="w-6 flex items-center justify-center text-amber-600" title="Bronze - Rank 3">
                    <Award size={18} />
                  </span>
                );
              }

              return (
                <div
                  key={entry.uid || idx}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : idx < 3
                      ? 'bg-slate-950/70 border-slate-700'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  {/* Left: Rank, Avatar & Callsign */}
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center gap-1.5 truncate">
                        <span>{entry.displayName}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {entry.gradeLevel}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores */}
                  <div className="text-right shrink-0 pl-3">
                    {filter === 'score' ? (
                      <div>
                        <div className="text-sm font-black text-amber-400">
                          {entry.highScore.toLocaleString()} PTS
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {entry.questionsCorrect} Challenges Solved
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-black text-cyan-400">
                          {entry.questionsCorrect} SOLVED
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {entry.highScore.toLocaleString()} pts
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>Synced with Firebase Firestore</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
