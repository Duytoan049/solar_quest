import React, { useEffect, useRef, useState } from "react";

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

type PlanetConfig = {
  id: string;
  displayName: string;
  background?: string; // css background or color
  asteroidSpawnRate: number; // ms
  maxAsteroids: number;
  asteroidSpeedMin: number;
  asteroidSpeedMax: number;
  asteroidSize?: number;
  shipScale?: number;
  starfieldOptions?: { density?: number; speed?: number };
  musicKey?: string;
};

const DEFAULT_CONFIGS: Record<string, PlanetConfig> = {
  earth: {
    id: "earth",
    displayName: "Trái Đất",
    background: "linear-gradient(#001f3f, #004080)",
    asteroidSpawnRate: 900,
    maxAsteroids: 20,
    asteroidSpeedMin: 1.5,
    asteroidSpeedMax: 3.5,
    asteroidSize: 48,
    shipScale: 1,
  },
  mars: {
    id: "mars",
    displayName: "Sao Hỏa",
    background: "linear-gradient(#3a0b0b, #7a1f1f)",
    asteroidSpawnRate: 800,
    maxAsteroids: 18,
    asteroidSpeedMin: 1.0,
    asteroidSpeedMax: 3.0,
    asteroidSize: 54,
    shipScale: 1.05,
  },
  jupiter: {
    id: "jupiter",
    displayName: "Sao Mộc",
    background: "linear-gradient(#3b1f00, #6b3a00)",
    asteroidSpawnRate: 700,
    maxAsteroids: 30,
    asteroidSpeedMin: 2.0,
    asteroidSpeedMax: 5.0,
    asteroidSize: 64,
    shipScale: 1.2,
  },
};

interface Props {
  planetId?: string;
  config?: PlanetConfig;
  onComplete?: () => void;
  onGameOver?: () => void;
}

