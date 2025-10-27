import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";
import { getPlanetQuiz, getRewardTier } from "@/data/planetQuizzes";
import type { AICompanionData } from "@/types/victory";
import type { QuizResult as QuizResultType } from "@/types/quiz";

interface Props {
  planetId: string;
  ai: AICompanionData;
  onComplete: (result: QuizResultType) => void;
}

export default function QuizPanel({ planetId, ai, onComplete }: Props) {
  const quiz = getPlanetQuiz(planetId);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: number; isCorrect: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);

  if (!quiz) {
    return (
      <div className="text-white text-center">
        <p>Quiz không khả dụng cho hành tinh này.</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswer = (selectedAnswer: number) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Record answer
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
      },
    ]);

    // Move to next question or show result
    if (isLastQuestion) {
      // Calculate final result
      const finalAnswers = [
        ...answers,
        {
          questionId: currentQuestion.id,
          selectedAnswer,
          isCorrect,
        },
      ];

      const score = finalAnswers.filter((a) => a.isCorrect).length;
      const percentage = (score / quiz.questions.length) * 100;
      const tier = getRewardTier(score, quiz.questions.length);

      const result: QuizResultType = {
        planetId,
        score,
        maxScore: quiz.questions.length,
        percentage,
        tier,
        completedAt: new Date(),
        answers: finalAnswers,
      };

      // Save to localStorage
      localStorage.setItem(`quiz-${planetId}`, JSON.stringify(result));

      setTimeout(() => {
        setShowResult(true);
      }, 3000);
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 3000);
    }
  };

  const handleContinue = () => {
    const savedResult = localStorage.getItem(`quiz-${planetId}`);
    if (savedResult) {
      const result: QuizResultType = JSON.parse(savedResult);
      onComplete(result);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-50 p-6 overflow-y-auto cursor-auto">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <h2
                  className="text-4xl font-bold mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${ai.color} 0%, white 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Quiz: {quiz.planetName}
                </h2>
                <p className="text-gray-400">
                  Trả lời đúng {quiz.passingScore}/{quiz.questions.length} để đạt huy hiệu Silver
                </p>
              </motion.div>

              {/* Question */}
              <QuizQuestion
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={quiz.questions.length}
                onAnswer={handleAnswer}
                aiColor={ai.color}
              />
            </motion.div>
          ) : (
            <QuizResult
              result={JSON.parse(localStorage.getItem(`quiz-${planetId}`) || "{}")}
              ai={ai}
              onContinue={handleContinue}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
