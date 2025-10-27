import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AICompanionData } from "@/types/victory";

interface Props {
  ai: AICompanionData;
  onComplete: () => void;
}

export default function AICompanion({ ai, onComplete }: Props) {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const fullText = ai.dialogues.intro[currentDialogue] || "";

  // Typing effect
  useEffect(() => {
    if (!isTyping) return;

    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);

        // Auto-advance to next dialogue after 2s
        setTimeout(() => {
          if (currentDialogue < ai.dialogues.intro.length - 1) {
            setCurrentDialogue((prev) => prev + 1);
            setIsTyping(true);
          } else {
            // Show explore message
            setTimeout(() => {
              setCurrentDialogue(ai.dialogues.intro.length);
              setIsTyping(true);
            }, 1500);
          }
        }, 2000);
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, [currentDialogue, isTyping, fullText, ai.dialogues.intro.length]);

  const skipToEnd = () => {
    setDisplayedText(fullText);
    setIsTyping(false);
  };

  const isExplorePhase = currentDialogue >= ai.dialogues.intro.length;
  const exploreText = ai.dialogues.explore;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-50 cursor-auto">
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
            <AnimatePresence mode="wait">
              <motion.p
                key={currentDialogue}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg text-gray-100 min-h-[60px] leading-relaxed"
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
        {isExplorePhase && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-6"
          >
            <button
              onClick={onComplete}
              className="px-8 py-3 rounded-lg font-semibold text-white
                bg-white/10 hover:bg-white/20 backdrop-blur-md
                border border-white/20 hover:border-white/40
                transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: `0 0 20px ${ai.color}20`,
              }}
            >
              🚀 Bắt đầu khám phá
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
