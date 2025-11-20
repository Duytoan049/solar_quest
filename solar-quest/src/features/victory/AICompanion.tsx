import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import QuizPanel from "@/features/quiz/QuizPanel";
import ProfileCreation from "@/features/profile/ProfileCreation";
import type { AICompanionData } from "@/types/victory";
import type { QuizResult } from "@/types/quiz";
import { ttsService, detectLanguage } from "@/services/textToSpeech";

interface Props {
  ai: AICompanionData;
  planetId: string; // NEW: Need planetId for quiz
  planetName: string; // NEW: Need planetName for profile
  onComplete: () => void;
}

export default function AICompanion({
  ai,
  planetId,
  planetName,
  onComplete,
}: Props) {
  // Phase management: intro -> quiz -> profile -> complete
  const [phase, setPhase] = useState<"intro" | "quiz" | "profile" | "complete">(
    () => {
      // Check if user has already completed quiz for this planet
      const savedQuiz = localStorage.getItem(`quiz-${planetId}`);
      return savedQuiz ? "complete" : "intro";
    }
  );

  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);

  const fullText = ai.dialogues.intro[currentDialogue] || "";

  // Auto-skip to PlanetDetail if quiz already completed
  useEffect(() => {
    if (phase === "complete") {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [phase, onComplete]);

  // Typing effect with synchronized TTS
  useEffect(() => {
    if (phase !== "intro") return;

    setDisplayedText("");
    setIsTyping(true);

    // Capture TTS enabled state at the moment dialogue starts
    const shouldPlayTTS = isTTSEnabled;

    console.log(
      "AICompanion: Starting dialogue",
      currentDialogue,
      "TTS enabled:",
      shouldPlayTTS
    );
    console.log("AICompanion: Full text:", fullText);

    // Start TTS immediately with full text if enabled
    if (shouldPlayTTS) {
      const lang = detectLanguage(fullText);
      console.log("AICompanion: Detected language:", lang);

      setIsTTSPlaying(true);
      setIsTTSPaused(false);

      ttsService.speak(
        fullText,
        { lang, rate: 0.9, pitch: 1.0, volume: 1.0 }, // Slightly slower for better sync
        () => {
          // On TTS complete
          console.log("AICompanion: TTS completed");
          setIsTTSPlaying(false);
          setIsTTSPaused(false);
        },
        (error) => {
          // On TTS error
          console.error("AICompanion: TTS Error:", error);
          setIsTTSPlaying(false);
          setIsTTSPaused(false);
        }
      );
    } else {
      console.log("AICompanion: TTS is disabled, skipping");
    }

    let currentIndex = 0;
    const typingSpeed = 50; // milliseconds per character
    const isExploreMessage = currentDialogue >= ai.dialogues.intro.length;

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // For explore message, don't set isTyping to false
        // to keep the quiz button visible
        if (!isExploreMessage) {
          setIsTyping(false);
        } else {
          setIsTyping(false); // Allow quiz button to show
        }
        clearInterval(typingInterval);

        // Auto-advance only for intro dialogues
        if (!isExploreMessage) {
          setTimeout(() => {
            if (currentDialogue < ai.dialogues.intro.length - 1) {
              setCurrentDialogue((prev) => prev + 1);
            } else {
              // Show explore message
              setTimeout(() => {
                setCurrentDialogue(ai.dialogues.intro.length);
              }, 1500);
            }
          }, 2000);
        }
      }
    }, typingSpeed);

    return () => {
      clearInterval(typingInterval);
      ttsService.cancel(); // Cancel TTS when changing dialogue
      setIsTTSPlaying(false);
      setIsTTSPaused(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDialogue, fullText, phase, ai.dialogues.intro.length]);
  // Intentionally not including isTTSEnabled to prevent re-triggering typing effect when mute/unmute

  const skipToEnd = () => {
    ttsService.cancel(); // Cancel TTS when skipping
    setDisplayedText(fullText);
    setIsTyping(false);
    setIsTTSPlaying(false);
    setIsTTSPaused(false);
  };

  const handleTTSToggle = () => {
    if (isTTSPlaying) {
      if (isTTSPaused) {
        ttsService.resume();
        setIsTTSPaused(false);
      } else {
        ttsService.pause();
        setIsTTSPaused(true);
      }
    }
  };

  const handleTTSMute = () => {
    setIsTTSEnabled(!isTTSEnabled);
    if (isTTSPlaying) {
      ttsService.cancel();
      setIsTTSPlaying(false);
      setIsTTSPaused(false);
    }
  };

  // ESC key handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phase === "intro") {
          // Cancel TTS and skip to explore phase
          ttsService.cancel();
          setIsTTSPlaying(false);
          setIsTTSPaused(false);
          setCurrentDialogue(ai.dialogues.intro.length);
          setIsTyping(false);
        } else if (phase === "quiz" || phase === "profile") {
          // Skip to complete
          setPhase("complete");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [phase, ai.dialogues.intro.length]);

  const isExplorePhase = currentDialogue >= ai.dialogues.intro.length;
  const exploreText = ai.dialogues.explore;

  const handleQuizComplete = (result: QuizResult) => {
    console.log("Quiz completed:", result);
    setPhase("profile"); // Go to profile creation instead of complete
  };

  // Show profile phase
  if (phase === "profile") {
    return (
      <ProfileCreation
        planetId={planetId}
        planetName={planetName}
        ai={ai}
        onComplete={() => {
          setPhase("complete");
        }}
        onSkip={() => {
          setPhase("complete");
        }}
      />
    );
  }

  // Show quiz phase
  if (phase === "quiz") {
    return (
      <QuizPanel planetId={planetId} ai={ai} onComplete={handleQuizComplete} />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-50 cursor-auto">
      {/* Background stars - subtle */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* AI Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-8">
        {/* AI Avatar - Simple */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex flex-col items-center mb-6"
        >
          {/* Simple glow */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: `radial-gradient(circle, ${ai.color}20 0%, transparent 70%)`,
              }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Avatar */}
            <motion.div
              className="relative text-7xl filter drop-shadow-lg"
              animate={{
                y: [-3, 3, -3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {ai.avatar}
            </motion.div>
          </div>

          {/* AI Name and Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-4"
          >
            <h2
              className="text-3xl font-bold mb-1 text-white"
              style={{
                textShadow: `0 0 20px ${ai.color}40`,
              }}
            >
              {ai.name}
            </h2>
            <p className="text-sm text-gray-400">{ai.title}</p>
          </motion.div>
        </motion.div>

        {/* Dialogue Box - Clean */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div
            className="bg-black/40 backdrop-blur-xl rounded-lg p-6 border border-white/10"
            style={{
              boxShadow: `0 0 30px ${ai.color}10`,
            }}
          >
            {/* TTS Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Play/Pause Button - show first when playing */}
              {isTTSPlaying && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={handleTTSToggle}
                  className="w-9 h-9 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 
                    hover:border-white/40 hover:bg-black/80 transition-all hover:scale-105
                    flex items-center justify-center"
                  title={isTTSPaused ? "Tiếp tục" : "Tạm dừng"}
                >
                  {isTTSPaused ? (
                    <Play
                      className="w-4 h-4 text-white/90"
                      fill="currentColor"
                    />
                  ) : (
                    <Pause className="w-4 h-4 text-white/90" />
                  )}
                </motion.button>
              )}

              {/* Mute/Unmute Button */}
              <button
                onClick={handleTTSMute}
                className={`w-9 h-9 rounded-lg backdrop-blur-md border transition-all hover:scale-105
                  flex items-center justify-center
                  ${
                    isTTSEnabled
                      ? "bg-black/60 border-white/20 hover:border-white/40 hover:bg-black/80"
                      : "bg-red-500/20 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/30"
                  }`}
                title={isTTSEnabled ? "Tắt giọng nói" : "Bật giọng nói"}
              >
                {isTTSEnabled ? (
                  <Volume2 className="w-4 h-4 text-white/90" />
                ) : (
                  <VolumeX className="w-4 h-4 text-red-400" />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentDialogue}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg text-gray-100 min-h-[60px] leading-relaxed pr-20"
                onClick={skipToEnd}
                style={{ cursor: isTyping ? "pointer" : "default" }}
              >
                {isExplorePhase ? exploreText : displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-white ml-1"
                  >
                    _
                  </motion.span>
                )}
              </motion.p>
            </AnimatePresence>

            {/* Progress dots - minimal */}
            <div className="flex gap-1.5 mt-4 justify-center">
              {ai.dialogues.intro.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      index <= currentDialogue ? ai.color : "#ffffff20",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Button - Clean */}
        {isExplorePhase && !isTyping && phase === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-6"
          >
            <button
              onClick={() => setPhase("quiz")}
              className="px-8 py-3 rounded-lg font-semibold text-white
                bg-white/10 hover:bg-white/20 backdrop-blur-md
                border border-white/20 hover:border-white/40
                transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: `0 0 20px ${ai.color}20`,
              }}
            >
              � Bắt đầu Quiz
            </button>
          </motion.div>
        )}

        {/* Skip hint - subtle */}
        {!isExplorePhase && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center text-gray-500 text-xs mt-3"
          >
            Click để bỏ qua | ESC để skip
          </motion.p>
        )}
      </div>

      {/* Skip button - minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 right-4"
      >
        <button
          onClick={onComplete}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md 
            rounded text-white/60 hover:text-white text-xs transition-all duration-300
            border border-white/10 hover:border-white/20"
        >
          ESC
        </button>
      </motion.div>
    </div>
  );
}
