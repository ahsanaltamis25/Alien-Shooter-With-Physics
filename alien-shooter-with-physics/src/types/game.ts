/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vector2D {
  x: number;
  y: number;
}

export type AlienType = 'scout' | 'interceptor' | 'heavy' | 'boss';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  speed: number;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  shield: number;
  invulnerableTime: number;
}

export interface Enemy {
  id: string;
  type: AlienType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  scoreValue: number;
  color: string;
  shootCooldown: number;
  oscillationOffset?: number;
  physicsProperty: string; // e.g. "Mass: 500kg", "Charge: -2C"
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface PhysicsQuestion {
  id: string;
  topic: 'Kinematics' | 'Newton\'s Laws' | 'Work & Energy' | 'Momentum' | 'Gravitation' | 'Waves';
  situation: string; // context in battle
  question: string;
  formulaHint?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  ammoReward: number;
}

export interface StudentProfile {
  uid: string;
  displayName: string;
  gradeLevel: string;
  avatar: string;
  highScore: number;
  questionsCorrect: number;
  updatedAt?: string;
}

export interface GameSave {
  uid: string;
  level: number;
  score: number;
  health: number;
  maxHealth: number;
  ammo: number;
  aliensDefeated: number;
  questionsAnswered: number;
  savedAt: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatar: string;
  gradeLevel: string;
  highScore: number;
  questionsCorrect: number;
  updatedAt: string;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'quiz' | 'victory' | 'gameover';
