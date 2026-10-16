/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhysicsQuestion } from '../types/game';

export const PHYSICS_QUESTIONS: PhysicsQuestion[] = [
  // Kinematics & Velocity
  {
    id: 'kin-1',
    topic: 'Kinematics',
    situation: 'An alien scout is escaping at a constant velocity of 20 m/s for 5 seconds.',
    question: 'How far does the alien scout travel during this time?',
    formulaHint: 'Formula: d = v × t',
    options: ['50 meters', '100 meters', '25 meters', '200 meters'],
    correctIndex: 1,
    explanation: 'Distance equals speed multiplied by time: d = 20 m/s × 5 s = 100 meters.',
    ammoReward: 4,
  },
  {
    id: 'kin-2',
    topic: 'Kinematics',
    situation: 'Your starfighter accelerates uniformly from rest (0 m/s) to 30 m/s in 3 seconds.',
    question: 'What is the acceleration of your starfighter?',
    formulaHint: 'Formula: a = (v - u) / t',
    options: ['10 m/s²', '90 m/s²', '5 m/s²', '30 m/s²'],
    correctIndex: 0,
    explanation: 'Acceleration a = (30 m/s - 0 m/s) / 3 s = 10 m/s².',
    ammoReward: 4,
  },
  {
    id: 'kin-3',
    topic: 'Kinematics',
    situation: 'A plasma projectile is launched horizontally at 40 m/s. It travels for 2 seconds before impact.',
    question: 'Ignoring space friction, what is its horizontal displacement?',
    formulaHint: 'Formula: Δx = vx × t',
    options: ['80 meters', '20 meters', '160 meters', '40 meters'],
    correctIndex: 0,
    explanation: 'Horizontal velocity is constant in zero friction: Δx = 40 m/s × 2 s = 80 meters.',
    ammoReward: 4,
  },

  // Newton's Laws & Force
  {
    id: 'newton-1',
    topic: 'Newton\'s Laws',
    situation: 'An incoming heavy alien cruiser has a mass of 2,000 kg and accelerates at 4 m/s².',
    question: 'What net thrust force is powering the alien cruiser?',
    formulaHint: 'Formula: F = m × a (Newton\'s 2nd Law)',
    options: ['500 N', '8,000 N', '2,000 N', '16,000 N'],
    correctIndex: 1,
    explanation: 'According to Newton\'s 2nd Law: Force = mass × acceleration = 2,000 kg × 4 m/s² = 8,000 Newtons (N).',
    ammoReward: 4,
  },
  {
    id: 'newton-2',
    topic: 'Newton\'s Laws',
    situation: 'Your plasma cannon fires a heavy pulse forward. Your spaceship feels a slight backward recoil.',
    question: 'Which of Newton\'s laws of motion explains this recoil phenomenon?',
    formulaHint: 'Action and Reaction Principle',
    options: [
      'Newton\'s 1st Law (Inertia)',
      'Newton\'s 2nd Law (F = ma)',
      'Newton\'s 3rd Law (Equal & Opposite Action-Reaction)',
      'Newton\'s Law of Cooling'
    ],
    correctIndex: 2,
    explanation: 'Newton\'s 3rd Law states that for every action force, there is an equal and opposite reaction force.',
    ammoReward: 4,
  },
  {
    id: 'newton-3',
    topic: 'Newton\'s Laws',
    situation: 'In deep empty space with no external forces or friction, your ship turns off its thrusters.',
    question: 'What happens to your ship\'s current motion?',
    formulaHint: 'Newton\'s 1st Law (Law of Inertia)',
    options: [
      'It immediately stops completely',
      'It continues moving at constant velocity in a straight line',
      'It slowly curves backwards',
      'It accelerates automatically'
    ],
    correctIndex: 1,
    explanation: 'An object in motion remains in motion with constant velocity unless acted upon by a net external force (Inertia).',
    ammoReward: 4,
  },

  // Work, Energy & Power
  {
    id: 'energy-1',
    topic: 'Work & Energy',
    situation: 'A laser turret pushes a target asteroid with a constant force of 500 N over a distance of 10 meters in the same direction.',
    question: 'How much work was done on the asteroid?',
    formulaHint: 'Formula: W = F × d',
    options: ['5,000 Joules', '50 Joules', '500 Joules', '2,500 Joules'],
    correctIndex: 0,
    explanation: 'Work W = Force × displacement = 500 N × 10 m = 5,000 Joules (J).',
    ammoReward: 4,
  },
  {
    id: 'energy-2',
    topic: 'Work & Energy',
    situation: 'An alien drone of mass 100 kg is cruising at a speed of 6 m/s.',
    question: 'What is the drone\'s kinetic energy (KE)?',
    formulaHint: 'Formula: KE = ½ × m × v²',
    options: ['300 J', '600 J', '1,800 J', '3,600 J'],
    correctIndex: 2,
    explanation: 'KE = ½ × 100 kg × (6 m/s)² = 50 × 36 = 1,800 Joules.',
    ammoReward: 4,
  },
  {
    id: 'energy-3',
    topic: 'Work & Energy',
    situation: 'An enemy fighter ship accelerates, causing its velocity to double from 10 m/s to 20 m/s.',
    question: 'How does this increase affect the fighter\'s kinetic energy?',
    formulaHint: 'Notice the v² term in KE = ½ m v²',
    options: [
      'It doubles (2x)',
      'It quadruples (4x)',
      'It stays the same',
      'It increases by 8x'
    ],
    correctIndex: 1,
    explanation: 'Kinetic energy is proportional to the square of velocity (v²). When speed doubles (2² = 4), kinetic energy quadruples!',
    ammoReward: 4,
  },

  // Momentum & Collisions
  {
    id: 'mom-1',
    topic: 'Momentum',
    situation: 'An armored drone with a mass of 40 kg flies with a velocity of 5 m/s toward your shield.',
    question: 'What is the drone\'s linear momentum?',
    formulaHint: 'Formula: p = m × v',
    options: ['200 kg·m/s', '8 kg·m/s', '45 kg·m/s', '400 kg·m/s'],
    correctIndex: 0,
    explanation: 'Linear momentum p = mass × velocity = 40 kg × 5 m/s = 200 kg·m/s.',
    ammoReward: 4,
  },
  {
    id: 'mom-2',
    topic: 'Momentum',
    situation: 'Two alien drones collide in deep space in an isolated system with no external forces.',
    question: 'Which fundamental quantity is strictly conserved in this collision?',
    formulaHint: 'Law of Conservation of Momentum',
    options: [
      'Total momentum of the system',
      'Only the heavier drone\'s speed',
      'Temperature only',
      'Volume only'
    ],
    correctIndex: 0,
    explanation: 'In any closed system without external net forces, the total momentum before collision equals total momentum after.',
    ammoReward: 4,
  },

  // Gravitation & Orbits
  {
    id: 'grav-1',
    topic: 'Gravitation',
    situation: 'Two asteroids of mass M1 and M2 are separated by distance r. If the distance between them is doubled (2r):',
    question: 'What happens to the gravitational force between them?',
    formulaHint: 'Formula: F = G(M1·M2) / r² (Inverse Square Law)',
    options: [
      'It halves (1/2 of original)',
      'It drops to 1/4 of original',
      'It doubles',
      'It remains unchanged'
    ],
    correctIndex: 1,
    explanation: 'By Newton\'s Law of Universal Gravitation, force is inversely proportional to r². Doubling distance reduces force to 1/(2²) = 1/4.',
    ammoReward: 4,
  },
  {
    id: 'grav-2',
    topic: 'Gravitation',
    situation: 'Near a planet\'s surface with g = 9.8 m/s², an emergency probe with mass 50 kg is dropped from rest.',
    question: 'What is the gravitational weight force acting on the probe?',
    formulaHint: 'Formula: W = m × g',
    options: ['490 N', '50 N', '9.8 N', '980 N'],
    correctIndex: 0,
    explanation: 'Weight W = m × g = 50 kg × 9.8 m/s² = 490 Newtons.',
    ammoReward: 4,
  },

  // Waves & Light
  {
    id: 'wave-1',
    topic: 'Waves',
    situation: 'Your sensor detects an alien electromagnetic wave with frequency f = 500 MHz and speed c = 3 × 10⁸ m/s.',
    question: 'What is the relationship between wave speed (v), frequency (f), and wavelength (λ)?',
    formulaHint: 'Formula: v = f × λ',
    options: [
      'v = f × λ',
      'v = f / λ',
      'v = λ / f²',
      'v = f + λ'
    ],
    correctIndex: 0,
    explanation: 'Wave speed is universally given by v = f × λ (velocity = frequency × wavelength).',
    ammoReward: 4,
  },
];
