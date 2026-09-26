import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAudio } from "@/hooks/useAudio";
import { X, Target, AlertTriangle, SkipForward, Zap, Shield, Crosshair, Gauge } from "lucide-react";
import {
  getPlanetConfig,
  type PlanetGameConfig,
} from "../game/PlanetGameConfigs";
import {
  getGraphicsConfig,
  drawSpaceship,
  drawAsteroid,
  drawBullet,
} from "../graphics/PlanetGraphics";
import VictorySequence from "@/features/victory/VictorySequence";
import { getAICompanion } from "@/data/aiCompanions";
import type { VictoryStats } from "@/types/victory";
import AudioSettings from "@/components/AudioSettings";
import {
  setMinigameCompleted,
  hasCompletedMinigame,
} from "@/services/profileStorage";
/**
 * PlanetMissionScene.tsx
 * A reusable, configurable asteroid-field mini-game scene.
 * - Pass a `planetId` or `config` to change visuals & gameplay per planet
 * - Calls onComplete() when player finishes the mission (e.g. all asteroids spawned)
 * - Minimal dependencies (React + Tailwind classes assumed in host app)
 *
 * Usage example:
 * <PlanetMissionScene
 *   planetId="mars"
 *   onComplete={() => setScene('planetdetail')}
 * />
 */

interface GameSceneProps {
  planetId?: string;
  config?: PlanetGameConfig;
  onComplete?: () => void;
  onGameOver?: () => void;
  onExit?: () => void;
}
interface Asteroid {
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  vx?: number;
  vy?: number;
  health: number;
  maxHealth: number;
}
interface Bullet {
  x: number;
  y: number;
  speed: number;
  vx?: number; // Horizontal velocity for deviation
  vy?: number; // Vertical velocity
  curve?: number; // Visual curve amount
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
}

