/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Player,
  Enemy,
  Bullet,
  Particle,
  Star,
  AlienType,
  GameStatus,
} from '../types/game';
import {
  GAME_CANVAS,
  PLAYER_CONFIG,
  BULLET_CONFIG,
  ENEMY_STATS,
  WAVE_CONFIG,
} from '../constants/config';
import { sound } from './soundEffects';

export class GameEngine {
  public player: Player;
  public enemies: Enemy[] = [];
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public stars: Star[] = [];
  
  public currentWave: number = 1;
  public score: number = 0;
  public aliensDefeated: number = 0;
  public questionsAnswered: number = 0;
  public status: GameStatus = 'idle';

  // Keyboard key state tracker
  public keys: { [key: string]: boolean } = {};
  public mousePos: { x: number; y: number } = { x: 400, y: 300 };

  private waveTimer: number = 0;
  private waveBannerText: string | null = null;
  private waveBannerTimer: number = 0;
  private onTriggerQuiz?: () => void;
  private onGameOver?: (won: boolean) => void;

  constructor(
    onTriggerQuiz?: () => void,
    onGameOver?: (won: boolean) => void
  ) {
    this.onTriggerQuiz = onTriggerQuiz;
    this.onGameOver = onGameOver;
    this.player = this.createDefaultPlayer();
    this.initStars();
  }

  // Create clean initial player state
  public createDefaultPlayer(): Player {
    return {
      x: GAME_CANVAS.WIDTH / 2,
      y: GAME_CANVAS.HEIGHT - 100,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2, // Facing up
      radius: PLAYER_CONFIG.RADIUS,
      speed: PLAYER_CONFIG.INITIAL_SPEED,
      health: PLAYER_CONFIG.STARTING_HEALTH,
      maxHealth: PLAYER_CONFIG.MAX_HEALTH,
      ammo: PLAYER_CONFIG.STARTING_AMMO,
      maxAmmo: PLAYER_CONFIG.MAX_AMMO,
      shield: 50,
      invulnerableTime: 0,
    };
  }

