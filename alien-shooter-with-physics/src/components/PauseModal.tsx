/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Save, RotateCcw, LogOut, Check } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onSaveProgress: () => Promise<void>;
  onRestart: () => void;
  onLogout: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onSaveProgress,
  onRestart,
  onLogout,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveProgress();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.25)] overflow-hidden font-mono text-slate-100 text-center">
        {/* Header */}
        <div className="p-4 bg-gradient-to-b from-amber-950/80 to-slate-900 border-b border-amber-800/40">
          <h2 className="text-base font-black tracking-widest text-amber-400 uppercase">
            SIMULATION PAUSED
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Press ESC to Resume</p>
        </div>

        {/* Controls Guide */}
        <div className="p-4 text-xs space-y-2 border-b border-slate-800 text-left bg-slate-950/60">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            Flight Controls Reference:
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">W / A / S / D</span>
            <span>Thrusters & Navigation</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">SPACE / MOUSE 1</span>
            <span>Fire Plasma Cannon</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">E</span>
            <span>Physics Console (Recharge)</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">ESC</span>
            <span>Pause / Resume</span>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="p-4 space-y-2 text-xs">
          <button
            onClick={onResume}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Play size={15} />
            <span>RESUME MISSION [ESC]</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {saveSuccess ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Game Saved to Firebase!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save Game Progress'}</span>
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Restart Wave 1</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 rounded-lg text-rose-300 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={14} />
            <span>Student Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
