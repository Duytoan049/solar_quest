import React, { useEffect, useState } from "react";
import type { Artifact } from "../types/artifact";
import { X, Sparkles, Award, Info } from "lucide-react";
import CountUp from "./CountUp";

interface ArtifactCollectionModalProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: "#ffffff",
  uncommon: "#1eff00",
  rare: "#0070dd",
  epic: "#a335ee",
  legendary: "#ff8000",
};

const RARITY_LABELS = {
  common: "Phổ biến",
  uncommon: "Không phổ biến",
  rare: "Hiếm",
  epic: "Sử thi",
  legendary: "Huyền thoại",
};

const CATEGORY_ICONS = {
  "spacecraft-debris": "🛰️",
  "scientific-equipment": "🔬",
  "natural-object": "💎",
  "mystery-artifact": "❓",
  "historical-relic": "📜",
};

const CATEGORY_LABELS = {
  "spacecraft-debris": "Mảnh vỡ tàu vũ trụ",
  "scientific-equipment": "Thiết bị khoa học",
  "natural-object": "Vật thể tự nhiên",
  "mystery-artifact": "Đồ vật bí ẩn",
  "historical-relic": "Di vật lịch sử",
};

export const ArtifactCollectionModal: React.FC<
  ArtifactCollectionModalProps
> = ({ artifact, isOpen, onClose }) => {
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && artifact) {
      setShowConfetti(true);
      setTimeout(() => setShowContent(true), 300);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setShowContent(false);
      setShowConfetti(false);
    }
  }, [isOpen, artifact]);

  if (!isOpen || !artifact) return null;

  const rarityColor = RARITY_COLORS[artifact.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: rarityColor }} />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border transform transition-all duration-500"
        style={{
          borderColor: rarityColor,
          boxShadow: `0 0 40px ${rarityColor}40, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Animated border glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${rarityColor}, transparent 70%)`,
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header */}
        <div className="relative p-3 pb-2 text-center">
          <div
            className={`inline-block px-3 py-1 rounded-full mb-1.5 font-bold text-[10px] uppercase tracking-wider ${
              showContent ? "animate-pulse-glow" : ""
            }`}
            style={{
              backgroundColor: `${rarityColor}15`,
              color: rarityColor,
              border: `1.5px solid ${rarityColor}`,
            }}
          >
            {RARITY_LABELS[artifact.rarity]}
          </div>

          <h2
            className="text-xl font-bold mb-1 animate-slide-up"
            style={{ color: rarityColor }}
          >
            ✨ Phát hiện đồ vật!
          </h2>

          <div className="flex items-center justify-center gap-1.5 text-sm text-white/90">
            <span className="text-base">
              {CATEGORY_ICONS[artifact.category]}
            </span>
            <span className="font-medium">{artifact.name}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 pb-3 space-y-2.5">
          {/* 3D Preview placeholder */}
          <div
            className="relative w-full h-32 rounded-lg overflow-hidden"
            style={{
              backgroundColor: `${rarityColor}08`,
              border: `1px solid ${rarityColor}25`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="text-6xl animate-float"
                style={{
                  filter: `drop-shadow(0 0 15px ${rarityColor})`,
                }}
              >
                {CATEGORY_ICONS[artifact.category]}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2.5 space-y-2 border border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 mb-0.5">
                <Info className="w-3 h-3" />
                <span className="font-semibold">Mô tả</span>
              </div>
              <p className="text-white/90 text-xs leading-relaxed">
                {artifact.description}
              </p>
            </div>

            <div>
              <div className="text-xs text-purple-400 font-semibold mb-0.5">
                📖 Câu chuyện
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed">
                {artifact.story}
              </p>
            </div>

            <div>
              <div className="text-xs text-green-400 font-semibold mb-0.5">
                🔬 Giá trị khoa học
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed">
                {artifact.scientificValue}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10">
              <div className="text-[10px] text-white/60 mb-0.5">Loại</div>
              <div className="text-white font-semibold text-xs">
                {CATEGORY_LABELS[artifact.category]}
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10">
              <div className="text-[10px] text-white/60 mb-0.5">Vị trí</div>
              <div className="text-white font-semibold text-xs capitalize">
                {artifact.location === "surface"
                  ? "Bề mặt"
                  : artifact.location === "low-orbit"
                  ? "Quỹ đạo thấp"
                  : artifact.location === "medium-orbit"
                  ? "Quỹ đạo TB"
                  : "Quỹ đạo cao"}
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-r from-yellow-500/15 to-orange-500/15 rounded-lg p-3 text-center border border-yellow-500/25 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-semibold text-sm">
                Phần thưởng
              </span>
            </div>

            <div className="text-3xl font-bold text-yellow-400 mb-1.5">
              +<CountUp to={artifact.points} duration={1.5} />
            </div>

            {artifact.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-purple-300 text-[11px]">
                  {artifact.badge}
                </span>
              </div>
            )}

            {artifact.unlocks && artifact.unlocks.length > 0 && (
              <div className="mt-1.5 text-[11px] text-cyan-300">
                🔓 {artifact.unlocks.join(", ")}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg font-semibold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: rarityColor,
              boxShadow: `0 4px 20px ${rarityColor}30`,
            }}
          >
            Tuyệt vời!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ArtifactCollectionModal;