export default function MarsGameScene({
  planetId = "mars",
  config: customConfig,
  onComplete,
  onExit,
}: GameSceneProps) {
  const { t } = useTranslation();
  const { play } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [isSpecialEffect, setIsSpecialEffect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [skipTriggered, setSkipTriggered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comboDisplay, setComboDisplay] = useState({ count: 0, multiplier: 1 });
  const [heatWarning, setHeatWarning] = useState(0); // 0-100
  const [effectWarning, setEffectWarning] = useState(false); // Warning before effect starts
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [destroyedCount, setDestroyedCount] = useState(0);
  const [dashCooldownDisplay, setDashCooldownDisplay] = useState(0);
  const [pulseCooldownDisplay, setPulseCooldownDisplay] = useState(0);
  const [shieldCharges, setShieldCharges] = useState(2);

  // Get planet config
  const planetConfig = customConfig || getPlanetConfig(planetId);
  const graphicsConfig = getGraphicsConfig(planetId);
  const aiCompanion = getAICompanion(planetId);

  // Check if player has completed this minigame before
  useEffect(() => {
    const hasCompleted = hasCompletedMinigame(planetId);
    setShowSkipButton(hasCompleted);
  }, [planetId]);

  // Victory stats tracking
  const totalShots = useRef(0);
  const hits = useRef(0);
  const maxComboReached = useRef(0);
  const startTime = useRef(Date.now());

  // Game state refs
  const spaceshipX = useRef(0);
  const spaceshipY = useRef(0); // NEW: Y position for free movement
  const asteroidsRef = useRef<Asteroid[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number | null>(null);
  const animateFnRef = useRef<(() => void) | null>(null);
  const dustStormTimer = useRef(0);
  const waveTimer = useRef(0);
  const asteroidsSpawned = useRef(0);
  const gameTime = useRef(0);
  const animationTime = useRef(0);

  // ==================== NEW: GAMEPLAY MODIFIER REFS ====================
  const lastShipX = useRef(0); // For heat damage detection
  const heatMeter = useRef(0); // Heat accumulation
  const shipVelocityX = useRef(0); // Ship velocity for ice physics
  const comboCount = useRef(0); // Combo counter
  const comboTimer = useRef(0); // Time remaining for combo
  const lastFrameTime = useRef(Date.now());
  const mouseTargetX = useRef(0);
  const mouseTargetY = useRef(0);
  const dashCooldown = useRef(0);
  const pulseCooldown = useRef(0);
  const dashTime = useRef(0);
  const invulnerabilityTime = useRef(0);
  const screenShake = useRef(0);
  const destroyedRef = useRef(0);
  const shieldChargesRef = useRef(2);
  const cooldownUiTimer = useRef(0);

  // No need to load images since we're drawing with code

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas
    const resize = () => {
      const oldWidth = canvas.width;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Only reset ship position if canvas width actually changed
      if (oldWidth !== canvas.width) {
        spaceshipX.current = canvas.width / 2;
        spaceshipY.current = canvas.height / 2; // NEW: Center Y position
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize starfield
    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < 100; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          brightness: Math.random(),
          twinkleSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    };
    initStars();

    // Spawn asteroid
    const spawnAsteroid = () => {
      if (asteroidsSpawned.current >= planetConfig.maxAsteroids) return;
      const size = planetConfig.asteroidSize + Math.random() * 20;
      asteroidsRef.current.push({
        x: Math.random() * (canvas.width - size),
        y: -size - Math.random() * 200,
        speed:
          planetConfig.asteroidSpeedMin +
          Math.random() *
            (planetConfig.asteroidSpeedMax - planetConfig.asteroidSpeedMin) +
          wave * 0.3,
        size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        health: planetConfig.asteroidHealth,
        maxHealth: planetConfig.asteroidHealth,
      });
      asteroidsSpawned.current++;
    };

    // Expose animate function to outer scope so we can restart it after Game Over

    const triggerDash = () => {
      if (gameOver || isPaused || victory || dashCooldown.current > 0) return;
      if (shieldChargesRef.current <= 0) return;

      const dx = mouseTargetX.current - spaceshipX.current;
      const dy = mouseTargetY.current - spaceshipY.current;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const dashDistance = Math.min(180, distance);

      spaceshipX.current += (dx / distance) * dashDistance;
      spaceshipY.current += (dy / distance) * dashDistance;
      spaceshipX.current = Math.max(30, Math.min(spaceshipX.current, canvas.width - 30));
      spaceshipY.current = Math.max(30, Math.min(spaceshipY.current, canvas.height - 30));

      dashTime.current = 0.28;
      invulnerabilityTime.current = 0.48;
      dashCooldown.current = 4;
      shieldChargesRef.current -= 1;
      setShieldCharges(shieldChargesRef.current);
      setDashCooldownDisplay(4);
      screenShake.current = 10;
      play("shield", { volume: 0.55, category: "sfx" });
    };

    const triggerPulse = () => {
      if (gameOver || isPaused || victory || pulseCooldown.current > 0) return;

      pulseCooldown.current = 10;
      setPulseCooldownDisplay(10);
      screenShake.current = 14;
      play("powerup", { volume: 0.6, category: "sfx" });

      const radius = 230;
      for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
        const ast = asteroidsRef.current[i];
        const dx = ast.x + ast.size / 2 - spaceshipX.current;
        const dy = ast.y + ast.size / 2 - spaceshipY.current;

        if (Math.hypot(dx, dy) <= radius) {
          createExplosion(ast.x + ast.size / 2, ast.y + ast.size / 2);
          asteroidsRef.current.splice(i, 1);
          hits.current++;
          destroyedRef.current++;
          setDestroyedCount(destroyedRef.current);

          const comboMultiplier = updateCombo(true, 0);
          setScore(
            (s) =>
              s +
              planetConfig.pointsPerAsteroid *
                planetConfig.bonusMultiplier *
                comboMultiplier
          );
        }
      }
    };

    // Shoot bullet
    const shoot = () => {
      if (gameOver || isPaused || victory) return;

      totalShots.current++; // Track total shots

      let bulletX = spaceshipX.current;
      let bulletVX = 0;
      let bulletVY = -planetConfig.bulletSpeed;
      let curve = 0;

      // Apply accuracy modifier (Mars dust storm)
      if (isSpecialEffect && planetConfig.accuracyModifier?.enabled) {
        const mod = planetConfig.accuracyModifier;
        const deviationX = (Math.random() - 0.5) * mod.deviationX * 2;
        const deviationY = (Math.random() - 0.5) * mod.deviationY * 2;

        bulletX += deviationX;
        bulletVX = deviationX * 0.1;
        bulletVY += deviationY * 0.05;
        curve = deviationX;
      }

      bulletsRef.current.push({
        x: bulletX,
        y: spaceshipY.current, // NEW: Shoot from current Y position
        speed: planetConfig.bulletSpeed,
        vx: bulletVX,
        vy: bulletVY,
        curve: curve,
      });

      // Play shoot sound
      play("shoot", { volume: 0.3, category: "sfx" });
    };

    // Create explosion particles
    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: Math.random() * 4 + 2,
          color: planetConfig.particleColor,
        });
      }
    };

    // Collision detection
    const checkCollision = (
      x1: number,
      y1: number,
      w1: number,
      h1: number,
      x2: number,
      y2: number,
      w2: number,
      h2: number
    ) => {
      return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    };

    // ==================== GAMEPLAY MODIFIER HELPER FUNCTIONS ====================

    // Apply gravity field to object
    const applyGravity = (
      obj: { x: number; y: number; vx?: number; vy?: number },
      speed: number
    ) => {
      const grav = planetConfig.gravityField;
      if (!grav?.enabled || !isSpecialEffect) return { vx: 0, vy: speed };

      const centerX = canvas.width * grav.centerX;
      const centerY = canvas.height * grav.centerY;

      const dx = centerX - obj.x;
      const dy = centerY - obj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10) return { vx: obj.vx || 0, vy: obj.vy || speed };

      const force = grav.strength / (distance * 0.01);
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      return {
        vx: (obj.vx || 0) + forceX,
        vy: (obj.vy || speed) + forceY,
      };
    };

    // Check bullet blocking (Saturn rings)
    const checkBulletBlocking = (bullet: { x: number; y: number }): boolean => {
      const config = planetConfig.particleCollision;
      if (!config?.enabled || !isSpecialEffect) return false;

      const blockZoneStart = canvas.height * config.blockZoneY[0];
      const blockZoneEnd = canvas.height * config.blockZoneY[1];

      if (bullet.y >= blockZoneStart && bullet.y <= blockZoneEnd) {
        return Math.random() < config.blockChance;
      }

      return false;
    };

    // Check heat damage (Mercury)
    const checkHeatDamage = (deltaTime: number): number => {
      const hazard = planetConfig.environmentHazard;
      if (!hazard || hazard.type !== "heat_damage" || !isSpecialEffect) {
        heatMeter.current = Math.max(0, heatMeter.current - deltaTime * 2);
        setHeatWarning(0);
        return 0;
      }

      const moved = Math.abs(spaceshipX.current - lastShipX.current);

      if (hazard.onlyWhenStationary && moved < hazard.threshold) {
        heatMeter.current += deltaTime;
        const warningPercent = Math.min((heatMeter.current / 3) * 100, 100);
        setHeatWarning(warningPercent);
        return hazard.damagePerSecond * deltaTime;
      } else {
        heatMeter.current = Math.max(0, heatMeter.current - deltaTime * 2);
        setHeatWarning((h) => Math.max(0, h - 10));
        return 0;
      }
    };

    // Update combo system
    const updateCombo = (hitRegistered: boolean, deltaTime: number): number => {
      const config = planetConfig.comboSystem;
      if (!config?.enabled) return 1;

      const previousCombo = comboCount.current;

      if (hitRegistered) {
        comboCount.current++;
        comboTimer.current = config.comboWindow;
      } else {
        comboTimer.current = Math.max(0, comboTimer.current - deltaTime);
        if (comboTimer.current <= 0 && comboCount.current > 0) {
          comboCount.current = 0;
        }
      }

      // Determine multiplier
      let multiplier = 1;
      for (let i = 0; i < config.comboThresholds.length; i++) {
        if (comboCount.current >= config.comboThresholds[i]) {
          multiplier = config.multipliers[i];
          // Play powerup sound when reaching new combo tier (only when combo just increased)
          if (
            hitRegistered &&
            previousCombo < config.comboThresholds[i] &&
            comboCount.current >= config.comboThresholds[i]
          ) {
            play("powerup", { volume: 0.4, category: "sfx" });
          }
        }
      }

      // Update UI
      setComboDisplay({ count: comboCount.current, multiplier });

      return multiplier;
    };

    // Draw special effects based on planet type with GAMEPLAY IMPACT
    const drawSpecialEffect = (
      ctx: CanvasRenderingContext2D,
      cW: number,
      cH: number,
      config: PlanetGameConfig
    ) => {
      if (!config.specialEffectType) return;

      switch (config.specialEffectType) {
        case "dust_storm": {
          // Mars: Swirling dust vortex - reduces visibility & bullet accuracy
          const dustGradient = ctx.createRadialGradient(
            cW / 2,
            cH / 2,
            0,
            cW / 2,
            cH / 2,
            cW / 2
          );
          dustGradient.addColorStop(0, "rgba(139, 69, 19, 0)");
          dustGradient.addColorStop(
            0.5,
            `rgba(139, 69, 19, ${config.fogOpacity * 0.6})`
          );
          dustGradient.addColorStop(
            1,
            `rgba(101, 67, 33, ${config.fogOpacity})`
          );
          ctx.fillStyle = dustGradient;
          ctx.fillRect(0, 0, cW, cH);

          // Swirling dust particles with trail
          for (let i = 0; i < 50; i++) {
            const angle =
              (dustStormTimer.current * 0.03 + i * 0.4) % (Math.PI * 2);
            const radius =
              100 + Math.sin(dustStormTimer.current * 0.02 + i) * 150;
            const x = cW / 2 + Math.cos(angle) * radius;
            const y = cH / 2 + Math.sin(angle) * radius;
            const size = 3 + Math.sin(dustStormTimer.current * 0.05 + i) * 2;

            ctx.fillStyle = `rgba(210, 105, 30, ${0.4 + Math.random() * 0.3})`;
            ctx.shadowColor = "rgba(210, 105, 30, 0.8)";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          break;
        }

        case "acid_rain": {
          // Venus: Corrosive acid rain - damages over time if hit
          const acidGradient = ctx.createLinearGradient(0, 0, 0, cH);
          acidGradient.addColorStop(
            0,
            `rgba(255, 100, 0, ${config.fogOpacity * 0.3})`
          );
          acidGradient.addColorStop(
            1,
            `rgba(200, 50, 0, ${config.fogOpacity * 0.6})`
          );
          ctx.fillStyle = acidGradient;
          ctx.fillRect(0, 0, cW, cH);

          // Falling acid drops with glow
          for (let i = 0; i < 60; i++) {
            const x =
              (i * 30 + Math.sin(dustStormTimer.current * 0.02 + i) * 20) % cW;
            const y = (dustStormTimer.current * 4 + i * 15) % (cH + 100);
            const length = 15 + Math.random() * 10;

            const dropGradient = ctx.createLinearGradient(x, y, x, y + length);
            dropGradient.addColorStop(0, "rgba(255, 150, 50, 0.8)");
            dropGradient.addColorStop(1, "rgba(255, 100, 0, 0.3)");

            ctx.fillStyle = dropGradient;
            ctx.fillRect(x, y, 2, length);

            // Splash effect when hitting bottom
            if (y > cH - 50) {
              ctx.fillStyle = "rgba(255, 150, 50, 0.4)";
              ctx.beginPath();
              ctx.arc(x, cH, 8, 0, Math.PI, true);
              ctx.fill();
            }
          }
          break;
        }

        case "heat_wave": {
          // Mercury: Intense heat waves - bullets slow down, vision distorted
          const heatGradient = ctx.createRadialGradient(
            cW / 2,
            0,
            0,
            cW / 2,
            cH,
            cH
          );
          heatGradient.addColorStop(0, "rgba(255, 200, 0, 0.1)");
          heatGradient.addColorStop(
            0.5,
            `rgba(255, 150, 0, ${config.fogOpacity * 0.4})`
          );
          heatGradient.addColorStop(1, "rgba(255, 100, 0, 0.2)");
          ctx.fillStyle = heatGradient;
          ctx.fillRect(0, 0, cW, cH);

          // Heat distortion waves
          ctx.strokeStyle = "rgba(255, 200, 50, 0.3)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const yBase =
              (i * cH) / 8 + ((dustStormTimer.current * 2) % (cH / 8));
            ctx.beginPath();
            for (let x = 0; x < cW; x += 10) {
              const y =
                yBase +
                Math.sin(x * 0.02 + dustStormTimer.current * 0.1 + i) * 15;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // Rising heat particles
          for (let i = 0; i < 30; i++) {
            const x =
              (i * 40 + Math.sin(dustStormTimer.current * 0.03 + i) * 20) % cW;
            const y = cH - ((dustStormTimer.current * 3 + i * 30) % cH);
            ctx.fillStyle = `rgba(255, 255, 100, ${0.2 + Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case "ice_storm": {
          // Uranus: Freezing ice storm - slows ship movement
          const iceGradient = ctx.createLinearGradient(0, 0, cW, cH);
          iceGradient.addColorStop(
            0,
            `rgba(150, 200, 255, ${config.fogOpacity * 0.3})`
          );
          iceGradient.addColorStop(
            0.5,
            `rgba(200, 220, 255, ${config.fogOpacity * 0.5})`
          );
          iceGradient.addColorStop(
            1,
            `rgba(180, 210, 255, ${config.fogOpacity * 0.4})`
          );
          ctx.fillStyle = iceGradient;
          ctx.fillRect(0, 0, cW, cH);

          // Spinning ice crystals
          for (let i = 0; i < 50; i++) {
            const x =
              (i * 35 + Math.sin(dustStormTimer.current * 0.04 + i) * 30) % cW;
            const y = (dustStormTimer.current * 2.5 + i * 20) % (cH + 50);
            const rotation = (dustStormTimer.current * 0.1 + i) % (Math.PI * 2);
            const size = 4 + Math.sin(dustStormTimer.current * 0.05 + i) * 2;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            // Crystal shape
            ctx.strokeStyle = `rgba(150, 220, 255, ${
              0.6 + Math.random() * 0.3
            })`;
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(150, 220, 255, 0.8)";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
              const angle = (j / 6) * Math.PI * 2;
              const px = Math.cos(angle) * size;
              const py = Math.sin(angle) * size;
              if (j === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
          ctx.shadowBlur = 0;
          break;
        }

        case "gravity_well": {
          // Jupiter/Neptune: Gravity distortion - asteroids move in curves
          const gravityGradient = ctx.createRadialGradient(
            cW / 2,
            cH / 2,
            0,
            cW / 2,
            cH / 2,
            cW / 2
          );
          gravityGradient.addColorStop(0, "rgba(100, 0, 150, 0.2)");
          gravityGradient.addColorStop(
            0.5,
            `rgba(80, 0, 120, ${config.fogOpacity * 0.4})`
          );
          gravityGradient.addColorStop(1, "rgba(50, 0, 80, 0.1)");
          ctx.fillStyle = gravityGradient;
          ctx.fillRect(0, 0, cW, cH);

          // Spiral gravity waves
          ctx.strokeStyle = "rgba(150, 50, 200, 0.3)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
              const adjustedAngle =
                angle + dustStormTimer.current * 0.02 + i * 0.5;
              const radius = 50 + angle * 15;
              const x = cW / 2 + Math.cos(adjustedAngle) * radius;
              const y = cH / 2 + Math.sin(adjustedAngle) * radius;
              if (angle === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // Orbiting gravity particles
          for (let i = 0; i < 40; i++) {
            const angle =
              (dustStormTimer.current * 0.03 + i * 0.3) % (Math.PI * 2);
            const radius = 100 + (i % 5) * 50;
            const x = cW / 2 + Math.cos(angle) * radius;
            const y = cH / 2 + Math.sin(angle) * radius;

            ctx.fillStyle = `rgba(180, 100, 255, ${0.4 + Math.random() * 0.3})`;
            ctx.shadowColor = "rgba(180, 100, 255, 0.8)";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          break;
        }

        case "ring_navigation": {
          // Saturn: Dense ring particles - blocks some bullets
          const ringGradient = ctx.createLinearGradient(
            0,
            cH / 2 - 50,
            0,
            cH / 2 + 50
          );
          ringGradient.addColorStop(0, "rgba(255, 215, 0, 0)");
          ringGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.15)");
          ringGradient.addColorStop(1, "rgba(255, 215, 0, 0)");
          ctx.fillStyle = ringGradient;
          ctx.fillRect(0, 0, cW, cH);

          // Dense flowing ring particles
          for (let layer = 0; layer < 3; layer++) {
            const yOffset = cH / 2 + (layer - 1) * 20;
            const speed = 1 + layer * 0.3;

            for (let i = 0; i < 80; i++) {
              const x = (dustStormTimer.current * speed + i * 15) % (cW + 20);
              const y =
                yOffset + Math.sin(dustStormTimer.current * 0.05 + i * 0.2) * 8;
              const size = 2 + Math.random() * 2;

              ctx.fillStyle = `rgba(255, 215, ${100 + Math.random() * 100}, ${
                0.5 + Math.random() * 0.4
              })`;
              ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(x, y, size, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.shadowBlur = 0;
          break;
        }
      }
    };

    // Draw radar (mini-map)
    const drawRadar = () => {
      if (!planetConfig.hasRadar || !isSpecialEffect) return;

      const radarX = canvas.width - 120;
      const radarY = 20;
      const radarSize = 100;

      // Radar background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(radarX, radarY, radarSize, radarSize);
      ctx.strokeStyle = planetConfig.particleColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(radarX, radarY, radarSize, radarSize);

      // Center line
      ctx.strokeStyle = planetConfig.particleColor;
      ctx.beginPath();
      ctx.moveTo(radarX + radarSize / 2, radarY);
      ctx.lineTo(radarX + radarSize / 2, radarY + radarSize);
      ctx.stroke();

      // Asteroids on radar
      asteroidsRef.current.forEach((ast) => {
        const radarAstX = radarX + (ast.x / canvas.width) * radarSize;
        const radarAstY = radarY + (ast.y / canvas.height) * radarSize;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(radarAstX - 2, radarAstY - 2, 4, 4);
      });

      // Player position
      const playerRadarX =
        radarX + (spaceshipX.current / canvas.width) * radarSize;
      ctx.fillStyle = planetConfig.particleColor;
      ctx.fillRect(playerRadarX - 3, radarY + radarSize - 5, 6, 6);
    };

    // Game loop
    const animate = () => {
      if (gameOver || isPaused || victory) return;

      // Increment game time for consistent animations
      gameTime.current++;
      animationTime.current += 0.016; // ~60fps

      const cW = canvas.width;
      const cH = canvas.height;

      const frameDelta = 1 / 60;
      dashCooldown.current = Math.max(0, dashCooldown.current - frameDelta);
      pulseCooldown.current = Math.max(0, pulseCooldown.current - frameDelta);
      dashTime.current = Math.max(0, dashTime.current - frameDelta);
      invulnerabilityTime.current = Math.max(0, invulnerabilityTime.current - frameDelta);

      cooldownUiTimer.current += frameDelta;
      if (cooldownUiTimer.current >= 0.15) {
        cooldownUiTimer.current = 0;
        setDashCooldownDisplay(Number(dashCooldown.current.toFixed(1)));
        setPulseCooldownDisplay(Number(pulseCooldown.current.toFixed(1)));
      }

      if (screenShake.current > 0) {
        screenShake.current = Math.max(0, screenShake.current - 0.8);
      }

      // Draw starfield background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, cW, cH);

      ctx.save();
      if (screenShake.current > 0) {
        const shake = screenShake.current;
        ctx.translate(
          (Math.random() - 0.5) * shake,
          (Math.random() - 0.5) * shake
        );
      }

      starsRef.current.forEach((star) => {
        star.brightness += star.twinkleSpeed;
        const alpha = ((Math.sin(star.brightness) + 1) / 2) * 0.8 + 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Planet background gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, cH);
      const colors = planetConfig.background.match(/#[0-9a-fA-F]{6}/g) || [
        planetConfig.backgroundColor,
      ];
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.3; // Make gradient semi-transparent
      ctx.fillRect(0, 0, cW, cH);
      ctx.globalAlpha = 1;

      // Special effect management
      if (planetConfig.hasSpecialEffect) {
        dustStormTimer.current++;

        // Warning phase: 180 frames (3 seconds) before effect starts
        if (
          dustStormTimer.current > 300 &&
          dustStormTimer.current <= 480 &&
          !isSpecialEffect
        ) {
          setEffectWarning(true);
          if (dustStormTimer.current === 301) {
            play("warning", { volume: 0.5, category: "sfx" });
          }
        } else if (dustStormTimer.current > 480 && !isSpecialEffect) {
          setIsSpecialEffect(true);
          setEffectWarning(false);
          dustStormTimer.current = 0;
        }

        // Effect active for 240 frames (4 seconds)
        if (dustStormTimer.current > 240 && isSpecialEffect) {
          setIsSpecialEffect(false);
          setEffectWarning(false);
          dustStormTimer.current = 0;
        }

        // Draw special effect based on planet type
        if (isSpecialEffect) {
          drawSpecialEffect(ctx, cW, cH, planetConfig);
        }
      }

      // Wave management - Spawn asteroids nhanh hơn
      waveTimer.current++;
      if (
        waveTimer.current %
          Math.max(1, Math.floor(planetConfig.asteroidSpawnRate / 10)) ===
          0 &&
        asteroidsSpawned.current < planetConfig.maxAsteroids
      ) {
        spawnAsteroid();
      }

      // Check wave completion
      if (
        asteroidsSpawned.current >= planetConfig.maxAsteroids &&
        asteroidsRef.current.length === 0 &&
        !victory
      ) {
        // Victory condition: completed all asteroids
        play("success", { volume: 0.7, category: "achievement" });
        setVictory(true);
      }

      // Draw spaceship - NOW FOLLOWS MOUSE EVERYWHERE
      const shipW = 50 * planetConfig.shipScale;
      const shipH = 50 * planetConfig.shipScale;
      const shipX = spaceshipX.current;
      const shipY = spaceshipY.current; // NEW: Use dynamic Y position

      // Draw custom spaceship based on planet
      drawSpaceship(
        ctx,
        shipX,
        shipY,
        shipW,
        shipH,
        0,
        graphicsConfig,
        planetConfig,
        animationTime.current
      );

      // Update and draw asteroids
      asteroidsRef.current.forEach((ast, i) => {
        // Apply gravity field (Jupiter/Neptune)
        if (planetConfig.gravityField?.affectAsteroids) {
          const gravResult = applyGravity(ast, ast.speed);
          ast.vx = gravResult.vx;
          ast.vy = gravResult.vy;
          ast.x += ast.vx;
          ast.y += ast.vy;
        } else {
          ast.y += ast.speed;
        }

        ast.rotation += ast.rotationSpeed;

        // Off screen - just remove asteroid without penalty
        if (ast.y > cH + 100) {
          asteroidsRef.current.splice(i, 1);
        } else if (
          checkCollision(
            shipX,
            shipY,
            shipW,
            shipH,
            ast.x,
            ast.y,
            ast.size,
            ast.size
          ) &&
          invulnerabilityTime.current <= 0
        ) {
          createExplosion(ast.x + ast.size / 2, ast.y + ast.size / 2);
          asteroidsRef.current.splice(i, 1);
          screenShake.current = 16;
          play("hit", { volume: 0.4, category: "sfx" });
          setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) {
              play("explosion", { volume: 0.6, category: "sfx" });
              setGameOver(true);
            }
            return newLives;
          });
        } else {
          // Draw custom asteroid based on planet
          ctx.save();
          ctx.globalAlpha =
            planetConfig.visibility * (isSpecialEffect ? 0.6 : 1);
          drawAsteroid(
            ctx,
            ast.x,
            ast.y,
            ast.size,
            ast.rotation,
            graphicsConfig,
            planetConfig
          );

          if (ast.maxHealth > 1 && ast.health < ast.maxHealth) {
            const barWidth = ast.size * 0.8;
            const barX = ast.x + (ast.size - barWidth) / 2;
            const barY = ast.y - 9;
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillRect(barX, barY, barWidth, 4);
            ctx.fillStyle = planetConfig.particleColor;
            ctx.fillRect(
              barX,
              barY,
              barWidth * Math.max(0, ast.health / ast.maxHealth),
              4
            );
          }
          ctx.restore();
        }
      });

      // Update and draw bullets
      bulletsRef.current.forEach((b, bi) => {
        // Apply gravity field (Jupiter/Neptune)
        if (planetConfig.gravityField?.affectBullets) {
          const gravResult = applyGravity(b, b.speed);
          b.vx = gravResult.vx;
          b.vy = gravResult.vy;
          b.x += b.vx;
          b.y -= Math.abs(b.vy); // Still going up
        } else if (b.vx !== undefined && b.vy !== undefined) {
          // Accuracy modifier deviation
          b.x += b.vx;
          b.y += b.vy;
        } else {
          b.y -= b.speed;
        }

        // Check bullet blocking (Saturn rings)
        const isBlocked = checkBulletBlocking(b);
        if (isBlocked) {
          createExplosion(b.x, b.y); // Small spark effect
          bulletsRef.current.splice(bi, 1);
          return;
        }

        if (b.y < -50) {
          bulletsRef.current.splice(bi, 1);
        } else {
          let hit = false;
          asteroidsRef.current.forEach((ast, ai) => {
            if (
              checkCollision(
                b.x - 5,
                b.y,
                10,
                20,
                ast.x,
                ast.y,
                ast.size,
                ast.size
              )
            ) {
              bulletsRef.current.splice(bi, 1);

              ast.health -= planetConfig.bulletDamage;
              createExplosion(ast.x + ast.size / 2, ast.y + ast.size / 2);
              play("hit", { volume: 0.35, category: "sfx" });

              if (ast.health <= 0) {
                asteroidsRef.current.splice(ai, 1);
                play("explosion", { volume: 0.3, category: "sfx" });
                destroyedRef.current++;
                setDestroyedCount(destroyedRef.current);
              }

              // Calculate score with combo multiplier
              const now = Date.now();
              const deltaTime = (now - lastFrameTime.current) / 1000;
              const comboMultiplier = updateCombo(true, deltaTime);

              // Track hits and max combo
              hits.current++;
              if (comboDisplay.count > maxComboReached.current) {
                maxComboReached.current = comboDisplay.count;
              }

              setScore(
                (s) =>
                  s +
                  planetConfig.pointsPerAsteroid *
                    planetConfig.bonusMultiplier *
                    comboMultiplier
              );
              hit = true;
            }
          });

          if (!hit) {
            // Draw custom bullet based on planet
            drawBullet(ctx, b.x, b.y, 16, 32, graphicsConfig);
          }
        }
      });

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.restore();
        }
      });

      // Dash trail
      if (dashTime.current > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, dashTime.current * 3);
        ctx.strokeStyle = planetConfig.particleColor;
        ctx.lineWidth = 4;
        for (let i = 1; i <= 5; i++) {
          ctx.globalAlpha = (1 - i / 6) * 0.35;
          ctx.beginPath();
          ctx.moveTo(
            spaceshipX.current -
              (mouseTargetX.current - spaceshipX.current) * (i * 0.06),
            spaceshipY.current -
              (mouseTargetY.current - spaceshipY.current) * (i * 0.06)
          );
          ctx.lineTo(spaceshipX.current, spaceshipY.current);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw radar
      drawRadar();

      // ==================== UPDATE GAMEPLAY MODIFIERS ====================
      const now = Date.now();
      const deltaTime = (now - lastFrameTime.current) / 1000;
      lastFrameTime.current = now;

      // Heat damage system (Mercury)
      const heatDamage = checkHeatDamage(deltaTime);
      if (heatDamage > 0) {
        setLives((l) => {
          const newLives = Math.max(0, l - heatDamage);
          if (newLives <= 0) setGameOver(true);
          return newLives;
        });
      }

      // Update combo timer
      updateCombo(false, deltaTime);

      // Store last ship position for next frame
      lastShipX.current = spaceshipX.current;

      ctx.restore();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Save animate to ref so other handlers (eg. resetGame) can restart the loop
    animateFnRef.current = animate;

    // Input handlers - FREE MOVEMENT
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const targetX = e.clientX - rect.left;
      const targetY = e.clientY - rect.top;
      mouseTargetX.current = targetX;
      mouseTargetY.current = targetY;

      // Apply movement modifier (ice physics on Uranus)
      const mod = planetConfig.movementModifier;
      if (mod?.enabled && isSpecialEffect) {
        // Ice physics - sliding effect
        const direction =
          targetX > spaceshipX.current
            ? 1
            : targetX < spaceshipX.current
            ? -1
            : 0;
        const baseAccel = 0.5;

        if (direction !== 0) {
          shipVelocityX.current +=
            direction * baseAccel * mod.accelerationMultiplier;
        } else {
          shipVelocityX.current *= mod.decelerationMultiplier; // Slide!
        }

        const maxSpeed = planetConfig.shipSpeed * mod.maxSpeedMultiplier;
        shipVelocityX.current = Math.max(
          -maxSpeed,
          Math.min(shipVelocityX.current, maxSpeed)
        );

        spaceshipX.current += shipVelocityX.current;
        spaceshipY.current = targetY; // NEW: Y follows mouse directly
      } else {
        // Normal movement - follow mouse exactly
        spaceshipX.current = targetX;
        spaceshipY.current = targetY; // NEW: Y follows mouse
        shipVelocityX.current = 0;
      }

      // Clamp to canvas bounds
      spaceshipX.current = Math.max(
        20,
        Math.min(spaceshipX.current, canvas.width - 20)
      );
      spaceshipY.current = Math.max(
        20,
        Math.min(spaceshipY.current, canvas.height - 20)
      ); // NEW: Clamp Y position
    };

    const onClick = () => shoot();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        shoot();
      }
      if (e.code === "KeyP") {
        setIsPaused((p) => !p);
      }
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        e.preventDefault();
        triggerDash();
      }
      if (e.code === "KeyE") {
        e.preventDefault();
        triggerPulse();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    gameOver,
    isPaused,
    isSpecialEffect,
    wave,
    planetConfig,
    graphicsConfig,
    victory,
    comboDisplay.count,
  ]);

  // Victory stats
  const victoryStats: VictoryStats = {
    score,
    maxCombo: maxComboReached.current,
    accuracy:
      totalShots.current > 0 ? (hits.current / totalShots.current) * 100 : 0,
    damagesTaken: 3 - lives,
    timeElapsed: (Date.now() - startTime.current) / 1000,
  };

  // Reset and restart the minigame without leaving the current planet screen
  const resetGame = () => {
    // cancel any running animation
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // clear world
    asteroidsRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    starsRef.current = [];

    // reset trackers
    asteroidsSpawned.current = 0;
    gameTime.current = 0;
    animationTime.current = 0;
    startTime.current = Date.now();
    lastFrameTime.current = Date.now();
    comboCount.current = 0;
    comboTimer.current = 0;
    maxComboReached.current = 0;
    totalShots.current = 0;
    hits.current = 0;

    // reset UI state
    setScore(0);
    setLives(3);
    setWave(1);
    setHeatWarning(0);
    setEffectWarning(false);
    setComboDisplay({ count: 0, multiplier: 1 });
    setGameOver(false);
    setVictory(false);
    setIsPaused(false);
    setSkipTriggered(false);
    destroyedRef.current = 0;
    shieldChargesRef.current = 2;
    dashCooldown.current = 0;
    pulseCooldown.current = 0;
    dashTime.current = 0;
    invulnerabilityTime.current = 0;
    screenShake.current = 0;
    setDestroyedCount(0);
    setShieldCharges(2);
    setDashCooldownDisplay(0);
    setPulseCooldownDisplay(0);

    // reinit simple starfield to avoid blank background
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 100; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          brightness: Math.random(),
          twinkleSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    }

    // restart animation loop
    if (animateFnRef.current) {
      lastFrameTime.current = Date.now();
      animationRef.current = requestAnimationFrame(animateFnRef.current);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black cursor-none">
      {/* Victory Sequence */}
      {victory && (
        <VictorySequence
          planetId={planetId}
          planetName={planetConfig.displayName}
          planetColor={planetConfig.particleColor}
          stats={victoryStats}
          ai={aiCompanion}
          suppressAutoComplete={skipTriggered}
          onComplete={() => {
            // Save minigame completion status
            setMinigameCompleted(planetId);
            setSkipTriggered(false);
            if (onComplete) onComplete();
          }}
        />
      )}

      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Premium combat HUD */}
      <div className="absolute left-5 top-5 z-10 flex flex-col gap-2 text-white">
        <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/30">
                Score
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight">{score.toLocaleString()}</p>
            </div>
            <div className="mb-0.5 h-7 w-px bg-white/10" />
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/30">
                Mission
              </p>
              <p className="mt-1 text-xs font-semibold text-white/70">
                {destroyedCount}/{planetConfig.maxAsteroids} cleared
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/7">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: (Math.min(100, (destroyedCount / planetConfig.maxAsteroids) * 100) + "%"),
                background: "linear-gradient(90deg, " + planetConfig.particleColor + ", #67e8f9)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 backdrop-blur-2xl">
          <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Hull
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={
                  "h-2.5 w-7 rounded-full " +
                  (i < Math.ceil(lives)
                    ? "bg-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.35)]"
                    : "bg-white/8")
                }
              />
            ))}
          </div>
          <span className="ml-auto text-[10px] font-mono text-white/55">{Math.ceil(lives)}/3</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-cyan-200/75" />
              <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/35">Dash</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white/75">
              {dashCooldownDisplay > 0 ? dashCooldownDisplay.toFixed(1) + "s" : "READY"}
            </p>
            <p className="mt-1 text-[8px] text-cyan-100/35">{shieldCharges} charges</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-200/75" />
              <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/35">Pulse</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white/75">
              {pulseCooldownDisplay > 0 ? pulseCooldownDisplay.toFixed(1) + "s" : "READY"}
            </p>
            <p className="mt-1 text-[8px] text-amber-100/35">AOE 230px</p>
          </div>
        </div>

        {comboDisplay.count > 0 && (
          <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.07] px-4 py-3 backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-amber-100/80" />
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-100/45">Combo</p>
                <p className="mt-0.5 text-sm font-bold text-amber-50">
                  x{comboDisplay.multiplier} · {comboDisplay.count} hits
                </p>
              </div>
            </div>
          </div>
        )}

        {heatWarning > 0 && (
          <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] px-4 py-3 backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-rose-200" />
              <div className="flex-1">
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-rose-100/55">{t("game.heatDamage")}</p>
                <p className="mt-1 text-[10px] text-white/55">{t("game.keepMoving")}</p>
              </div>
              <span className="text-[10px] font-mono text-rose-100/80">{Math.round(heatWarning)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
                style={{ width: heatWarning + "%" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Planet Info */}
      <div className="absolute right-5 top-5 z-10 hidden max-w-xs rounded-2xl border border-white/10 bg-black/30 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:block">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: planetConfig.particleColor }}
        >
          {t(`planets.${planetId}.name`).toUpperCase()}
        </h3>
        <p className="text-sm mb-2">{t(`planets.${planetId}.description`)}</p>

        {/* Warning before effect starts */}
        {/* {effectWarning && planetConfig.specialEffectType && (
          <div className="flex items-center gap-2 text-sm animate-pulse border-2 rounded px-2 py-1">
            <AlertTriangle className="w-4 h-4 text-2xl font-bold mb-2 animate-pulse" />

            <span className="font-bold">
              {planetConfig.specialEffectType === "dust_storm" &&
                "⚠️ BÃO CÁT SẮP ĐẾN! ⚠️"}
              {planetConfig.specialEffectType === "acid_rain" &&
                "⚠️ MƯA AXIT SẮP ĐẾN! ⚠️"}
              {planetConfig.specialEffectType === "heat_wave" &&
                "⚠️ SÓNG NHIỆT SẮP ĐẾN! ⚠️"}
              {planetConfig.specialEffectType === "ice_storm" &&
                "⚠️ BÃO BĂNG SẮP ĐẾN! ⚠️"}
              {planetConfig.specialEffectType === "gravity_well" &&
                "⚠️ LỰC HẤP DẪN SẮP XUẤT HIỆN! ⚠️"}
              {planetConfig.specialEffectType === "ring_navigation" &&
                "⚠️ VÀNH ĐAI NGUY HIỂM SẮP ĐẾN! ⚠️"}
            </span>
          </div>
        )} */}

        {/* Active effect notification */}
        {isSpecialEffect && planetConfig.specialEffectType && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-bold">
              {planetConfig.specialEffectType === "dust_storm" &&
                t("game.activeEffects.dustStorm")}
              {planetConfig.specialEffectType === "acid_rain" &&
                t("game.activeEffects.acidRain")}
              {planetConfig.specialEffectType === "heat_wave" &&
                t("game.activeEffects.heatWave")}
              {planetConfig.specialEffectType === "ice_storm" &&
                t("game.activeEffects.iceStorm")}
              {planetConfig.specialEffectType === "gravity_well" &&
                t("game.activeEffects.gravityWell")}
              {planetConfig.specialEffectType === "ring_navigation" &&
                t("game.activeEffects.ringNavigation")}
            </span>
          </div>
        )}
        {/* <div className="mt-2 text-xs text-gray-300">
          <div>Độ khó: {planetConfig.difficulty.toUpperCase()}</div>
          <div>Điểm/Thiên thạch: {planetConfig.pointsPerAsteroid}</div>
        </div> */}
      </div>

      {/* Combat controls */}
      <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 md:block">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-2.5 text-white/60 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex items-center gap-2">
            <kbd className="rounded-md border border-white/12 bg-white/[0.05] px-2 py-1 text-[9px] font-mono text-white/70">LMB</kbd>
            <span className="text-[9px] uppercase tracking-[0.12em]">Fire</span>
          </div>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <kbd className="rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-2 py-1 text-[9px] font-mono text-cyan-100/75">SHIFT</kbd>
            <span className="text-[9px] uppercase tracking-[0.12em]">Dash</span>
          </div>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <kbd className="rounded-md border border-amber-200/15 bg-amber-200/[0.06] px-2 py-1 text-[9px] font-mono text-amber-100/75">E</kbd>
            <span className="text-[9px] uppercase tracking-[0.12em]">Pulse</span>
          </div>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <kbd className="rounded-md border border-white/12 bg-white/[0.05] px-2 py-1 text-[9px] font-mono text-white/70">P</kbd>
            <span className="text-[9px] uppercase tracking-[0.12em]">Pause</span>
          </div>
        </div>
      </div>

      {/* Skip Button - Only show if player has completed before */}
      {showSkipButton && !gameOver && !victory && (
        <button
          onClick={() => {
            // Instead of immediately navigating away, trigger the victory sequence
            // so the player still sees the celebration and the AI/Quiz flow.
            setSkipTriggered(true);
            setVictory(true);
          }}
          className="absolute bottom-4 right-4 z-50 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 
            text-white font-bold rounded-lg shadow-2xl transition-all duration-300 
            flex items-center gap-2 animate-pulse hover:animate-none hover:scale-105"
          title={t("game.skipTooltip")}
        >
          <SkipForward className="w-5 h-5" />
          <span>{t("game.skipButton")}</span>
        </button>
      )}

      {/* Center Warning - Subtle Flashing */}
      {effectWarning && planetConfig.specialEffectType && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          {/* <div
            className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"
            style={{
              animation:
                "fadeInOut 1.5s ease-in-out infinite, gentleScale 1.5s ease-in-out infinite",
              textShadow:
                "0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)",
              filter: "drop-shadow(0 0 10px rgba(251, 146, 60, 0.6))",
            }}
          > */}
          <div className="flex items-center gap-2 text-2xl animate-pulse border-2 rounded px-2 py-1 text-white">
            ⚠️{" "}
            {planetConfig.specialEffectType === "dust_storm" &&
              t("game.specialEffects.dustStorm")}
            {planetConfig.specialEffectType === "acid_rain" &&
              t("game.specialEffects.acidRain")}
            {planetConfig.specialEffectType === "heat_wave" &&
              t("game.specialEffects.heatWave")}
            {planetConfig.specialEffectType === "ice_storm" &&
              t("game.specialEffects.iceStorm")}
            {planetConfig.specialEffectType === "gravity_well" &&
              t("game.specialEffects.gravityWell")}
            {planetConfig.specialEffectType === "ring_navigation" &&
              t("game.specialEffects.ringNavigation")}{" "}
            ⚠️
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t("game.pause.title")}
            </h2>
            <button
              onClick={() => setIsPaused(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              {t("game.pause.resume")}
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
          <div className="bg-gray-900 p-8 rounded-xl text-center max-w-md">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-4">
              {t("game.gameOver.title")}
            </h2>
            <div className="text-2xl text-white mb-2">
              {t("game.gameOver.finalScore")}
              {score}
            </div>
            {/* <div className="text-lg text-gray-400 mb-6">
              {t("game.gameOver.waveReached")}
              {wave}
            </div> */}
            <button
              onClick={resetGame}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              {t("game.gameOver.restart")}
            </button>
          </div>
        </div>
      )}

      {/* Audio Settings */}
      {!victory && <AudioSettings />}
    </div>
  );
}
