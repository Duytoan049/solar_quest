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

  // Warp effect on canvas - ENHANCED with particles and colors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== "travel") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    // Particle system for warp effect
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      size: number;
      color: string;
      trail: number;
      glowIntensity: number;
    }> = [];

    // Extract RGB from planet color for theming
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 100, g: 200, b: 255 };
    };

    const rgb = hexToRgb(planetColor);

    // Create particles with planet color theme
    for (let i = 0; i < 120; i++) {
      // Mix planet color with vibrant colors
      const colorMix = Math.random();
      const hue = 180 + Math.random() * 60;

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 15 + Math.random() * 55,
        size: 0.5 + Math.random() * 4,
        // Create color variety: planet color (30%) → cyan/blue (50%) → white (20%)
        color:
          colorMix < 0.3
            ? `rgba(${rgb.r + Math.random() * 50 - 25}, ${
                rgb.g + Math.random() * 50 - 25
              }, ${rgb.b + Math.random() * 50 - 25}, ${
                0.6 + Math.random() * 0.4
              })`
            : colorMix < 0.8
            ? `hsl(${hue}, 100%, ${50 + Math.random() * 40}%)`
            : `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`,
        trail: 40 + Math.random() * 200,
        glowIntensity: 3 + Math.random() * 5,
      });
    }

    const drawWarp = () => {
      // Darker fade for more vibrant trails
      ctx.fillStyle = "rgba(0, 0, 10, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing particles with enhanced trails
      particles.forEach((particle) => {
        const y = ((time * particle.speed) % (canvas.height + 250)) - 125;

        // Enhanced glow effect with planet color influence
        const glowSize = particle.size * particle.glowIntensity;
        const gradient = ctx.createRadialGradient(
          particle.x,
          y,
          0,
          particle.x,
          y,
          glowSize
        );

        // Multi-stop gradient for richer glow
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(
          0.3,
          particle.color.replace(/[\d.]+\)$/g, "0.6)")
        );
        gradient.addColorStop(
          0.7,
          particle.color.replace(/[\d.]+\)$/g, "0.2)")
        );
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(
          particle.x - glowSize,
          y - glowSize,
          glowSize * 2,
          glowSize * 2
        );

        // Enhanced trail with smoother gradient
        const trailGradient = ctx.createLinearGradient(
          particle.x,
          y,
          particle.x,
          y + particle.trail
        );
        trailGradient.addColorStop(0, particle.color);
        trailGradient.addColorStop(
          0.5,
          particle.color.replace(/[\d.]+\)$/g, "0.4)")
        );
        trailGradient.addColorStop(1, "transparent");

        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = particle.size;
        ctx.lineCap = "round";
        ctx.shadowBlur = particle.glowIntensity * 2;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.moveTo(particle.x, y);
        ctx.lineTo(particle.x, y + particle.trail);
        ctx.stroke();

        // Reset shadow for next particle
        ctx.shadowBlur = 0;
      });

      time += 0.06;
      animationId = requestAnimationFrame(drawWarp);
    };

    drawWarp();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [phase, planetColor]);

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

      {/* Phase 1: Celebration - ENHANCED */}
      <AnimatePresence>
        {phase === "celebration" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-radial from-yellow-900/20 via-transparent to-transparent"
          >
            <div className="text-center relative">
              {/* Animated rings expanding */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-4 border-yellow-400/30"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    scale: [1, 3],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Main title with 3D effect */}
              <motion.div
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <h1
                  className="text-9xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 relative"
                  style={{
                    textShadow: `
                      0 0 40px rgba(255, 200, 0, 0.8),
                      0 0 80px rgba(255, 100, 0, 0.6),
                      3px 3px 0 rgba(0, 0, 0, 0.3),
                      6px 6px 0 rgba(0, 0, 0, 0.2),
                      9px 9px 0 rgba(0, 0, 0, 0.1)
                    `,
                    WebkitTextStroke: "2px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    CHIẾN THẮNG! 🎉
                  </motion.span>
                </h1>
              </motion.div>

              {/* Stats with stagger animation */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, staggerChildren: 0.1 }}
                className="text-2xl space-y-3"
              >
                {[
                  { label: "Điểm", value: stats.score, icon: "⭐" },
                  {
                    label: "Combo tối đa",
                    value: `x${stats.maxCombo}`,
                    icon: "🔥",
                  },
                  {
                    label: "Sát thương nhận",
                    value: stats.damagesTaken,
                    icon: "💥",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md 
                      px-6 py-3 rounded-xl border border-white/20 inline-block mx-2"
                  >
                    <span className="text-2xl mr-2">{stat.icon}</span>
                    <span className="text-white font-bold">
                      {stat.label}:
                    </span>{" "}
                    <span className="text-yellow-400 font-black text-3xl">
                      {stat.value}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Fireworks/Sparkles effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                      background: `hsl(${Math.random() * 60 + 30}, 100%, ${
                        50 + Math.random() * 30
                      }%)`,
                      boxShadow: `0 0 10px currentColor`,
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 1000,
                      y: (Math.random() - 0.5) * 1000,
                      opacity: [1, 1, 0],
                      scale: [1, 1.5, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.8,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>

              {/* Floating stars */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute text-4xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random(),
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2 & 3: Launch + Travel - ENHANCED */}
      {(phase === "launch" || phase === "travel") && (
        <div className="absolute inset-0">
          {/* Spaceship with engine glow */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 text-7xl"
            style={{
              bottom: `${-shipY}px`,
              filter: `drop-shadow(0 0 20px ${planetColor}) drop-shadow(0 10px 40px rgba(255,150,0,0.6))`,
            }}
            animate={{
              rotate: [0, -3, 3, 0],
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
            }}
          >
            🚀
            {/* Engine flame */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 text-5xl"
              style={{ top: "60px" }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
              }}
            >
              🔥
            </motion.div>
          </motion.div>

          {/* Enhanced particle trail with colors */}
          {[...Array(35)].map((_, i) => {
            const hue = Math.random() * 60; // Orange to yellow range
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 rounded-full"
                style={{
                  bottom: `${-shipY - 60 - i * 15}px`,
                  left: `calc(50% + ${(Math.random() - 0.5) * 50}px)`,
                  width: `${4 + Math.random() * 8}px`,
                  height: `${4 + Math.random() * 8}px`,
                  background: `hsl(${hue}, 100%, ${50 + Math.random() * 30}%)`,
                  boxShadow: `0 0 ${10 + Math.random() * 15}px currentColor`,
                  opacity: 0.7 - i * 0.015,
                }}
                animate={{
                  opacity: [0.7 - i * 0.015, 0],
                  scale: [1, 0.3],
                  y: [0, 20],
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.3,
                  delay: i * 0.015,
                  repeat: Infinity,
                }}
              />
            );
          })}

          {/* Speed lines for warp effect */}
          {phase === "travel" &&
            [...Array(15)].map((_, i) => (
              <motion.div
                key={`speed-${i}`}
                className="absolute h-px left-0 right-0"
                style={{
                  top: `${10 + i * 40}%`,
                  background: `linear-gradient(90deg, transparent, ${planetColor}40, transparent)`,
                }}
                animate={{
                  scaleX: [0, 2, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  repeat: Infinity,
                }}
              />
            ))}

          {/* Status text with glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center"
          >
            <motion.p
              className="text-5xl text-white font-black mb-3"
              style={{
                textShadow: `0 0 30px ${planetColor}, 0 0 60px ${planetColor}80, 0 0 90px ${planetColor}40`,
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              {phase === "launch" ? "🚀 KHỞI ĐỘNG TÊN LỬA" : "⚡ WARP SPEED"}
            </motion.p>
            <motion.p
              className="text-2xl font-bold"
              style={{
                color: planetColor,
                textShadow: `0 0 20px ${planetColor}`,
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              Đang bay đến {planetName}...
            </motion.p>
          </motion.div>
        </div>
      )}

      {/* Phase 4: Arrival - ENHANCED */}
      {phase === "arrival" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          {/* Starfield background */}
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8,
                }}
                animate={{
                  opacity: [
                    Math.random() * 0.8,
                    Math.random() * 0.3,
                    Math.random() * 0.8,
                  ],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Planet appearance with dramatic entrance */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: planetScale,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 20,
            }}
          >
            {/* Multiple glow layers */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${planetColor}60, ${planetColor}20, transparent)`,
                width: "600px",
                height: "600px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />

            <motion.div
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                background: `radial-gradient(circle, ${planetColor}80, transparent)`,
                width: "450px",
                height: "450px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                scale: [1.05, 0.95, 1.05],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Planet with atmosphere */}
            <div
              className="relative w-80 h-80 rounded-full overflow-hidden"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${planetColor}ff, ${planetColor}aa, ${planetColor}66)`,
                boxShadow: `
                  0 0 60px ${planetColor}80,
                  0 0 120px ${planetColor}40,
                  inset -40px -40px 80px rgba(0,0,0,0.6),
                  inset 20px 20px 40px rgba(255,255,255,0.1)
                `,
              }}
            >
              {/* Atmospheric glow on edge */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, transparent 50%, ${planetColor}40 80%, ${planetColor}80 100%)`,
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />

              {/* Rotating surface details */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: `
                    linear-gradient(135deg, transparent 40%, ${planetColor}30 50%, transparent 60%),
                    linear-gradient(225deg, transparent 70%, rgba(0,0,0,0.3) 80%, transparent 90%)
                  `,
                }}
              />

              {/* Cloud layer */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: `radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.15), transparent 50%)`,
                }}
              />
            </div>

            {/* Orbiting spaceship with trail */}
            <motion.div
              className="absolute text-5xl"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                width: "400px",
                height: "400px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
                style={{
                  filter: `drop-shadow(0 0 10px ${planetColor})`,
                }}
              >
                🚀
              </motion.div>
            </motion.div>

            {/* Orbital rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute border-2 rounded-full"
                style={{
                  width: `${450 + i * 80}px`,
                  height: `${450 + i * 80}px`,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  borderColor: `${planetColor}${20 - i * 5}`,
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>

          {/* Arrival text with shimmer effect */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 1.5,
              type: "spring",
              stiffness: 150,
            }}
            className="absolute bottom-1/4 text-center z-20"
          >
            <motion.p
              className="text-6xl font-black text-white mb-4"
              style={{
                textShadow: `
                  0 0 40px ${planetColor},
                  0 0 80px ${planetColor}aa,
                  0 0 120px ${planetColor}66,
                  4px 4px 0 rgba(0,0,0,0.3)
                `,
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              ✨ Đã đến {planetName}! ✨
            </motion.p>
            <motion.p
              className="text-3xl font-bold"
              style={{
                color: planetColor,
                textShadow: `0 0 30px ${planetColor}, 0 0 60px ${planetColor}80`,
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
            >
              {getPerformanceMessage()}
            </motion.p>

            {/* Celebration particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    background:
                      i % 3 === 0
                        ? planetColor
                        : i % 3 === 1
                        ? "#FFD700"
                        : "#FFF",
                    boxShadow: `0 0 10px currentColor`,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 600,
                    y: (Math.random() - 0.5) * 400,
                    opacity: [1, 0],
                    scale: [1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: 1.5 + Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
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
