import { useState } from "react";
import { motion } from "framer-motion";
import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";

interface Props {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedAnswer: number) => void;
  aiColor: string;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  aiColor,
}: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(index);
    setShowExplanation(true);

    // Auto-advance after showing explanation
    setTimeout(() => {
      onAnswer(index);
    }, 3000);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            Câu hỏi {questionNumber}/{totalQuestions}
          </span>
          <span className="capitalize">{question.difficulty}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(questionNumber / totalQuestions) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${aiColor}40 0%, ${aiColor} 100%)`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/10"
      >
        <h3 className="text-2xl font-bold text-white mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === question.correctAnswer;
            const showResult = selectedAnswer !== null;

            let bgColor = "bg-white/5 hover:bg-white/10";
            let borderColor = "border-white/20";
            let textColor = "text-gray-200";

            if (showResult) {
              if (isCorrectOption) {
                bgColor = "bg-green-500/20";
                borderColor = "border-green-500";
                textColor = "text-green-300";
              } else if (isSelected && !isCorrect) {
                bgColor = "bg-red-500/20";
                borderColor = "border-red-500";
                textColor = "text-red-300";
              }
            } else if (isSelected) {
              bgColor = "bg-white/20";
              borderColor = `border-[${aiColor}]`;
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={selectedAnswer !== null}
                whileHover={selectedAnswer === null ? { scale: 1.02, x: 5 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 
                  ${bgColor} ${borderColor} ${textColor}
                  ${selectedAnswer === null ? "cursor-pointer" : "cursor-not-allowed"}
                  flex items-center gap-4`}
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold
                    ${isSelected ? borderColor : "border-white/30"}`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>

                {/* Result icons */}
                {showResult && isCorrectOption && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    ✓
                  </motion.span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    ✗
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Explanation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border-2 ${
            isCorrect
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">
              {isCorrect ? "🎉" : "💡"}
            </span>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">
                {isCorrect ? "Chính xác!" : "Không chính xác!"}
              </h4>
              <p className="text-gray-200 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>

          {/* Auto-advance indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, ease: "linear" }}
              className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
            />
            <span>Tiếp tục sau 3 giây...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
