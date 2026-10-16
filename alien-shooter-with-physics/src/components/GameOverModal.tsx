/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw, Save, Check } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  wave: number;
  aliensDefeated: number;
  questionsAnswered: number;
  onRestart: () => void;
  onSave: () => void;
  onViewLeaderboard?: () => void;
  hasSaved: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  score,
  wave,
  aliensDefeated,
  questionsAnswered,
  onRestart,
  onSave,
  onViewLeaderboard,
  hasSaved,
}) => {
  useEffect(() => {
    if (isOpen && isVictory) {
      // Trigger festive victory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#34d399', '#facc15', '#f43f5e'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        className={`relative w-full max-w-md bg-slate-900 border-2 rounded-xl shadow-2xl overflow-hidden font-mono text-slate-100 text-center ${
          isVictory
            ? 'border-yellow-400/80 shadow-[0_0_60px_rgba(250,204,21,0.3)]'
            : 'border-rose-500/80 shadow-[0_0_60px_rgba(244,63,94,0.3)]'
        }`}
      >
        {/* Banner */}
        <div
          className={`p-6 border-b ${
            isVictory
              ? 'bg-gradient-to-b from-yellow-950/80 to-slate-900 border-yellow-800/40 text-yellow-400'
              : 'bg-gradient-to-b from-rose-950/80 to-slate-900 border-rose-800/40 text-rose-400'
          }`}
        >
          <div className="inline-flex p-3 rounded-full mb-2 bg-slate-950/70 border border-current shadow-lg">
            {isVictory ? <Trophy size={36} /> : <Skull size={36} />}
          </div>
          <h2 className="text-xl font-black tracking-widest uppercase">
            {isVictory ? 'MISSION ACCOMPLISHED!' : 'HULL BREACH - DEFEAT'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isVictory
              ? 'The alien fleet was repelled using classical physics principles!'
              : 'Your starfighter succumbed to enemy fire. Review physics principles and retaliate!'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 text-left">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                FINAL SCORE
              </span>
              <span className="text-base font-extrabold text-amber-400">
                {score.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                SECTOR REACHED
              </span>
              <span className="text-base font-extrabold text-cyan-400">
                Wave {wave} / 5
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                ALIENS NEUTRALIZED
              </span>
              <span className="text-base font-extrabold text-emerald-400">
                {aliensDefeated}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                PHYSICS CHALLENGES
              </span>
              <span className="text-base font-extrabold text-purple-400">
                {questionsAnswered} Solved
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onRestart}
              className={`w-full py-2.5 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                isVictory
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.4)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              <RotateCcw size={16} />
              <span>{isVictory ? 'PLAY AGAIN / NEW CAMPAIGN' : 'RETRY MISSION'}</span>
            </button>

            <button
              onClick={onSave}
              disabled={hasSaved}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {hasSaved ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Stats Recorded to Profile & Leaderboard!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Record to Firebase</span>
                </>
              )}
            </button>

            {onViewLeaderboard && (
              <button
                onClick={onViewLeaderboard}
                className="w-full py-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 rounded-lg text-amber-300 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trophy size={14} />
                <span>View Galactic Leaderboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
