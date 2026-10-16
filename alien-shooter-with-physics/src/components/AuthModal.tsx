/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { auth, saveStudentProfile, getStudentProfile } from '../services/firebase';
import { StudentProfile } from '../types/game';
import { Atom, User, Lock, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onAuthenticated: (profile: StudentProfile) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onAuthenticated,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('High School Physics');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        // Register new student account
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const newProfile: StudentProfile = {
          uid: userCred.user.uid,
          displayName: displayName.trim() || email.split('@')[0] || 'Cadet',
          gradeLevel,
          avatar: 'pilot',
          highScore: 0,
          questionsCorrect: 0,
        };
        await saveStudentProfile(newProfile);
        onAuthenticated(newProfile);
      } else {
        // Log in existing student
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        let profile = await getStudentProfile(userCred.user.uid);
        if (!profile) {
          profile = {
            uid: userCred.user.uid,
            displayName: userCred.user.email?.split('@')[0] || 'Cadet',
            gradeLevel: 'High School Physics',
            avatar: 'pilot',
            highScore: 0,
            questionsCorrect: 0,
          };
          await saveStudentProfile(profile);
        }
        onAuthenticated(profile);
      }
    } catch (err: unknown) {
      console.error('Authentication error:', err);
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('auth/invalid-email')) {
        setErrorMsg('Invalid email format. Please check your email.');
      } else if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
        setErrorMsg('Invalid student credentials or user not found.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setErrorMsg('This student email is already registered. Please log in.');
      } else if (msg.includes('auth/weak-password')) {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Guest Student Mode
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let uid = 'guest-' + Math.random().toString(36).substring(2, 9);
      try {
        const userCred = await signInAnonymously(auth);
        uid = userCred.user.uid;
      } catch (authErr) {
        console.warn('Anonymous Firebase auth skipped, using guest cadet mode:', authErr);
      }

      let profile = await getStudentProfile(uid);
      if (!profile) {
        profile = {
          uid,
          displayName: 'Cadet ' + Math.floor(100 + Math.random() * 900),
          gradeLevel: 'Introductory Physics',
          avatar: 'pilot',
          highScore: 0,
          questionsCorrect: 0,
        };
        await saveStudentProfile(profile);
      }
      onAuthenticated(profile);
    } catch (err) {
      console.error('Guest login error:', err);
      setErrorMsg('Could not start cadet guest session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/60 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden font-mono text-slate-100">
        {/* Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-950 to-slate-900 border-b border-cyan-800/60 text-center">
          <div className="inline-flex p-3 rounded-full bg-cyan-950/90 border border-cyan-400/40 text-cyan-400 mb-2 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            <Atom size={28} className="animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h1 className="text-lg font-black tracking-wider text-white uppercase">
            Alien Shooter With Physics
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Student Flight Academy & Research Portal
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 bg-slate-950 border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
            }}
            className={`py-3 flex items-center justify-center gap-1.5 transition-colors ${
              !isRegister
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn size={14} />
            <span>STUDENT LOGIN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
            }}
            className={`py-3 flex items-center justify-center gap-1.5 transition-colors ${
              isRegister
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus size={14} />
            <span>REGISTER ACCOUNT</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 text-[11px]">
              {errorMsg}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  CALLSIGN / STUDENT NAME
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Cadet Isaac Newton"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  PHYSICS GRADE LEVEL
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Middle School Physics">Middle School Physics</option>
                  <option value="High School Physics">High School Physics</option>
                  <option value="AP Physics 1: Mechanics">AP Physics 1: Mechanics</option>
                  <option value="College Classical Mechanics">College Classical Mechanics</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              STUDENT EMAIL
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <span>{isLoading ? 'Authenticating...' : isRegister ? 'Create Student Account' : 'Sign In to Battle'}</span>
            <ArrowRight size={14} />
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-bold">
              OR
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Guest Quick Play Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Instant Play as Guest Cadet</span>
          </button>
        </form>
      </div>
    </div>
  );
};
