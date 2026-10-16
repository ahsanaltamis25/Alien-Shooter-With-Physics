/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PhysicsQuestion } from '../types/game';
import { PHYSICS_QUESTIONS } from '../data/physicsQuestions';
import { QUIZ_SETTINGS } from '../constants/config';
import { sound } from '../engine/soundEffects';
import { Atom, Zap, CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface PhysicsQuizModalProps {
  isOpen: boolean;
  onSolveCorrect: (ammoAmount: number, scoreAmount: number, healthRepair: number) => void;
  onClose: () => void;
}

export const PhysicsQuizModal: React.FC<PhysicsQuizModalProps> = ({
  isOpen,
  onSolveCorrect,
  onClose,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<PhysicsQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showFormulaHint, setShowFormulaHint] = useState<boolean>(false);

  // Pick a fresh question each time the modal opens
  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * PHYSICS_QUESTIONS.length);
      setCurrentQuestion(PHYSICS_QUESTIONS[randomIndex]);
      setSelectedIndex(null);
      setHasSubmitted(false);
      setShowFormulaHint(false);
    }
  }, [isOpen]);

  if (!isOpen || !currentQuestion) return null;

  const isCorrect = selectedIndex === currentQuestion.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(idx);
    setHasSubmitted(true);

    if (idx === currentQuestion.correctIndex) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      onSolveCorrect(
        QUIZ_SETTINGS.AMMO_PER_CORRECT_ANSWER,
        QUIZ_SETTINGS.BONUS_SCORE_ON_CORRECT,
        QUIZ_SETTINGS.BONUS_HEALTH_REPAIR
      );
    }
    onClose();
  };

  const handleNextChallenge = () => {
    // Let student try another challenge if wrong
    const otherQuestions = PHYSICS_QUESTIONS.filter(q => q.id !== currentQuestion.id);
    const nextQ = otherQuestions[Math.floor(Math.random() * otherQuestions.length)];
    setCurrentQuestion(nextQ);
    setSelectedIndex(null);
    setHasSubmitted(false);
    setShowFormulaHint(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/60 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden font-mono text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950/90 to-slate-900 border-b border-cyan-800/50">
          <div className="flex items-center gap-2 text-cyan-400">
            <Atom className="animate-spin text-cyan-400" size={20} style={{ animationDuration: '6s' }} />
            <h2 className="text-sm sm:text-base font-extrabold tracking-wider uppercase">
              Physics Targeting Computer
            </h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-400/30 text-cyan-200">
            {currentQuestion.topic}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Tactical Battle Context */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-amber-200/90 flex gap-2.5 items-start">
            <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400 uppercase text-[10px] block">
                Combat Situation:
              </span>
              <p className="leading-relaxed mt-0.5">{currentQuestion.situation}</p>
            </div>
          </div>

          {/* Physics Question */}
          <div className="text-sm font-semibold text-white leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            {currentQuestion.question}
          </div>

          {/* Formula Hint Toggle */}
          {currentQuestion.formulaHint && (
            <div>
              <button
                type="button"
                onClick={() => setShowFormulaHint(!showFormulaHint)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors underline underline-offset-4"
              >
                <HelpCircle size={13} />
                <span>{showFormulaHint ? 'Hide Physics Formula' : 'Need a Hint? Show Formula'}</span>
              </button>
              {showFormulaHint && (
                <div className="mt-2 p-2.5 bg-cyan-950/40 border border-cyan-800/60 rounded text-xs text-cyan-300">
                  {currentQuestion.formulaHint}
                </div>
              )}
            </div>
          )}

          {/* Multiple Choice Options */}
          <div className="space-y-2 pt-1">
            {currentQuestion.options.map((option, idx) => {
              let btnStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200';
              if (hasSubmitted) {
                if (idx === currentQuestion.correctIndex) {
                  btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                } else if (idx === selectedIndex) {
                  btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-900/80 border border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {hasSubmitted && idx === currentQuestion.correctIndex && (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  )}
                  {hasSubmitted && idx === selectedIndex && idx !== currentQuestion.correctIndex && (
                    <XCircle size={18} className="text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner after answering */}
          {hasSubmitted && (
            <div
              className={`p-3.5 rounded-lg border text-xs leading-relaxed animate-in fade-in duration-200 ${
                isCorrect
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Calculation Correct! Weapon Systems Charged (+4 Plasma Shots)</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-rose-400" />
                    <span>Calculation Inaccurate! Weapon Matrix Misfire</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-slate-300">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <div className="text-[11px] text-slate-400">
            {isCorrect ? (
              <span className="text-emerald-400 font-semibold">
                Reward: +4 Plasma Shots & +250 Score
              </span>
            ) : (
              <span>Solve questions to empower weapon systems</span>
            )}
          </div>

          <div className="flex gap-2">
            {hasSubmitted && !isCorrect && (
              <button
                onClick={handleNextChallenge}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-semibold text-slate-200 transition-colors"
              >
                Try Another Question
              </button>
            )}
            <button
              onClick={handleContinue}
              className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                hasSubmitted && isCorrect
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <span>{hasSubmitted ? (isCorrect ? 'Engage Aliens!' : 'Resume Battle') : 'Skip / Resume'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