interface Asteroid {
  x: number;
  y: number;
  speed: number;
  size: number;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

export default function PlanetMissionScene({
  planetId = "earth",
  config,
  onComplete,
  onGameOver,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const cfg = config ?? DEFAULT_CONFIGS[planetId] ?? DEFAULT_CONFIGS.earth;

  // images
  const shipImg = useRef<HTMLImageElement | null>(null);
  const asteroidImg = useRef<HTMLImageElement | null>(null);
  const bulletImg = useRef<HTMLImageElement | null>(null);
  const shipLoaded = useRef(false);
  const asteroidLoaded = useRef(false);
  const bulletLoaded = useRef(false);

  // mutable refs for performance
  const spaceshipOffset = useRef(0);
  const asteroidCountRef = useRef(0);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const explosionsRef = useRef<
    { x: number; y: number; r: number; alpha: number }[]
  >([]);
  const animationRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- image loading ---
    shipImg.current = new Image();
    shipImg.current.src = "/src/assets/models/yellow_spaceship.png";
    shipImg.current.onload = () => (shipLoaded.current = true);
    shipImg.current.onerror = () => console.warn("ship image failed to load");

    asteroidImg.current = new Image();
    asteroidImg.current.src = "/src/assets/models/asteroid1.jpg";
    asteroidImg.current.onload = () => (asteroidLoaded.current = true);
    asteroidImg.current.onerror = () =>
      console.warn("asteroid image failed to load");

    bulletImg.current = new Image();
    bulletImg.current.src = "/src/assets/models/bullet_spaceship.png";
    bulletImg.current.onload = () => (bulletLoaded.current = true);

    // --- helpers ---
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const rand = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const spawnAsteroid = () => {
      if (asteroidCountRef.current >= cfg.maxAsteroids) return;
      const size = cfg.asteroidSize ?? 50;
      asteroidsRef.current.push({
        x: Math.random() * (canvas.width - size),
        y: -size - Math.random() * 200,
        speed: rand(cfg.asteroidSpeedMin, cfg.asteroidSpeedMax),
        size,
      });
      asteroidCountRef.current += 1;
      if (asteroidCountRef.current >= cfg.maxAsteroids) {
        // stop future spawns and mark transitioning after a short delay
        if (spawnIntervalRef.current) {
          window.clearInterval(spawnIntervalRef.current);
          spawnIntervalRef.current = null;
        }
        // small timeout so final asteroids still fall and can be shot
        setTimeout(() => setTransitioning(true), 600);
      }
    };

    const shoot = () => {
      bulletsRef.current.push({
        x: canvas.width / 2 + spaceshipOffset.current,
        y: canvas.height - 60,
        speed: 6,
      });
    };

    const rectCollision = (
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

    // --- main animate ---
    const animate = () => {
      const cW = canvas.width;
      const cH = canvas.height;
      ctx.clearRect(0, 0, cW, cH);

      // background
      if (cfg.background) {
        ctx.fillStyle = cfg.background;
        ctx.fillRect(0, 0, cW, cH);
      }

      // spaceship
      const shipW = 50 * (cfg.shipScale ?? 1);
      const shipH = 50 * (cfg.shipScale ?? 1);
      const shipX = cW / 2 - shipW / 2 + spaceshipOffset.current;
      let shipY = cH - 60;
      if (transitioning) shipY -= 4;

      if (shipLoaded.current && shipImg.current)
        ctx.drawImage(shipImg.current, shipX, shipY, shipW, shipH);

      // asteroids
      asteroidsRef.current.forEach((a, i) => {
        a.y += a.speed;
        if (a.y > cH + 100) {
          asteroidsRef.current.splice(i, 1);
          setScore((s) => Math.max(0, s - 10));
        } else if (asteroidLoaded.current && asteroidImg.current) {
          ctx.drawImage(asteroidImg.current, a.x, a.y, a.size, a.size);
        }
      });

      // bullets
      bulletsRef.current.forEach((b, bi) => {
        b.y -= b.speed;
        if (b.y < -50) {
          bulletsRef.current.splice(bi, 1);
        } else {
          let hit = false;
          asteroidsRef.current.forEach((a, ai) => {
            if (rectCollision(b.x - 5, b.y, 10, 20, a.x, a.y, a.size, a.size)) {
              // explosion (simple)
              explosionsRef.current.push({
                x: a.x + a.size / 2,
                y: a.y + a.size / 2,
                r: 0,
                alpha: 1,
              });
              bulletsRef.current.splice(bi, 1);
              asteroidsRef.current.splice(ai, 1);
              setScore((s) => s + 50);
              hit = true;
            }
          });
          if (!hit && bulletLoaded.current && bulletImg.current)
            ctx.drawImage(bulletImg.current, b.x - 8, b.y, 16, 32);
        }
      });

      // explosions
      explosionsRef.current.forEach((ex, ei) => {
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,160,0,${ex.alpha})`;
        ctx.fill();
        ctx.closePath();
        ex.r += 3;
        ex.alpha -= 0.06;
        if (ex.alpha <= 0) explosionsRef.current.splice(ei, 1);
      });

      // finish condition: when transitioning true and no more asteroids on screen
      if (transitioning && asteroidsRef.current.length === 0) {
        // mission complete
        if (onComplete) onComplete();
        // stop animation
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // --- input handlers ---
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      spaceshipOffset.current = mouseX - canvas.width / 2;
    };

    const onResize = () => resize();

    const onClick = () => shoot();

    // --- init ---
    resize();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    canvas.addEventListener("click", onClick);

    // start spawn interval
    spawnIntervalRef.current = window.setInterval(
      spawnAsteroid,
      cfg.asteroidSpawnRate
    );

    // start loop
    animate();

    return () => {
      if (spawnIntervalRef.current)
        window.clearInterval(spawnIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClick);
    };
  }, [cfg, onComplete, transitioning]);

  return (
    <div className="relative text-white">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ background: cfg.background ?? "#000" }}
      />

      <div className="absolute top-6 left-6 bg-black/60 p-3 rounded z-20">
        <div className="text-sm">Mission: {cfg.displayName}</div>
        <div className="font-bold text-lg">Score: {score}</div>
      </div>

      {transitioning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30">
          <h2 className="text-3xl font-bold mb-2">
            Đang tiếp cận {cfg.displayName}...
          </h2>
          <p className="text-sm mb-4">
            Hoàn thành nhiệm vụ để khám phá hành tinh
          </p>
        </div>
      )}
    </div>
  );
}
