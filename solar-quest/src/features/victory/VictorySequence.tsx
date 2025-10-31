import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  VictoryPhase,
  VictoryStats,
  AICompanionData,
} from "@/types/victory";
import AICompanion from "./AICompanion";

interface Props {
  planetId: string;
  planetName: string;
  planetColor: string;
  stats: VictoryStats;
  ai: AICompanionData;
  onComplete: () => void;
}

export default function VictorySequence({
  planetId,
  planetName,
  planetColor,
  stats,
  ai,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<VictoryPhase>("celebration");
  const [shipY, setShipY] = useState(0);
  const [planetScale, setPlanetScale] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Auto-progress through phases
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    if (phase === "celebration") {
      timers.push(setTimeout(() => setPhase("launch"), 2000));
    } else if (phase === "launch") {
      timers.push(setTimeout(() => setPhase("travel"), 2000));
    } else if (phase === "travel") {
      timers.push(setTimeout(() => setPhase("arrival"), 2500));
    } else if (phase === "arrival") {
      timers.push(setTimeout(() => setPhase("ai-intro"), 2500));
    }

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Ship launch animation
  useEffect(() => {
    if (phase === "launch" || phase === "travel") {
      let y = shipY;
      const animate = () => {
        y -= 5;
        setShipY(y);
        if (y > -1000) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [phase, shipY]);

  // Planet arrival animation
  useEffect(() => {
    if (phase === "arrival") {
      let scale = 0;
      const animate = () => {
        scale += 0.02;
        setPlanetScale(Math.min(scale, 1));
        if (scale < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [phase]);

  // Simple warp effect - matching game theme
  // IMPORTANT: Only run during "travel" phase to avoid interference with Quiz
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== "travel") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    const lines: Array<{
      x: number;
      y: number;
      speed: number;
      opacity: number;
    }> = [];

    // Simple white lines for warp effect
    for (let i = 0; i < 50; i++) {
      lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 15 + Math.random() * 25,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }

    const drawWarp = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      lines.forEach((line) => {
        const y = ((time * line.speed) % (canvas.height + 100)) - 50;

        ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(line.x, y);
        ctx.lineTo(line.x, y + 80);
        ctx.stroke();
      });

      time += 0.05;
      animationId = requestAnimationFrame(drawWarp);
    };

    drawWarp();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      // Clear canvas when leaving travel phase
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [phase]);

  // Skip to AI intro on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "ai-intro" && phase !== "complete") {
        setPhase("ai-intro");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase]);

  const getPerformanceMessage = (): string => {
    if (stats.damagesTaken === 0) {
      return ai.dialogues.performanceBased.noDamage;
    } else if (stats.maxCombo >= 5) {
      return ai.dialogues.performanceBased.highCombo;
    } else if (stats.score > 1000) {
      return ai.dialogues.performanceBased.highScore;
    }
    return ai.dialogues.performanceBased.default;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      {/* Canvas for warp effect - Hide during AI intro phase to prevent interference with Quiz */}
      {phase !== "ai-intro" && (
        <canvas ref={canvasRef} className="absolute inset-0" />
      )}

      {/* Phase 1: Celebration */}
      <AnimatePresence>
        {phase === "celebration" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center space-y-8">
              {/* Simple title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-7xl font-bold text-white mb-4">
                  CHIẾN THẮNG!
                </h1>
              </motion.div>

              {/* Stats - matching GameScene HUD style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-3 max-w-md mx-auto"
              >
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20">
                  <span className="text-white font-semibold">Điểm: </span>
                  <span className="text-white text-2xl font-bold">
                    {stats.score}
                  </span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20">
                  <span className="text-white font-semibold">
                    Combo tối đa:{" "}
                  </span>
                  <span className="text-white text-2xl font-bold">
                    x{stats.maxCombo}
                  </span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20">
                  <span className="text-white font-semibold">
                    Sát thương nhận:{" "}
                  </span>
                  <span className="text-white text-2xl font-bold">
                    {stats.damagesTaken}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2 & 3: Launch + Travel */}
      {(phase === "launch" || phase === "travel") && (
        <div className="absolute inset-0">
          {/* Spaceship indicator */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ bottom: `${-shipY}px` }}
          >
            <div className="w-4 h-8 bg-white/90 rounded-full"></div>
          </motion.div>

          {/* Simple particle trail */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 w-2 h-2 rounded-full bg-white/50"
              style={{
                bottom: `${-shipY - 50 - i * 15}px`,
                left: `calc(50% + ${(Math.random() - 0.5) * 20}px)`,
              }}
              animate={{
                opacity: [0.5, 0],
                scale: [1, 0.3],
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.03,
                repeat: Infinity,
              }}
            />
          ))}

          {/* Status text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center"
          >
            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20">
              <p className="text-2xl text-white font-semibold">
                {phase === "launch"
                  ? "Khởi động..."
                  : "Đang bay đến " + planetName}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Phase 4: Arrival */}
      {phase === "arrival" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Planet with simple glow */}
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: planetScale }}
          >
            {/* Subtle glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: `radial-gradient(circle, ${planetColor}40, transparent)`,
                width: "350px",
                height: "350px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* Planet */}
            <div
              className="relative w-48 h-48 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${planetColor}dd, ${planetColor}66)`,
                boxShadow: `0 0 40px ${planetColor}50, inset -20px -20px 50px rgba(0,0,0,0.5)`,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: `linear-gradient(135deg, transparent 40%, ${planetColor}30 50%, transparent 60%)`,
                }}
              />
            </div>

            {/* Orbiting ship indicator */}
            <motion.div
              className="absolute"
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                width: "220px",
                height: "220px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-6 bg-white/90 rounded-full"></div>
            </motion.div>
          </motion.div>

          {/* Arrival message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-1/4 text-center"
          >
            <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-lg border border-white/20">
              <p className="text-3xl font-bold text-white mb-2">
                Đã đến {planetName}!
              </p>
              <p className="text-lg text-gray-300">{getPerformanceMessage()}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Phase 5: AI Introduction */}
      {phase === "ai-intro" && (
        <AICompanion
          ai={ai}
          planetId={planetId}
          planetName={planetName}
          onComplete={() => {
            setPhase("complete");
            onComplete();
          }}
        />
      )}

      {/* Skip button */}
      {phase !== "ai-intro" && phase !== "complete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={() => setPhase("ai-intro")}
            className="px-6 py-3 bg-black/60 hover:bg-black/80 backdrop-blur-md 
              rounded-lg text-white font-semibold transition-all duration-300
              border border-white/30 hover:border-white/60"
          >
            ESC hoặc Click để bỏ qua
          </button>
        </motion.div>
      )}

      {/* Progress bar */}
      {phase !== "ai-intro" && phase !== "complete" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-64">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80"
              initial={{ width: "0%" }}
              animate={{
                width:
                  phase === "celebration"
                    ? "25%"
                    : phase === "launch"
                    ? "50%"
                    : phase === "travel"
                    ? "75%"
                    : "100%",
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