  // Populate dynamic parallax starfield background
  private initStars() {
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * GAME_CANVAS.WIDTH,
        y: Math.random() * GAME_CANVAS.HEIGHT,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.8 + 0.2,
      });
    }
  }

  // Start new game or restart
  public startNewGame() {
    this.player = this.createDefaultPlayer();
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.currentWave = 1;
    this.score = 0;
    this.aliensDefeated = 0;
    this.questionsAnswered = 0;
    this.status = 'playing';
    this.spawnWave(1);
  }

  // Load saved run state
  public loadSavedGame(
    level: number,
    score: number,
    health: number,
    maxHealth: number,
    ammo: number,
    aliensDefeated: number
  ) {
    this.player = this.createDefaultPlayer();
    this.player.health = Math.min(health, maxHealth);
    this.player.maxHealth = maxHealth;
    this.player.ammo = ammo;
    this.currentWave = level;
    this.score = score;
    this.aliensDefeated = aliensDefeated;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.status = 'playing';
    this.spawnWave(level);
  }

  // Spawn alien fleet for current wave
  public spawnWave(waveNum: number) {
    this.enemies = [];
    this.waveBannerText = `WAVE ${waveNum}: ALIEN INVASION`;
    this.waveBannerTimer = 120; // 2 seconds

    if (waveNum >= WAVE_CONFIG.MAX_WAVES) {
      // Wave 5: Mothership Boss Wave!
      this.waveBannerText = `FINAL WAVE: ALIEN FLAGSHIP BOSS!`;
      this.spawnBoss();
      // Add escorts
      for (let i = 0; i < 3; i++) {
        this.spawnAlien('interceptor', 150 + i * 250, 120);
      }
      return;
    }

    const enemyCount =
      WAVE_CONFIG.BASE_ENEMIES_PER_WAVE +
      (waveNum - 1) * WAVE_CONFIG.ENEMY_INCREMENT_PER_WAVE;

    for (let i = 0; i < enemyCount; i++) {
      let type: AlienType = 'scout';
      if (waveNum >= 2 && i % 3 === 0) {
        type = 'interceptor';
      }
      if (waveNum >= 3 && i % 4 === 0) {
        type = 'heavy';
      }

      const x = 70 + Math.random() * (GAME_CANVAS.WIDTH - 140);
      const y = 50 + Math.random() * 180;
      this.spawnAlien(type, x, y);
    }
  }

  private spawnAlien(type: AlienType, x: number, y: number) {
    const stats = ENEMY_STATS[type];
    this.enemies.push({
      id: Math.random().toString(36).substring(2, 9),
      type,
      x,
      y,
      vx: (Math.random() - 0.5) * stats.speed * 2,
      vy: Math.random() * 0.8 + 0.4,
      radius: stats.radius,
      health: stats.health,
      maxHealth: stats.health,
      scoreValue: stats.scoreValue,
      color: stats.color,
      shootCooldown: Math.floor(Math.random() * stats.fireInterval),
      oscillationOffset: Math.random() * Math.PI * 2,
      physicsProperty: stats.physicsProperty,
    });
  }

  private spawnBoss() {
    const stats = ENEMY_STATS.boss;
    this.enemies.push({
      id: 'boss-mothership',
      type: 'boss',
      x: GAME_CANVAS.WIDTH / 2,
      y: 110,
      vx: 1.5,
      vy: 0,
      radius: stats.radius,
      health: stats.health,
      maxHealth: stats.health,
      scoreValue: stats.scoreValue,
      color: stats.color,
      shootCooldown: 40,
      oscillationOffset: 0,
      physicsProperty: stats.physicsProperty,
    });
  }

  // Player shoot action
  public shoot() {
    if (this.status !== 'playing') return;

    if (this.player.ammo <= 0) {
      // Trigger physics quiz to recharge plasma ammo!
      if (this.onTriggerQuiz) {
        this.status = 'quiz';
        this.onTriggerQuiz();
      }
      return;
    }

    this.player.ammo -= 1;
    sound.playLaser();

    // Calculate projectile velocity vector based on player aim angle
    const speed = BULLET_CONFIG.SPEED;
    const bulletVx = Math.cos(this.player.angle) * speed;
    const bulletVy = Math.sin(this.player.angle) * speed;

    this.bullets.push({
      id: Math.random().toString(36).substring(2, 9),
      x: this.player.x + Math.cos(this.player.angle) * (this.player.radius + 6),
      y: this.player.y + Math.sin(this.player.angle) * (this.player.radius + 6),
      vx: bulletVx,
      vy: bulletVy,
      radius: BULLET_CONFIG.RADIUS,
      damage: BULLET_CONFIG.DAMAGE,
      isPlayer: true,
      color: '#38bdf8', // Neon cyan plasma
      life: 90,
    });

    // Recoil physics (Newton's 3rd Law in action!)
    this.player.vx -= Math.cos(this.player.angle) * 0.8;
    this.player.vy -= Math.sin(this.player.angle) * 0.8;

    // Muzzle flash particles
    this.createMuzzleSparks(this.player.x, this.player.y, this.player.angle);
  }

  // Enemy shoot action
  private enemyShoot(enemy: Enemy) {
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;

    const speed = BULLET_CONFIG.ENEMY_BULLET_SPEED;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    this.bullets.push({
      id: Math.random().toString(36).substring(2, 9),
      x: enemy.x,
      y: enemy.y + enemy.radius,
      vx,
      vy,
      radius: 4,
      damage: BULLET_CONFIG.ENEMY_BULLET_DAMAGE,
      isPlayer: false,
      color: enemy.color,
      life: 140,
    });
  }

  // Main tick game update (runs 60 times/sec)
  public update() {
    if (this.status !== 'playing') return;

    this.updateParallaxStars();
    this.updatePlayerPhysics();
    this.updateEnemies();
    this.updateBullets();
    this.updateParticles();
    this.checkCollisions();
    this.checkWaveProgress();

    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer--;
    }
  }

  // Physics simulation for player movement
  private updatePlayerPhysics() {
    // 1. WASD Input Handling
    let ax = 0;
    let ay = 0;
    const speed = this.player.speed;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) ay -= speed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) ay += speed;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) ax -= speed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) ax += speed;

    // Apply acceleration
    this.player.vx += ax * 0.25;
    this.player.vy += ay * 0.25;

    // Cap velocity to MAX_SPEED
    const currentSpeed = Math.hypot(this.player.vx, this.player.vy);
    if (currentSpeed > PLAYER_CONFIG.MAX_SPEED) {
      this.player.vx = (this.player.vx / currentSpeed) * PLAYER_CONFIG.MAX_SPEED;
      this.player.vy = (this.player.vy / currentSpeed) * PLAYER_CONFIG.MAX_SPEED;
    }

    // Apply friction (damping)
    this.player.vx *= PLAYER_CONFIG.FRICTION;
    this.player.vy *= PLAYER_CONFIG.FRICTION;

    // Integrate position: x(t+1) = x(t) + v * dt
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Boundaries clamping
    const r = this.player.radius;
    if (this.player.x < r) {
      this.player.x = r;
      this.player.vx = 0;
    }
    if (this.player.x > GAME_CANVAS.WIDTH - r) {
      this.player.x = GAME_CANVAS.WIDTH - r;
      this.player.vx = 0;
    }
    if (this.player.y < r) {
      this.player.y = r;
      this.player.vy = 0;
    }
    if (this.player.y > GAME_CANVAS.HEIGHT - r) {
      this.player.y = GAME_CANVAS.HEIGHT - r;
      this.player.vy = 0;
    }

    // Aim toward mouse cursor
    const dx = this.mousePos.x - this.player.x;
    const dy = this.mousePos.y - this.player.y;
    this.player.angle = Math.atan2(dy, dx);

    // Thruster flame particles when moving
    if (Math.abs(ax) > 0 || Math.abs(ay) > 0) {
      const backAngle = this.player.angle + Math.PI;
      this.particles.push({
        x: this.player.x + Math.cos(backAngle) * r,
        y: this.player.y + Math.sin(backAngle) * r,
        vx: Math.cos(backAngle) * 2 + (Math.random() - 0.5),
        vy: Math.sin(backAngle) * 2 + (Math.random() - 0.5),
        radius: Math.random() * 3 + 2,
        color: '#f97316', // Orange thrust flame
        alpha: 0.9,
        decay: 0.05,
      });
    }

    // Invulnerability timer decay
    if (this.player.invulnerableTime > 0) {
      this.player.invulnerableTime--;
    }
  }

  // Update alien enemy flight paths & behaviors
  private updateEnemies() {
    for (const enemy of this.enemies) {
      if (enemy.type === 'boss') {
        // Boss moves horizontally and weaves slightly
        enemy.x += enemy.vx;
        if (enemy.x > GAME_CANVAS.WIDTH - 100 || enemy.x < 100) {
          enemy.vx *= -1;
        }
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0) {
          this.enemyShoot(enemy);
          enemy.shootCooldown = ENEMY_STATS.boss.fireInterval;
        }
      } else if (enemy.type === 'scout') {
        // Sine-wave oscillation motion
        enemy.oscillationOffset = (enemy.oscillationOffset || 0) + 0.06;
        enemy.x += Math.sin(enemy.oscillationOffset) * 2.5;
        enemy.y += enemy.vy;

        // Bounce on side borders
        if (enemy.x < enemy.radius) enemy.x = enemy.radius;
        if (enemy.x > GAME_CANVAS.WIDTH - enemy.radius) enemy.x = GAME_CANVAS.WIDTH - enemy.radius;
        if (enemy.y > GAME_CANVAS.HEIGHT - 100) enemy.vy = -Math.abs(enemy.vy);
        if (enemy.y < 30) enemy.vy = Math.abs(enemy.vy);
      } else if (enemy.type === 'interceptor') {
        // Follows and swoops toward player
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const dist = Math.hypot(dx, dy) || 1;
        enemy.x += (dx / dist) * 1.8;
        enemy.y += (dy / dist) * 1.5;
      } else if (enemy.type === 'heavy') {
        // Slow advance and periodic shooting
        enemy.x += enemy.vx * 0.8;
        enemy.y += enemy.vy * 0.5;
        if (enemy.x < 60 || enemy.x > GAME_CANVAS.WIDTH - 60) {
          enemy.vx *= -1;
        }
        if (enemy.y > 280 || enemy.y < 40) {
          enemy.vy *= -1;
        }
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0) {
          this.enemyShoot(enemy);
          enemy.shootCooldown = ENEMY_STATS.heavy.fireInterval;
        }
      }
    }
  }

  // Update projectile motions
  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      // Remove bullets out of bounds or dead
      if (
        b.life <= 0 ||
        b.x < -10 ||
        b.x > GAME_CANVAS.WIDTH + 10 ||
        b.y < -10 ||
        b.y > GAME_CANVAS.HEIGHT + 10
      ) {
        this.bullets.splice(i, 1);
      }
    }
  }

  // Update particles (explosions & smoke)
  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Update starfield parallax effect
  private updateParallaxStars() {
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > GAME_CANVAS.HEIGHT) {
        star.y = 0;
        star.x = Math.random() * GAME_CANVAS.WIDTH;
      }
    }
  }

  // Check collision mechanics
  private checkCollisions() {
    // 1. Player Bullets hitting Enemies
    for (let bIndex = this.bullets.length - 1; bIndex >= 0; bIndex--) {
      const bullet = this.bullets[bIndex];
      if (!bullet.isPlayer) continue;

      for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = this.enemies[eIndex];
        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

        if (dist < bullet.radius + enemy.radius) {
          // Collision detected!
          enemy.health -= bullet.damage;
          this.createHitSparks(bullet.x, bullet.y, enemy.color);
          this.bullets.splice(bIndex, 1);

          if (enemy.health <= 0) {
            // Enemy neutralized!
            sound.playExplosion(enemy.type === 'boss');
            this.createExplosion(enemy.x, enemy.y, enemy.color, enemy.radius);
            this.score += enemy.scoreValue;
            this.aliensDefeated += 1;
            this.enemies.splice(eIndex, 1);
          }
          break;
        }
      }
    }

    // 2. Enemy Bullets hitting Player
    for (let bIndex = this.bullets.length - 1; bIndex >= 0; bIndex--) {
      const bullet = this.bullets[bIndex];
      if (bullet.isPlayer) continue;

      const dist = Math.hypot(bullet.x - this.player.x, bullet.y - this.player.y);
      if (dist < bullet.radius + this.player.radius) {
        if (this.player.invulnerableTime <= 0) {
          this.damagePlayer(bullet.damage);
          this.createHitSparks(bullet.x, bullet.y, '#ef4444');
        }
        this.bullets.splice(bIndex, 1);
      }
    }

    // 3. Enemy Ship colliding directly with Player (Ramming)
    for (const enemy of this.enemies) {
      const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (dist < enemy.radius + this.player.radius) {
        if (this.player.invulnerableTime <= 0) {
          this.damagePlayer(25);
          // Elastic rebound impulse
          this.player.vx += (this.player.x - enemy.x) * 0.15;
          this.player.vy += (this.player.y - enemy.y) * 0.15;
          sound.playExplosion(false);
        }
      }
    }
  }

  // Inflict damage to player
  private damagePlayer(amount: number) {
    this.player.health = Math.max(0, this.player.health - amount);
    this.player.invulnerableTime = PLAYER_CONFIG.INVULNERABLE_DURATION;
    sound.playExplosion(false);

    if (this.player.health <= 0) {
      this.status = 'gameover';
      sound.playExplosion(true);
      if (this.onGameOver) {
        this.onGameOver(false);
      }
    }
  }

  // Wave advancement and Victory condition check
  private checkWaveProgress() {
    if (this.enemies.length === 0 && this.status === 'playing') {
      if (this.currentWave >= WAVE_CONFIG.MAX_WAVES) {
        // VICTORY ACHIEVED!
        this.status = 'victory';
        sound.playSuccess();
        if (this.onGameOver) {
          this.onGameOver(true);
        }
      } else {
        // Advance to next wave
        this.currentWave++;
        this.score += 500 * this.currentWave; // Wave completion bonus
        // Slight health repair on wave completion
        this.player.health = Math.min(
          this.player.maxHealth,
          this.player.health + 20
        );
        this.spawnWave(this.currentWave);
      }
    }
  }

  // Add reward after answering physics challenge correctly
  public rewardPhysicsSuccess(ammoAmount: number, scoreAmount: number, healthAmount: number) {
    this.player.ammo = Math.min(this.player.maxAmmo, this.player.ammo + ammoAmount);
    this.player.health = Math.min(this.player.maxHealth, this.player.health + healthAmount);
    this.score += scoreAmount;
    this.questionsAnswered += 1;
    sound.playPowerup();
  }

  // Visual particle generators
  private createExplosion(x: number, y: number, color: string, radius: number) {
    const count = Math.min(45, Math.floor(radius * 1.2));
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1,
        color: Math.random() > 0.4 ? color : '#facc15',
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02,
      });
    }
  }

  private createHitSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2,
        color,
        alpha: 0.9,
        decay: 0.08,
      });
    }
  }

  private createMuzzleSparks(x: number, y: number, angle: number) {
    for (let i = 0; i < 5; i++) {
      const spread = angle + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(spread) * speed,
        vy: Math.sin(spread) * speed,
        radius: 2,
        color: '#67e8f9',
        alpha: 0.8,
        decay: 0.1,
      });
    }
  }

  public getWaveBanner(): string | null {
    return this.waveBannerTimer > 0 ? this.waveBannerText : null;
  }
}
