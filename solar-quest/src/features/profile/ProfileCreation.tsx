import { useState } from "react";
import { motion } from "framer-motion";
import { ROLE_INFO, AVATAR_OPTIONS, type PlanetProfile } from "@/types/profile";
import type { AICompanionData } from "@/types/victory";
import type { QuizResult } from "@/types/quiz";
import { saveProfile, getQuizResult } from "@/services/profileStorage";

interface Props {
  planetId: string;
  planetName: string;
  ai: AICompanionData;
  onComplete: () => void;
  onSkip: () => void;
}

export default function ProfileCreation({
  planetId,
  planetName,
  ai,
  onComplete,
  onSkip,
}: Props) {
  const [step, setStep] = useState<"name" | "role" | "avatar" | "complete">(
    "name"
  );
  const [citizenName, setCitizenName] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    keyof typeof ROLE_INFO | null
  >(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    AVATAR_OPTIONS[0]
  );

  const quizResult: QuizResult | null = getQuizResult(planetId);

  const handleNameSubmit = () => {
    if (citizenName.trim()) {
      setStep("role");
    }
  };

  const handleRoleSelect = (role: keyof typeof ROLE_INFO) => {
    setSelectedRole(role);
    setStep("avatar");
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const handleComplete = () => {
    if (!selectedRole) return;

    const profile: PlanetProfile = {
      planetId,
      planetName,
      citizenName: citizenName.trim(),
      role: selectedRole,
      avatar: selectedAvatar,
      badges:
        quizResult?.tier === "gold"
          ? ["🥇 Gold Master"]
          : quizResult?.tier === "silver"
          ? ["🥈 Silver Expert"]
          : ["🥉 Bronze Explorer"],
      quizScore: quizResult?.score || 0,
      quizTier: quizResult?.tier || "bronze",
      createdAt: new Date(),
      lastVisited: new Date(),
    };

    saveProfile(profile);
    setStep("complete");

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-50 p-6 overflow-y-auto cursor-auto">
      {/* Background */}
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
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">{ai.avatar}</div>
          <h2
            className="text-4xl font-bold mb-2"
            style={{
              background: `linear-gradient(135deg, ${ai.color} 0%, white 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tạo Profile Công Dân
          </h2>
          <p className="text-gray-400">
            Tạo nhân vật của bạn trên {planetName}
          </p>
        </motion.div>

        {/* Step 1: Name */}
        {step === "name" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Bạn tên là gì?
            </h3>
            <p className="text-gray-400 mb-6">
              Đặt tên cho công dân của bạn trên {planetName}
            </p>

            <input
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
              placeholder="Nhập tên của bạn..."
              maxLength={20}
              autoFocus
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl
                text-white text-xl placeholder-gray-500 focus:outline-none focus:border-white/40
                transition-all"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleNameSubmit}
                disabled={!citizenName.trim()}
                className="flex-1 py-4 rounded-xl font-bold text-white
                  bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Tiếp tục →
              </button>
              <button
                onClick={onSkip}
                className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white
                  bg-white/5 hover:bg-white/10 transition-all"
              >
                Bỏ qua
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Role */}
        {step === "role" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Chọn vai trò của bạn
            </h3>
            <p className="text-gray-400 mb-6 text-center">
              Vai trò sẽ định hình hành trình khám phá của bạn
            </p>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(ROLE_INFO).map(([key, info]) => (
                <motion.button
                  key={key}
                  onClick={() =>
                    handleRoleSelect(key as keyof typeof ROLE_INFO)
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/10
                    hover:border-white/30 transition-all text-left group"
                  style={{
                    borderColor: selectedRole === key ? info.color : undefined,
                  }}
                >
                  <div className="text-5xl mb-3">{info.icon}</div>
                  <h4
                    className="text-xl font-bold mb-2"
                    style={{ color: info.color }}
                  >
                    {info.title}
                  </h4>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {info.description}
                  </p>
                </motion.button>
              ))}
            </div>

            <button
              onClick={onSkip}
              className="w-full mt-6 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white
                bg-white/5 hover:bg-white/10 transition-all"
            >
              Bỏ qua
            </button>
          </motion.div>
        )}

        {/* Step 3: Avatar */}
        {step === "avatar" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Chọn avatar
            </h3>
            <p className="text-gray-400 mb-6 text-center">
              Chọn biểu tượng đại diện cho bạn
            </p>

            <div className="grid grid-cols-6 gap-3 mb-6">
              {AVATAR_OPTIONS.map((avatar) => (
                <motion.button
                  key={avatar}
                  onClick={() => handleAvatarSelect(avatar)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`text-5xl p-4 rounded-xl transition-all ${
                    selectedAvatar === avatar
                      ? "bg-white/20 border-2 border-white/40"
                      : "bg-white/5 border-2 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {avatar}
                </motion.button>
              ))}
            </div>

            {/* Preview */}
            <div className="bg-white/10 rounded-xl p-6 mb-6 text-center">
              <div className="text-6xl mb-3">{selectedAvatar}</div>
              <h4 className="text-2xl font-bold text-white mb-1">
                {citizenName}
              </h4>
              <p className="text-gray-400">
                {selectedRole && ROLE_INFO[selectedRole].title} trên{" "}
                {planetName}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleComplete}
                className="flex-1 py-4 rounded-xl font-bold text-white
                  bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                  transition-all"
              >
                ✓ Hoàn tất
              </button>
              <button
                onClick={() => setStep("role")}
                className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white
                  bg-white/5 hover:bg-white/10 transition-all"
              >
                ← Quay lại
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Complete */}
        {step === "complete" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-8xl mb-6"
            >
              {selectedAvatar}
            </motion.div>

            <h3 className="text-3xl font-bold text-white mb-2">
              Chào mừng, {citizenName}!
            </h3>
            <p className="text-xl text-gray-400 mb-6">
              {selectedRole && ROLE_INFO[selectedRole].title} trên {planetName}
            </p>

            <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
              />
              <span>Đang chuyển đến {planetName}...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
