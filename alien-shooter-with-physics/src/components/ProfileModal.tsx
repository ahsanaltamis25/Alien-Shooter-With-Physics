/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentProfile } from '../types/game';
import { saveStudentProfile } from '../services/firebase';
import { User, Award, Shield, Check, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  student: StudentProfile | null;
  onUpdateStudent: (updated: StudentProfile) => void;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'pilot', name: 'Ace Pilot', emoji: '🚀', desc: 'Kinematics & Trajectories' },
  { id: 'scientist', name: 'Quantum Physicist', emoji: '🔬', desc: 'Energy & Work' },
  { id: 'cyber', name: 'Cybernetic Sentinel', emoji: '🤖', desc: 'Newtonian Force' },
  { id: 'cosmonaut', name: 'Stellar Cosmonaut', emoji: '👨‍🚀', desc: 'Universal Gravity' },
];

const GRADE_LEVELS = [
  'Introductory / Middle School Physics',
  'High School Physics',
  'AP Physics 1: Mechanics',
  'College Classical Mechanics',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  student,
  onUpdateStudent,
  onClose,
}) => {
  const [displayName, setDisplayName] = useState(student?.displayName || 'Cadet Newton');
  const [gradeLevel, setGradeLevel] = useState(
    student?.gradeLevel || 'High School Physics'
  );
  const [avatar, setAvatar] = useState(student?.avatar || 'pilot');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsSaving(true);
    const updated: StudentProfile = {
      ...student,
      displayName: displayName.trim() || 'Cadet',
      gradeLevel,
      avatar,
    };

    try {
      await saveStudentProfile(updated);
      onUpdateStudent(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to update student profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/60 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden font-mono text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <User size={18} />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Student Profile Console
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Avatar Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2">
              SELECT AVATAR
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAvatar(opt.id)}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                    avatar === opt.id
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <div className="font-bold text-white text-[11px]">{opt.name}</div>
                    <div className="text-[9px] text-slate-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Callsign / Display Name */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              STUDENT CALLSIGN / NAME
            </label>
            <input
              type="text"
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              placeholder="e.g. Cadet Isaac Newton"
              required
            />
          </div>

          {/* Grade / Curriculum Tier */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              PHYSICS GRADE / CURRICULUM LEVEL
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              {GRADE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics & Cloud Database Info */}
          {student && (
            <div className="space-y-2">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-amber-300">
                  <Award size={14} />
                  <span>High Score: {student.highScore.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <Shield size={14} />
                  <span>Solved: {student.questionsCorrect} Challenges</span>
                </div>
              </div>

              {/* Firestore Cloud Sync Badge */}
              <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-[10px] text-cyan-300 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Firebase Firestore Database
                  </span>
                  <span className="text-slate-400 font-mono">Collection: /students</span>
                </div>
                <div className="text-slate-400 truncate">
                  UID: <span className="font-mono text-slate-300">{student.uid}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              {saveSuccess ? (
                <>
                  <Check size={14} />
                  <span>Saved to Database!</span>
                </>
              ) : (
                <span>{isSaving ? 'Saving to Database...' : 'Save to Database'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
