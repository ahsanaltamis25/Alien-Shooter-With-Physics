/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameEngine } from '../engine/GameEngine';
import { StudentProfile } from '../types/game';
import { sound } from '../engine/soundEffects';
import {
  Shield,
  Zap,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  Pause,
  Save,
  User as UserIcon,
  BookOpen,
} from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  student: StudentProfile | null;
  onOpenProfile: () => void;
  onOpenQuiz: () => void;
  onOpenLeaderboard: () => void;
  onPause: () => void;
  onSave: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  student,
  onOpenProfile,
  onOpenQuiz,
  onOpenLeaderboard,
  onPause,
  onSave,
  soundEnabled,
  onToggleSound,
}) => {
  const p = engine.player;
  const healthPercent = Math.max(0, Math.min(100, (p.health / p.maxHealth) * 100));

  return (
    <div className="w-full max-w-[800px] mb-3 flex flex-col gap-2 font-mono">
      {/* Top Banner: Profile, Quick Controls & Actions */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900/90 border border-cyan-500/30 rounded-lg p-2.5 px-4 backdrop-blur-md text-xs text-slate-300 shadow-md">
        {/* Student identity info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400/40 rounded text-cyan-300 transition-colors"
            title="Edit Student Profile"
          >
            <UserIcon size={14} />
            <span className="font-semibold text-white">
              {student ? student.displayName : 'Cadet'}
            </span>
            <span className="text-[10px] bg-cyan-900/80 px-1.5 py-0.5 rounded text-cyan-200">
              {student ? student.gradeLevel : 'Physics Cadet'}
            </span>
          </button>
        </div>

        {/* Global Score & High Score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Trophy size={14} />
            <span>SCORE:</span>
            <span className="font-bold text-white text-sm">
              {engine.score.toLocaleString()}
            </span>
          </div>
          {student && (
            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <span>HI:</span>
              <span className="text-amber-400 font-bold">
                {Math.max(student.highScore, engine.score).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Quick Utilities: Leaderboard, Audio, Save, Pause */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1 px-2 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 rounded text-amber-300 text-[11px]"
            title="View Galactic Leaderboard"
          >
            <Trophy size={13} />
            <span className="hidden sm:inline">RANKS</span>
          </button>
          <button
            onClick={onToggleSound}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-200"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-red-400" />}
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 rounded text-emerald-300 text-[11px]"
            title="Save Game to Firebase"
          >
            <Save size={13} />
            <span>SAVE</span>
          </button>
          <button
            onClick={onPause}
            className="flex items-center gap-1 px-2 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 rounded text-amber-300 text-[11px]"
            title="Pause Game [Esc]"
          >
            <Pause size={13} />
            <span>PAUSE</span>
          </button>
        </div>
      </div>

      {/* Main HUD Gauge Bar: Health, Ammo & Wave */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 backdrop-blur-md">
        {/* 1. Health Bar Gauge */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <Shield size={14} />
              HULL INTEGRITY
            </span>
            <span className="text-white font-bold">
              {Math.max(0, Math.floor(p.health))} / {p.maxHealth}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded border border-red-900/60 overflow-hidden p-0.5">
            <div
              className={`h-full rounded transition-all duration-200 ${
                healthPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : healthPercent > 25
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* 2. Plasma Ammo & Physics Recharge Trigger */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Zap size={14} />
              PLASMA CHARGES
            </span>
            <span className="text-white font-bold">
              {p.ammo} / {p.maxAmmo}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Ammo dots */}
            <div className="flex-1 flex gap-1 h-3 bg-slate-950 rounded border border-cyan-900/60 p-0.5 items-center">
              {Array.from({ length: p.maxAmmo }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-xs transition-all ${
                    i < p.ammo
                      ? 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]'
                      : 'bg-slate-800/60'
                  }`}
                />
              ))}
            </div>

            {/* Quick Recharge Button */}
            <button
              onClick={onOpenQuiz}
              className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 border transition-all ${
                p.ammo === 0
                  ? 'bg-amber-500 text-slate-950 border-amber-300 animate-bounce'
                  : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-600/50'
              }`}
              title="Solve Physics Quiz to Recharge Ammo [E]"
            >
              <BookOpen size={11} />
              <span>RECHARGE [E]</span>
            </button>
          </div>
        </div>

        {/* 3. Wave & Alien Threat Counter */}
        <div className="flex justify-between sm:justify-around items-center bg-slate-950/70 border border-slate-800 rounded px-3 py-1 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">SECTOR WAVE</span>
            <span className="text-base font-extrabold text-amber-400">
              {engine.currentWave} <span className="text-xs text-slate-500">/ 5</span>
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">ALIENS REMAINING</span>
            <span className="text-base font-extrabold text-rose-400">
              {engine.enemies.length}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">DEFEATED</span>
            <span className="text-base font-extrabold text-emerald-400">
              {engine.aliensDefeated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
