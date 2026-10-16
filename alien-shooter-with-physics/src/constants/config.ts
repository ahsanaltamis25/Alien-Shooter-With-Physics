/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * GAME BALANCE CONFIGURATION
 * Modify values in this file to tweak gameplay parameters!
 * 
 * - PLAYER_CONFIG: Adjust movement speed, friction, starting health and ammo.
 * - BULLET_CONFIG: Adjust bullet velocity, damage, and lifespan.
 * - ENEMY_STATS: Adjust enemy HP, speed, and point values for each alien type.
 * - WAVE_CONFIG: Adjust total waves, alien spawn quantities, and difficulty scaling.
 */

export const GAME_CANVAS = {
  WIDTH: 800,
  HEIGHT: 600,
};

export const PLAYER_CONFIG = {
  INITIAL_SPEED: 4.8,       // Base movement acceleration
  MAX_SPEED: 6.5,           // Maximum velocity cap
  FRICTION: 0.92,           // Velocity decay (0 = stop instantly, 1 = ice skating)
  RADIUS: 18,               // Player collision hit radius in pixels
  STARTING_HEALTH: 100,     // Initial health points
  MAX_HEALTH: 100,          // Maximum allowed health
  STARTING_AMMO: 6,         // Starting plasma rounds (replenished by solving physics questions)
  MAX_AMMO: 12,             // Maximum plasma ammo capacity
  INVULNERABLE_DURATION: 60,// Frames of invulnerability after being damaged (60 frames ≈ 1 sec)
};

export const BULLET_CONFIG = {
  SPEED: 9.5,               // Velocity of player projectile
  RADIUS: 4,                // Hitbox radius of bullet
  DAMAGE: 35,               // Base damage dealt to aliens
  ENEMY_BULLET_SPEED: 4.0,  // Velocity of alien projectiles
  ENEMY_BULLET_DAMAGE: 15,  // Damage dealt to player
};

export const ENEMY_STATS = {
  scout: {
    health: 30,
    speed: 2.2,
    radius: 16,
    scoreValue: 100,
    color: '#34d399',       // Neon Emerald
    physicsProperty: 'Mass: 150 kg | Aerodynamic Glider',
    fireInterval: 140,      // Frames between shots
  },
  interceptor: {
    health: 55,
    speed: 3.1,
    radius: 20,
    scoreValue: 200,
    color: '#38bdf8',       // Neon Sky Blue
    physicsProperty: 'Mass: 320 kg | High Thrust/Mass Ratio',
    fireInterval: 100,
  },
  heavy: {
    health: 120,
    speed: 1.2,
    radius: 28,
    scoreValue: 400,
    color: '#f97316',       // Plasma Amber
    physicsProperty: 'Mass: 1800 kg | Inertial Armor Plating',
    fireInterval: 80,
  },
  boss: {
    health: 650,
    speed: 1.0,
    radius: 46,
    scoreValue: 2500,
    color: '#ec4899',       // Void Violet/Pink
    physicsProperty: 'Mass: 85,000 kg | Gravitational Core Matrix',
    fireInterval: 45,
  },
};

export const WAVE_CONFIG = {
  MAX_WAVES: 5,             // Win condition achieved after clearing Wave 5
  BASE_ENEMIES_PER_WAVE: 4,
  ENEMY_INCREMENT_PER_WAVE: 3,
};

export const QUIZ_SETTINGS = {
  AMMO_PER_CORRECT_ANSWER: 4,  // Number of plasma charges granted on correct physics answer
  BONUS_SCORE_ON_CORRECT: 250, // Bonus points for solving physics challenge
  BONUS_HEALTH_REPAIR: 15,     // Hull repairs granted on correct answer
};
