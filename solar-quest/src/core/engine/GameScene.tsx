import { useEffect, useRef, useState } from "react";
import { X, Target, AlertTriangle } from "lucide-react";
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

interface Props {
  planetId?: string;
  config?: PlanetGameConfig;
  onComplete?: () => void;
  onGameOver?: () => void;
}
interface Asteroid {
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  vx?: number; // Horizontal velocity for gravity
  vy?: number; // Vertical velocity
  health?: number; // HP for multi-hit asteroids
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

export default function MarsGameScene({ planetId = "mars", config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [isSpecialEffect, setIsSpecialEffect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comboDisplay, setComboDisplay] = useState({ count: 0, multiplier: 1 });
  const [heatWarning, setHeatWarning] = useState(0); // 0-100
  const [effectWarning, setEffectWarning] = useState(false); // Warning before effect starts

  // Get planet config
  const planetConfig = config || getPlanetConfig(planetId);
  const graphicsConfig = getGraphicsConfig(planetId);

  // Game state refs
  const spaceshipX = useRef(0);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number | null>(null);
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
  const lastFrameTime = useRef(Date.now()); // For delta time calculation

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
      });
      asteroidsSpawned.current++;
    };

    // Shoot bullet
    const shoot = () => {
      if (gameOver || isPaused) return;

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
        y: canvas.height - 70,
        speed: planetConfig.bulletSpeed,
        vx: bulletVX,
        vy: bulletVY,
        curve: curve,
      });
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
      if (gameOver || isPaused) return;

      // Increment game time for consistent animations
      gameTime.current++;
      animationTime.current += 0.016; // ~60fps

      const cW = canvas.width;
      const cH = canvas.height;

      // Draw starfield background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, cW, cH);

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

      // Wave management
      waveTimer.current++;
      if (
        waveTimer.current % (planetConfig.asteroidSpawnRate / 16) === 0 &&
        asteroidsSpawned.current < planetConfig.maxAsteroids
      ) {
        spawnAsteroid();
      }

      // Check wave completion
      if (
        asteroidsSpawned.current >= planetConfig.maxAsteroids &&
        asteroidsRef.current.length === 0
      ) {
        setWave((w) => w + 1);
        asteroidsSpawned.current = 0;
        waveTimer.current = 0;
      }

      // Draw spaceship
      const shipW = 50 * planetConfig.shipScale;
      const shipH = 50 * planetConfig.shipScale;
      const shipX = spaceshipX.current;
      const shipY = cH - 70;

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
          )
        ) {
          createExplosion(ast.x + ast.size / 2, ast.y + ast.size / 2);
          asteroidsRef.current.splice(i, 1);
          setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) setGameOver(true);
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
              createExplosion(ast.x + ast.size / 2, ast.y + ast.size / 2);
              bulletsRef.current.splice(bi, 1);
              asteroidsRef.current.splice(ai, 1);

              // Calculate score with combo multiplier
              const now = Date.now();
              const deltaTime = (now - lastFrameTime.current) / 1000;
              const comboMultiplier = updateCombo(true, deltaTime);

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

      animationRef.current = requestAnimationFrame(animate);
    };

    // Input handlers
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const targetX = e.clientX - rect.left;

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
      } else {
        // Normal movement
        spaceshipX.current = targetX;
        shipVelocityX.current = 0;
      }

      // Clamp to canvas bounds
      spaceshipX.current = Math.max(
        20,
        Math.min(spaceshipX.current, canvas.width - 20)
      );
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
  }, [gameOver, isPaused, isSpecialEffect, wave, planetConfig, graphicsConfig]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute top-4 left-4 text-white space-y-2 z-10">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
          <div className="text-2xl font-bold">Điểm: {score}</div>
        </div>
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Mạng:</span>
            {Array.from({ length: lives }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-red-500 rounded-full" />
            ))}
          </div>
        </div>
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
          <div className="font-semibold">Wave: {wave}</div>
        </div>

        {/* Combo Display */}
        {comboDisplay.count > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-md px-4 py-2 rounded-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">
                  COMBO x{comboDisplay.multiplier}
                </div>
                <div className="text-xs">{comboDisplay.count} hits</div>
              </div>
            </div>
          </div>
        )}

        {/* Heat Warning (Mercury) */}
        {heatWarning > 0 && (
          <div className="bg-red-500/80 backdrop-blur-md px-4 py-2 rounded-lg border-2 border-red-300 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="text-xs font-bold">HEAT DAMAGE!</div>
                <div className="text-xs">Keep moving!</div>
              </div>
            </div>
            <div className="mt-1 w-full bg-black/40 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-red-600 h-2 rounded-full transition-all"
                style={{ width: `${heatWarning}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Planet Info */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-lg text-white max-w-xs z-10">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: planetConfig.particleColor }}
        >
          {planetConfig.displayName.toUpperCase()}
        </h3>
        <p className="text-sm mb-2">{planetConfig.description}</p>

        {/* Warning before effect starts */}
        {effectWarning && planetConfig.specialEffectType && (
          <div className="flex items-center gap-2 text-orange-400 text-sm animate-pulse border-2 border-orange-400 rounded px-2 py-1">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span className="font-bold">
              {planetConfig.specialEffectType === "dust_storm" &&
                "⚠️ BÃO CÁT SẮP ĐẾN!"}
              {planetConfig.specialEffectType === "acid_rain" &&
                "⚠️ MƯA AXIT SẮP ĐẾN!"}
              {planetConfig.specialEffectType === "heat_wave" &&
                "⚠️ SÓNG NHIỆT SẮP ĐẾN!"}
              {planetConfig.specialEffectType === "ice_storm" &&
                "⚠️ BÃO BĂNG SẮP ĐẾN!"}
              {planetConfig.specialEffectType === "gravity_well" &&
                "⚠️ LỰC HẤP DẪN SẮP XUẤT HIỆN!"}
              {planetConfig.specialEffectType === "ring_navigation" &&
                "⚠️ VÀNH ĐAI NGUY HIỂM SẮP ĐẾN!"}
            </span>
          </div>
        )}

        {/* Active effect notification */}
        {isSpecialEffect && planetConfig.specialEffectType && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-bold">
              {planetConfig.specialEffectType === "dust_storm" &&
                "BÃO CÁT ĐANG HOẠT ĐỘNG!"}
              {planetConfig.specialEffectType === "acid_rain" &&
                "MƯA AXIT NGUY HIỂM!"}
              {planetConfig.specialEffectType === "heat_wave" &&
                "SÓNG NHIỆT CỰC MẠNH!"}
              {planetConfig.specialEffectType === "ice_storm" &&
                "BÃO BĂNG ĐANG HOẠT ĐỘNG!"}
              {planetConfig.specialEffectType === "gravity_well" &&
                "LỰC HẤP DẪN BẤT THƯỜNG!"}
              {planetConfig.specialEffectType === "ring_navigation" &&
                "VÀNH ĐAI NGUY HIỂM!"}
            </span>
          </div>
        )}
        <div className="mt-2 text-xs text-gray-300">
          <div>Độ khó: {planetConfig.difficulty.toUpperCase()}</div>
          <div>Điểm/Thiên thạch: {planetConfig.pointsPerAsteroid}</div>
        </div>
      </div>

      {/* Controls Guide */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg text-white text-sm z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Di chuyển chuột để điều khiển</span>
          </div>
          <div>• Click hoặc Space để bắn</div>
          <div>• P để tạm dừng</div>
        </div>
      </div>

      {/* Center Warning - Subtle Flashing */}
      {effectWarning && planetConfig.specialEffectType && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div
            className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"
            style={{
              animation:
                "fadeInOut 1.5s ease-in-out infinite, gentleScale 1.5s ease-in-out infinite",
              textShadow:
                "0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)",
              filter: "drop-shadow(0 0 10px rgba(251, 146, 60, 0.6))",
            }}
          >
            ⚠️{" "}
            {planetConfig.specialEffectType === "dust_storm" &&
              "BÃO CÁT SẮP ĐẾN"}
            {planetConfig.specialEffectType === "acid_rain" &&
              "MƯA AXIT SẮP ĐẾN"}
            {planetConfig.specialEffectType === "heat_wave" &&
              "SÓNG NHIỆT SẮP ĐẾN"}
            {planetConfig.specialEffectType === "ice_storm" &&
              "BÃO BĂNG SẮP ĐẾN"}
            {planetConfig.specialEffectType === "gravity_well" &&
              "LỰC HẤP DẪN SẮP XUẤT HIỆN"}
            {planetConfig.specialEffectType === "ring_navigation" &&
              "VÀNH ĐAI NGUY HIỂM"}{" "}
            ⚠️
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">TẠM DỪNG</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
          <div className="bg-gray-900 p-8 rounded-xl text-center max-w-md">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-4">GAME OVER</h2>
            <div className="text-2xl text-white mb-2">Điểm cuối: {score}</div>
            <div className="text-lg text-gray-400 mb-6">
              Wave đạt được: {wave}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              Chơi lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
