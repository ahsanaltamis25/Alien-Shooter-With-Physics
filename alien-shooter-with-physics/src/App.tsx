/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  auth,
  getStudentProfile,
  saveStudentProfile,
  saveGameProgress,
  loadGameProgress,
  submitLeaderboardScore,
} from './services/firebase';
import { GameEngine } from './engine/GameEngine';
import { sound } from './engine/soundEffects';
import { StudentProfile, GameSave } from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { PhysicsQuizModal } from './components/PhysicsQuizModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import {
  Atom,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  ShieldAlert,
  Sparkles,
  Info,
  Trophy,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [savedRun, setSavedRun] = useState<GameSave | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [hasSavedRecord, setHasSavedRecord] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'game' | 'physics-guide'>('game');

  // Game Engine instance
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine(
      () => {
        // Trigger quiz callback
        setShowQuizModal(true);
      },
      (won: boolean) => {
        // Game over callback
        setIsVictory(won);
        setIsGameOverModalOpen(true);
      }
    );
  }
  const engine = engineRef.current;

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const prof = await getStudentProfile(user.uid);
        if (prof) {
          setStudent(prof);
        } else {
          // Initialize default cadet profile
          const initialProf: StudentProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Cadet Newton',
            gradeLevel: 'High School Physics',
            avatar: 'pilot',
            highScore: 0,
            questionsCorrect: 0,
          };
          await saveStudentProfile(initialProf);
          setStudent(initialProf);
        }

        // Check for existing saved run
        const save = await loadGameProgress(user.uid);
        if (save && save.health > 0) {
          setSavedRun(save);
        }
      } else {
        // Check if there is a local guest cadet
        const localGuest = localStorage.getItem('active_guest_student');
        if (localGuest) {
          setStudent(JSON.parse(localGuest));
        } else {
          setShowAuthModal(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle student login / guest selection
  const handleAuthenticated = async (profile: StudentProfile) => {
    setStudent(profile);
    localStorage.setItem('active_guest_student', JSON.stringify(profile));
    setShowAuthModal(false);

    // Look for previous save
    const save = await loadGameProgress(profile.uid);
    if (save && save.health > 0) {
      setSavedRun(save);
    }
  };

  // Start fresh game
  const handleStartGame = () => {
    engine.startNewGame();
    setIsGameOverModalOpen(false);
    setShowPauseModal(false);
  };

  // Continue previously saved game
  const handleResumeSavedRun = () => {
    if (!savedRun) return;
    engine.loadSavedGame(
      savedRun.level,
      savedRun.score,
      savedRun.health,
      savedRun.maxHealth,
      savedRun.ammo,
      savedRun.aliensDefeated
    );
    setSavedRun(null);
    setIsGameOverModalOpen(false);
    setShowPauseModal(false);
  };

  // Pause / Resume toggle
  const handleTogglePause = () => {
    if (engine.status === 'playing') {
      engine.status = 'paused';
      setShowPauseModal(true);
    } else if (engine.status === 'paused') {
      engine.status = 'playing';
      setShowPauseModal(false);
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // Save current progress to Firebase
  const handleSaveProgress = async () => {
    if (!student) return;
    const saveData: GameSave = {
      uid: student.uid,
      level: engine.currentWave,
      score: engine.score,
      health: engine.player.health,
      maxHealth: engine.player.maxHealth,
      ammo: engine.player.ammo,
      aliensDefeated: engine.aliensDefeated,
      questionsAnswered: engine.questionsAnswered,
      savedAt: new Date().toISOString(),
    };
    await saveGameProgress(saveData);

    // Also update student's profile high score and submit to Leaderboard
    const bestScore = Math.max(student.highScore, engine.score);
    const totalCorrect = student.questionsCorrect + engine.questionsAnswered;
    if (engine.score > student.highScore || engine.questionsAnswered > 0) {
      const updatedProfile: StudentProfile = {
        ...student,
        highScore: bestScore,
        questionsCorrect: totalCorrect,
      };
      await saveStudentProfile(updatedProfile);
      setStudent(updatedProfile);
    }

    // Submit entry to Galactic Leaderboard
    await submitLeaderboardScore({
      uid: student.uid,
      displayName: student.displayName,
      avatar: student.avatar,
      gradeLevel: student.gradeLevel,
      highScore: bestScore,
      questionsCorrect: totalCorrect,
      updatedAt: new Date().toISOString(),
    });

    setHasSavedRecord(true);
  };

  // Solve quiz callback
  const handleQuizSolved = (ammoReward: number, scoreReward: number, healthRepair: number) => {
    engine.rewardPhysicsSuccess(ammoReward, scoreReward, healthRepair);
    if (student) {
      setStudent({
        ...student,
        questionsCorrect: student.questionsCorrect + 1,
      });
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // Safe fallback
    }
    localStorage.removeItem('active_guest_student');
    setStudent(null);
    setSavedRun(null);
    setShowPauseModal(false);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-5 select-none font-sans">
      {/* Top Header Bar */}
      <header className="w-full max-w-[800px] flex items-center justify-between py-2 border-b border-slate-800 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Atom size={20} className="animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-2">
              Alien Shooter <span className="text-cyan-400">With Physics</span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Interactive Newtonian Mechanics Flight Lab
            </p>
          </div>
        </div>

        {/* Tab Selector & Leaderboard Trigger */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('game')}
            className={`px-3 py-1 rounded font-semibold transition-all ${
              activeTab === 'game'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Game Battle
          </button>
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="px-2.5 py-1 rounded font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 flex items-center gap-1 transition-all"
            title="Open Leaderboard"
          >
            <Trophy size={13} />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('physics-guide')}
            className={`px-2.5 py-1 rounded font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'physics-guide'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Formulas</span>
          </button>
        </div>
      </header>

      {/* Main Game Interface Container */}
      <main className="w-full max-w-[800px] flex flex-col items-center my-auto py-2">
        {activeTab === 'game' ? (
          <>
            {/* Heads Up Display */}
            <HUD
              engine={engine}
              student={student}
              onOpenProfile={() => setShowProfileModal(true)}
              onOpenQuiz={() => {
                engine.status = 'quiz';
                setShowQuizModal(true);
              }}
              onOpenLeaderboard={() => setShowLeaderboardModal(true)}
              onPause={handleTogglePause}
              onSave={handleSaveProgress}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
            />

            {/* Canvas Viewport */}
            <div className="relative w-full">
              <GameCanvas
                engine={engine}
                onOpenQuiz={() => setShowQuizModal(true)}
                onTogglePause={handleTogglePause}
              />

              {/* Start Screen Overlay when Idle */}
              {engine.status === 'idle' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center font-mono rounded-xl">
                  <div className="p-3 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-400 mb-3 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    <Atom size={36} className="animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase mb-1">
                    Defend Earth with Physics
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
                    Hostile alien drones are invading. Solve classical kinematics, force, and momentum problems to empower your plasma cannons!
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleStartGame}
                      className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                    >
                      <Play size={16} />
                      <span>START NEW CAMPAIGN</span>
                    </button>

                    {savedRun && (
                      <button
                        onClick={handleResumeSavedRun}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                      >
                        <Sparkles size={16} />
                        <span>CONTINUE WAVE {savedRun.level} SAVE</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Keyboard Controls Bar */}
            <div className="w-full mt-3 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">CONTROLS:</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-slate-700">W/A/S/D</span>
                <span>Move</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-slate-700 ml-2">SPACE</span>
                <span>Shoot</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-slate-700 ml-2">E</span>
                <span>Physics Quiz</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-slate-700 ml-2">ESC</span>
                <span>Pause</span>
              </div>
              <div className="text-[10px] text-cyan-300">
                Plasma rounds depleted? Press <span className="font-bold underline">E</span> to solve physics problem!
              </div>
            </div>
          </>
        ) : (
          /* Physics Formula Field Manual */
          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono space-y-5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
              <BookOpen size={20} />
              <h2 className="text-base font-bold uppercase tracking-wider">
                Cadet Physics Handbook & Formula Matrix
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-amber-400 text-sm mb-1">1. Kinematics & Velocity</h3>
                <p className="text-[11px] text-slate-400 mb-2">Motion under constant acceleration and uniform displacement.</p>
                <div className="space-y-1 text-cyan-300 font-semibold bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <div>d = v × t (Displacement)</div>
                  <div>a = (v - u) / t (Acceleration)</div>
                  <div>v² = u² + 2ad</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-emerald-400 text-sm mb-1">2. Newton's Laws & Force</h3>
                <p className="text-[11px] text-slate-400 mb-2">Inertia, dynamic force acceleration, and reactive action pairs.</p>
                <div className="space-y-1 text-cyan-300 font-semibold bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <div>F_net = m × a (Newton's 2nd Law)</div>
                  <div>F_action = -F_reaction (3rd Law Recoil)</div>
                  <div>W = m × g (Weight force)</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-sky-400 text-sm mb-1">3. Work & Kinetic Energy</h3>
                <p className="text-[11px] text-slate-400 mb-2">Energy transfer through forces exerted across displacement.</p>
                <div className="space-y-1 text-cyan-300 font-semibold bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <div>W = F × d (Work in Joules)</div>
                  <div>KE = ½ × m × v² (Kinetic Energy)</div>
                  <div>PE = m × g × h (Gravitational Potential)</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-purple-400 text-sm mb-1">4. Momentum & Gravitation</h3>
                <p className="text-[11px] text-slate-400 mb-2">Inelastic/elastic collision conservation and inverse-square laws.</p>
                <div className="space-y-1 text-cyan-300 font-semibold bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <div>p = m × v (Linear Momentum)</div>
                  <div>Σp_initial = Σp_final (Conservation)</div>
                  <div>F_g = G(M₁M₂) / r² (Universal Gravity)</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('game')}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors"
              >
                Return to Space Combat
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[800px] text-center py-2 text-[11px] font-mono text-slate-500 border-t border-slate-800 flex justify-between items-center">
        <span>Alien Shooter With Physics © AI Studio Game Lab</span>
        <span>Firebase Cloud Persistence & Auth</span>
      </footer>

      {/* --- MODALS --- */}

      {/* 1. Student Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onAuthenticated={handleAuthenticated}
      />

      {/* 2. Physics Quiz Modal */}
      <PhysicsQuizModal
        isOpen={showQuizModal}
        onSolveCorrect={handleQuizSolved}
        onClose={() => {
          setShowQuizModal(false);
          engine.status = 'playing';
        }}
      />

      {/* 3. Student Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        student={student}
        onUpdateStudent={(updated) => setStudent(updated)}
        onClose={() => setShowProfileModal(false)}
      />

      {/* 4. Pause Menu Modal */}
      <PauseModal
        isOpen={showPauseModal}
        onResume={() => {
          setShowPauseModal(false);
          engine.status = 'playing';
        }}
        onSaveProgress={handleSaveProgress}
        onRestart={handleStartGame}
        onLogout={handleLogout}
      />

      {/* 5. Game Over / Victory Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        isVictory={isVictory}
        score={engine.score}
        wave={engine.currentWave}
        aliensDefeated={engine.aliensDefeated}
        questionsAnswered={engine.questionsAnswered}
        onRestart={handleStartGame}
        onSave={handleSaveProgress}
        onViewLeaderboard={() => setShowLeaderboardModal(true)}
        hasSaved={hasSavedRecord}
      />

      {/* 6. Galactic Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        currentUserId={student?.uid}
        onClose={() => setShowLeaderboardModal(false)}
      />
    </div>
  );
}
