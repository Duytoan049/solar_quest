import { useEffect, useRef, useState } from "react";
import { useGameManager } from "./GameManager";
import CountUp from "@/components/CountUp";
import Galaxy from "../../ui/Galaxy";

interface Asteroid {
  x: number;
  y: number;
  speed: number;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export default function GameScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const asteroidSpawnRate = useRef(1000);

  const spaceshipImage = useRef<HTMLImageElement | null>(null);
  const asteroidImage = useRef<HTMLImageElement | null>(null);
  const bulletImage = useRef<HTMLImageElement | null>(null);

  const spaceshipLoaded = useRef(false);
  const asteroidLoaded = useRef(false);
  const bulletLoaded = useRef(false);

  const spaceshipPosition = useRef<number>(0); // Position offset for the spaceship

  const { setScene } = useGameManager();
  const maxAsteroids = 25;
  let asteroidCount = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const asteroids: Asteroid[] = [];
    const bullets: Bullet[] = [];
    const explosions: Explosion[] = [];

    const loadImages = () => {
      spaceshipImage.current = new Image();
      spaceshipImage.current.src = "src/assets/models/yellow_spaceship.png";
      spaceshipImage.current.onload = () => {
        spaceshipLoaded.current = true;
      };
      spaceshipImage.current.onerror = () => {
        console.error("Failed to load spaceship image.");
      };

      asteroidImage.current = new Image();
      asteroidImage.current.src = "src/assets/models/asteroid1.jpg";
      asteroidImage.current.onload = () => {
        asteroidLoaded.current = true;
      };
      asteroidImage.current.onerror = () => {
        console.error("Failed to load asteroid image.");
      };

      bulletImage.current = new Image();
      bulletImage.current.src = "src/assets/models/bullet_spaceship.png";
      bulletImage.current.onload = () => {
        bulletLoaded.current = true;
      };
      bulletImage.current.onerror = () => {
        console.error("Failed to load bullet image.");
      };
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawnAsteroid = () => {
      if (asteroidCount < maxAsteroids) {
        asteroids.push({
          x: Math.random() * canvas.width,
          y: -50,
          speed: 2 + Math.random() * 3,
        });
        asteroidCount++;
      } else {
        clearInterval(asteroidInterval); // Stop spawning new asteroids
        setTransitioning(true); // Trigger transition logic
      }
    };

    const shootBullet = () => {
      bullets.push({
        x: canvas.width / 2 + spaceshipPosition.current,
        y: canvas.height - 60,
        speed: 5,
      });
    };

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

    const animate = () => {
      if (gameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw spaceship
      const spaceshipX = canvas.width / 2 - 25 + spaceshipPosition.current;
      let spaceshipY = canvas.height - 60;

      if (transitioning) {
        spaceshipY -= 5; // Move spaceship upwards
        if (spaceshipY < -50) {
          spaceshipY = -50; // Stop moving when off-screen
        }
      }

      if (spaceshipLoaded.current && spaceshipImage.current) {
        ctx.drawImage(spaceshipImage.current, spaceshipX, spaceshipY, 50, 50);
      }

      // Draw and update asteroids
      if (!transitioning) {
        asteroids.forEach((asteroid, asteroidIndex) => {
          asteroid.y += asteroid.speed;
          if (asteroid.y > canvas.height) {
            asteroids.splice(asteroidIndex, 1);
            setScore((prev) => Math.max(0, prev - 10)); // Deduct score instead of game over
          } else if (asteroidLoaded.current && asteroidImage.current) {
            ctx.drawImage(
              asteroidImage.current,
              asteroid.x,
              asteroid.y,
              50,
              50
            );
          }
        });
      }

      // Draw and update bullets
      bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
          bullets.splice(bulletIndex, 1);
        } else {
          let hit = false;
          asteroids.forEach((asteroid, asteroidIndex) => {
            if (
              checkCollision(
                bullet.x,
                bullet.y,
                10,
                20,
                asteroid.x,
                asteroid.y,
                50,
                50
              )
            ) {
              explosions.push({
                x: asteroid.x + 25,
                y: asteroid.y + 25,
                radius: 0,
                maxRadius: 50,
                alpha: 1,
              });
              bullets.splice(bulletIndex, 1);
              asteroids.splice(asteroidIndex, 1);
              setScore((prev) => prev + 50); // Increase score on hit
              hit = true;
            }
          });
          if (!hit && bulletLoaded.current && bulletImage.current) {
            ctx.drawImage(bulletImage.current, bullet.x - 5, bullet.y, 10, 20);
          }
        }
      });

      // Draw and update explosions
      explosions.forEach((explosion, index) => {
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 69, 0, ${explosion.alpha})`;
        ctx.fill();
        ctx.closePath();

        explosion.radius += 2;
        explosion.alpha -= 0.05;

        if (explosion.radius >= explosion.maxRadius || explosion.alpha <= 0) {
          explosions.splice(index, 1); // Remove explosion after animation ends
        }
      });

      requestAnimationFrame(animate);
    };

    const asteroidInterval = setInterval(() => {
      if (!gameOver) spawnAsteroid();
    }, asteroidSpawnRate.current);

    const handleMouseMove = (e: MouseEvent) => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        spaceshipPosition.current = mouseX - canvas.width / 2;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("click", shootBullet);

    loadImages();
    resizeCanvas();
    animate();

    return () => {
      clearInterval(asteroidInterval);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", shootBullet);
    };
  }, [gameOver, asteroidCount, setScene, transitioning]);

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    asteroidSpawnRate.current = 1000;
  };

  const handleExplorePlanet = () => {
    setScene("planetdetail");
  };

  return (
    <div className="game text-white relative">
      <Galaxy
        mouseRepulsion={true}
        mouseInteraction={true}
        density={1}
        glowIntensity={0.3}
        saturation={0}
        hueShift={140}
        starSpeed={0.1}
      />
      <canvas
        ref={canvasRef}
        style={{ background: "transparent", display: "block" }}
        className="relative z-10"
      ></canvas>
      <div className="absolute top-10 left-10 bg-black/70 text-white p-4 rounded z-20">
        <h2 className="text-lg font-bold">Score: {score}</h2>
      </div>
      {transitioning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-20">
          <h1 className="text-4xl font-bold mb-4">Bạn đã đến hành tinh!</h1>
          <p className="text-lg mb-4">Điểm số của bạn:</p>
          <CountUp
            from={0}
            to={score}
            separator=","
            direction="up"
            duration={1}
            className="text-lg mb-4"
          />
          <button
            onClick={handleExplorePlanet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Khám phá hành tinh
          </button>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-20">
          <h1 className="text-4xl font-bold mb-4">Game Over</h1>
          <p className="text-lg mb-4">Final Score: {score}</p>
          <button
            onClick={restartGame}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
