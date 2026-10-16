/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { GAME_CANVAS } from '../constants/config';
import { Enemy } from '../types/game';

interface GameCanvasProps {
  engine: GameEngine;
  onOpenQuiz: () => void;
  onTogglePause: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  onOpenQuiz,
  onTogglePause,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Render loop
    const render = () => {
      engine.update();

      // Clear Canvas Background (Deep Void Space)
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, GAME_CANVAS.WIDTH, GAME_CANVAS.HEIGHT);

      // 1. Draw Starfield
      drawStars(ctx, engine);

      // 2. Draw Particles
      drawParticles(ctx, engine);

      // 3. Draw Bullets
      drawBullets(ctx, engine);

      // 4. Draw Aliens
      for (const enemy of engine.enemies) {
        drawAlien(ctx, enemy);
      }

      // 5. Draw Player
      if (engine.status !== 'gameover') {
        drawPlayer(ctx, engine);
      }

      // 6. Draw Wave Banner Alert
      const bannerText = engine.getWaveBanner();
      if (bannerText) {
        drawWaveBanner(ctx, bannerText);
      }

      // 7. Targeting Reticle
      drawReticle(ctx, engine.mousePos.x, engine.mousePos.y);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  // Window Keyboard & Mouse Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept inputs if user is typing in form inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      engine.keys[e.code] = true;

      // Esc: Toggle Pause
      if (e.code === 'Escape') {
        e.preventDefault();
        onTogglePause();
      }

      // E: Open Physics Console / Recharge
      if (e.code === 'KeyE') {
        e.preventDefault();
        if (engine.status === 'playing') {
          engine.status = 'quiz';
          onOpenQuiz();
        }
      }

      // Space: Shoot projectile
      if (e.code === 'Space') {
        e.preventDefault();
        engine.shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      engine.mousePos.x = (e.clientX - rect.left) * scaleX;
      engine.mousePos.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && engine.status === 'playing') {
        engine.shoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [engine, onOpenQuiz, onTogglePause]);

  return (
    <div className="relative flex justify-center items-center select-none overflow-hidden rounded-xl border-4 border-slate-700/80 shadow-[0_0_50px_rgba(56,189,248,0.25)] bg-slate-950">
      <canvas
        ref={canvasRef}
        width={GAME_CANVAS.WIDTH}
        height={GAME_CANVAS.HEIGHT}
        className="cursor-crosshair block w-full max-w-[800px] h-auto aspect-[4/3] image-pixelated"
      />
    </div>
  );
};

// --- DRAWING HELPERS ---

function drawStars(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const star of engine.stars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const p = engine.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // Invulnerability flicker
  if (p.invulnerableTime > 0 && Math.floor(p.invulnerableTime / 4) % 2 === 0) {
    ctx.restore();
    return;
  }

  // Draw Shield Glow if protected
  if (p.invulnerableTime > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Pixel Art Starfighter Hull
  // Main fuselage
  ctx.fillStyle = '#0284c7'; // Deep blue
  ctx.beginPath();
  ctx.moveTo(p.radius + 6, 0); // Nose tip
  ctx.lineTo(-p.radius, -p.radius * 0.75); // Left wingtip
  ctx.lineTo(-p.radius * 0.4, 0); // Center rear
  ctx.lineTo(-p.radius, p.radius * 0.75); // Right wingtip
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#38bdf8'; // Cyan border
  ctx.stroke();

  // Cockpit canopy
  ctx.fillStyle = '#67e8f9';
  ctx.beginPath();
  ctx.ellipse(p.radius * 0.2, 0, p.radius * 0.4, p.radius * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dual Laser Cannons
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(-p.radius * 0.2, -p.radius * 0.8, 8, 3);
  ctx.fillRect(-p.radius * 0.2, p.radius * 0.8 - 3, 8, 3);

  ctx.restore();
}

function drawAlien(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  const r = enemy.radius;

  if (enemy.type === 'boss') {
    // Mothership Flagship
    ctx.fillStyle = '#831843'; // Deep crimson
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f43f5e';
    ctx.stroke();

    // Central pulsing reactor core
    const pulse = Math.sin(Date.now() * 0.008) * 4;
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Side plasma wings
    ctx.fillStyle = '#be123c';
    ctx.fillRect(-r - 8, -12, 10, 24);
    ctx.fillRect(r - 2, -12, 10, 24);

    // Health Bar for Boss
    drawEnemyHealthBar(ctx, enemy, -r - 18, r * 2);
  } else if (enemy.type === 'heavy') {
    // Heavy Armored Cruiser
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.rect(-r, -r * 0.7, r * 2, r * 1.4);
    ctx.fill();
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Core armor plate
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-r * 0.5, -r * 0.35, r, r * 0.7);

    drawEnemyHealthBar(ctx, enemy, -r - 10, r * 1.6);
  } else if (enemy.type === 'interceptor') {
    // Fast Dart-wing Fighter
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.moveTo(0, r); // Forward tip
    ctx.lineTo(-r, -r);
    ctx.lineTo(0, -r * 0.4);
    ctx.lineTo(r, -r);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    drawEnemyHealthBar(ctx, enemy, -r - 8, r * 1.4);
  } else {
    // Scout Drone (Insectoid)
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Antennae / Wings
    ctx.fillStyle = '#34d399';
    ctx.fillRect(-r - 4, -4, 4, 8);
    ctx.fillRect(r, -4, 4, 8);

    drawEnemyHealthBar(ctx, enemy, -r - 6, r * 1.2);
  }

  // Draw Physics Property Tag on hover/near
  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(enemy.physicsProperty.split('|')[0].trim(), 0, r + 14);

  ctx.restore();
}

function drawEnemyHealthBar(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  yOffset: number,
  width: number
) {
  const hpRatio = Math.max(0, enemy.health / enemy.maxHealth);
  const height = 4;
  const x = -width / 2;

  // Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(x, yOffset, width, height);

  // Fill
  ctx.fillStyle = hpRatio > 0.5 ? '#10b981' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(x, yOffset, width * hpRatio, height);
}

function drawBullets(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const b of engine.bullets) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const p of engine.particles) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fill();
    ctx.restore();
  }
}

function drawWaveBanner(ctx: CanvasRenderingContext2D, text: string) {
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, GAME_CANVAS.HEIGHT / 2 - 40, GAME_CANVAS.WIDTH, 80);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, GAME_CANVAS.HEIGHT / 2 - 40, GAME_CANVAS.WIDTH, 80);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 10;
  ctx.fillText(text, GAME_CANVAS.WIDTH / 2, GAME_CANVAS.HEIGHT / 2);
  ctx.restore();
}

function drawReticle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 6, y);
  ctx.moveTo(x + 6, y);
  ctx.lineTo(x + 14, y);
  ctx.moveTo(x, y - 14);
  ctx.lineTo(x, y - 6);
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + 14);
  ctx.stroke();

  ctx.restore();
}
