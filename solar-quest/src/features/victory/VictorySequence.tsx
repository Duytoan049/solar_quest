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
      timers.push(setTimeout(() => setPhase("launch"), 2500));
    } else if (phase === "launch") {
      timers.push(setTimeout(() => setPhase("travel"), 3000));
    } else if (phase === "travel") {
      timers.push(setTimeout(() => setPhase("arrival"), 3500));
    } else if (phase === "arrival") {
      timers.push(setTimeout(() => setPhase("ai-intro"), 4000));
    }

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Ship launch animation
  useEffect(() => {
    if (phase === "launch" || phase === "travel") {
      let y = shipY;
      const animate = () => {
        y -= 8; // Speed up
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

  // Warp effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== "travel") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    const drawWarp = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw warp lines - subtle white
      for (let i = 0; i < 50; i++) {
        const x = (i / 50) * canvas.width;
        const speed = 20 + Math.random() * 30;
        const y = ((time * speed) % canvas.height) - 100;

        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 50 + Math.random() * 100);
        ctx.stroke();
      }

      time += 0.05;
      animationId = requestAnimationFrame(drawWarp);
    };

    drawWarp();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
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
      {/* Canvas for warp effect */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Phase 1: Celebration */}
      <AnimatePresence>
        {phase === "celebration" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
              >
                <h1
                  className="text-8xl font-black mb-4 text-white"
                  style={{
                    textShadow: `0 0 30px rgba(255,255,255,0.3)`,
                  }}
                >
                  CHIẾN THẮNG! 🎉
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl text-gray-300 space-y-2"
              >
                <p>Điểm: {stats.score}</p>
                <p>Combo tối đa: x{stats.maxCombo}</p>
                <p>Sát thương nhận: {stats.damagesTaken}</p>
              </motion.div>

              {/* Particle explosion - subtle white */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white"
                    style={{
                      left: "50%",
                      top: "50%",
                      opacity: 0.6,
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 800,
                      y: (Math.random() - 0.5) * 800,
                      opacity: [0.6, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2 & 3: Launch + Travel */}
      {(phase === "launch" || phase === "travel") && (
        <div className="absolute inset-0">
          {/* Spaceship */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 text-6xl"
            style={{ bottom: `${-shipY}px` }}
            animate={{
              rotate: [0, -2, 2, 0],
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
            }}
          >
            🚀
          </motion.div>

          {/* Particle trail - white */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 w-2 h-2 rounded-full bg-white"
              style={{
                bottom: `${-shipY - 50 - i * 10}px`,
                left: `calc(50% + ${(Math.random() - 0.5) * 30}px)`,
                opacity: 0.5,
              }}
              animate={{
                opacity: [0.5, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.02,
                repeat: Infinity,
              }}
            />
          ))}

          {/* Status text - minimal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center"
          >
            <p className="text-3xl text-white font-bold mb-2">
              {phase === "launch" ? "🚀 KHỞI ĐỘNG TÊN LỬA" : "⚡ WARP SPEED"}
            </p>
            <p className="text-xl text-gray-400">
              Đang bay đến {planetName}...
            </p>
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
          {/* Planet appearance */}
          <motion.div
            className="relative"
            style={{
              transform: `scale(${planetScale})`,
            }}
          >
            {/* Planet glow - subtle */}
            <div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${planetColor}30, transparent)`,
                width: "400px",
                height: "400px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* Planet */}
            <div
              className="relative w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${planetColor}cc, ${planetColor}44)`,
                boxShadow: `0 0 30px ${planetColor}40, inset -30px -30px 60px rgba(0,0,0,0.5)`,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: `linear-gradient(135deg, transparent 40%, ${planetColor}20 50%, transparent 60%)`,
                }}
              />
            </div>

            {/* Orbiting spaceship */}
            <motion.div
              className="absolute text-4xl"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                width: "300px",
                height: "300px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2">🚀</div>
            </motion.div>
          </motion.div>

          {/* Arrival text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-1/4 text-center"
          >
            <p className="text-4xl font-bold text-white mb-2">
              ✨ Đã đến {planetName}! ✨
            </p>
            <p className="text-xl text-gray-300">{getPerformanceMessage()}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Phase 5: AI Introduction */}
      {phase === "ai-intro" && (
        <AICompanion
          ai={ai}
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
            className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md 
              rounded-lg text-white font-semibold transition-all duration-300
              border border-white/30 hover:border-white/60"
          >
            ESC hoặc Click để bỏ qua
          </button>
        </motion.div>
      )}

      {/* Progress bar - minimal white */}
      {phase !== "ai-intro" && phase !== "complete" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-64">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
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
