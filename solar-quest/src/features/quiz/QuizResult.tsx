import { motion } from "framer-motion";
import type { QuizResult as QuizResultType } from "@/types/quiz";
import type { AICompanionData } from "@/types/victory";

interface Props {
  result: QuizResultType;
  ai: AICompanionData;
  onContinue: () => void;
}

export default function QuizResult({ result, ai, onContinue }: Props) {
  const quiz = result;
  const percentage = quiz.percentage;
  
  // Determine reward tier message
  let rewardData;
  if (quiz.tier === "gold") {
    rewardData = { score: 5, title: "Bậc thầy", badges: ["🥇 Gold Master", "⭐ Hoàn hảo", "🎓 Chuyên gia"], message: "Xuất sắc! Bạn là chuyên gia thực thụ!" };
  } else if (quiz.tier === "silver") {
    rewardData = { score: 3, title: "Chuyên gia", badges: ["🥈 Silver Expert", "🔓 Mở khóa tính năng"], message: "Tuyệt vời! Bạn hiểu rất rõ!" };
  } else {
    rewardData = { score: 1, title: "Người khám phá", badges: ["🥉 Bronze Explorer"], message: "Bạn đã bắt đầu hành trình!" };
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Confetti effect for high scores */}
      {percentage >= 80 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "linear",
              }}
              className="absolute text-2xl"
            >
              {["🎉", "⭐", "🎊", "✨", "🏆"][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Result card */}
      <div
        className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20"
        style={{
          boxShadow: `0 0 60px ${ai.color}30`,
        }}
      >
        {/* AI Avatar */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 blur-2xl rounded-full"
              style={{
                background: `radial-gradient(circle, ${ai.color}40 0%, transparent 70%)`,
              }}
            />
            <span className="relative text-7xl">{ai.avatar}</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-center text-white mb-2"
        >
          Kết quả Quiz
        </motion.h2>

        {/* Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="text-6xl font-bold mb-2" style={{ color: ai.color }}>
            {quiz.score}/{quiz.maxScore}
          </div>
          <div className="text-gray-400 text-lg">
            {percentage.toFixed(0)}% chính xác
          </div>
        </motion.div>

        {/* Progress circle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center mb-8"
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={ai.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 80 * (1 - percentage / 100),
              }}
              transition={{ duration: 1.5, delay: 0.8 }}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
              }}
            />
            {/* Center text */}
            <text
              x="100"
              y="110"
              textAnchor="middle"
              fontSize="40"
              fontWeight="bold"
              fill="white"
            >
              {percentage.toFixed(0)}%
            </text>
          </svg>
        </motion.div>

        {/* Tier badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mb-6"
        >
          <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-white font-bold text-lg mb-3">
            {rewardData.title}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {rewardData.message}
          </h3>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
        >
          <h4 className="text-center text-gray-400 mb-3 text-sm uppercase tracking-wide">
            Huy hiệu đạt được
          </h4>
          <div className="flex flex-wrap justify-center gap-3">
            {rewardData.badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 1.3 + index * 0.1,
                  type: "spring",
                }}
                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm"
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">{ai.avatar}</span>
            <div>
              <p className="text-white font-semibold mb-1">{ai.name}</p>
              <p className="text-gray-300 leading-relaxed">
                {percentage === 100
                  ? "Không thể tin được! Bạn trả lời đúng tất cả! Bạn thực sự là bậc thầy về hành tinh này! 🎉"
                  : percentage >= 80
                  ? "Tuyệt vời! Bạn có kiến thức vững vàng về hành tinh này! Tiếp tục khám phá nhé! 🌟"
                  : percentage >= 60
                  ? "Khá tốt! Bạn đã nắm được những kiến thức cơ bản. Hãy khám phá thêm để học hỏi nhiều hơn! 📚"
                  : "Đừng lo! Mọi hành trình đều bắt đầu từ những bước đi đầu tiên. Hãy khám phá các markers để học thêm nhé! 🚀"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          onClick={onContinue}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-xl font-bold text-white text-lg
            bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
            transition-all duration-300 shadow-lg"
          style={{
            boxShadow: `0 10px 30px ${ai.color}40`,
          }}
        >
          {percentage >= 60 ? "🚀 Tiếp tục khám phá" : "🔄 Thử lại"}
        </motion.button>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9 }}
          className="mt-6 grid grid-cols-3 gap-4 text-center"
        >
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">
              {quiz.answers.filter((a) => a.isCorrect).length}
            </div>
            <div className="text-xs text-gray-400">Đúng</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">
              {quiz.answers.filter((a) => !a.isCorrect).length}
            </div>
            <div className="text-xs text-gray-400">Sai</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold" style={{ color: ai.color }}>
              {quiz.tier === "gold" ? "🥇" : quiz.tier === "silver" ? "🥈" : "🥉"}
            </div>
            <div className="text-xs text-gray-400 capitalize">{quiz.tier}</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
