import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getArtifactProgress,
  getCollectionStats,
} from "../../services/artifactService";
import type { ArtifactCollectionProgress } from "../../types/artifact";
import { Sparkles, Trophy, Star, Filter } from "lucide-react";

const PLANET_NAMES: Record<string, string> = {
  mercury: "Sao Thủy",
  venus: "Sao Kim",
  earth: "Trái Đất",
  mars: "Sao Hỏa",
  jupiter: "Sao Mộc",
  saturn: "Sao Thổ",
  uranus: "Sao Thiên Vương",
  neptune: "Sao Hải Vương",
};

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

export const ArtifactCollection: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ArtifactCollectionProgress | null>(
    null
  );
  const [stats, setStats] = useState<{
    totalCollected: number;
    totalArtifacts: number;
    completionRate: number;
    totalPoints: number;
    badges: number;
    achievements: number;
    rareFinds: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [progressData, statsData] = await Promise.all([
        getArtifactProgress(user.uid),
        getCollectionStats(user.uid),
      ]);

      setProgress(progressData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading collection:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-white/80">Đang tải bộ sưu tập...</p>
        </div>
      </div>
    );
  }

  if (!progress || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold mb-2">Chưa có đồ vật nào</h2>
          <p className="text-white/60">
            Hãy khám phá các hành tinh để thu thập đồ vật!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12 text-yellow-400" />
            Bộ Sưu Tập Đồ Vật
          </h1>
          <p className="text-white/60 text-lg">
            Khám phá và thu thập các đồ vật bí ẩn trên các hành tinh
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Sparkles className="w-8 h-8" />}
            label="Tổng đồ vật"
            value={`${stats.totalCollected}/${stats.totalArtifacts}`}
            color="purple"
          />
          <StatCard
            icon={<Star className="w-8 h-8" />}
            label="Hoàn thành"
            value={`${stats.completionRate}%`}
            color="blue"
          />
          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            label="Tổng điểm"
            value={stats.totalPoints.toLocaleString()}
            color="yellow"
          />
          <StatCard
            icon={<Sparkles className="w-8 h-8" />}
            label="Hiếm có"
            value={stats.rareFinds}
            color="orange"
          />
        </div>

        {/* Progress bars by planet */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Filter className="w-6 h-6 text-purple-400" />
            Tiến độ theo Hành tinh
          </h2>

          <div className="space-y-4">
            {Object.entries(progress.byPlanet).map(([planetId, data]) => {
              const planetData = data as {
                collected: number;
                total: number;
                percentage: number;
              };
              return (
                <PlanetProgress
                  key={planetId}
                  planetName={PLANET_NAMES[planetId] || planetId}
                  collected={planetData.collected}
                  total={planetData.total}
                  percentage={planetData.percentage}
                />
              );
            })}
          </div>
        </div>

        {/* Rarity distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            Phân loại theo Độ hiếm
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(progress.byRarity).map(([rarity, count]) => (
              <div
                key={rarity}
                className="bg-slate-900/50 rounded-xl p-4 text-center border-2 transition-transform hover:scale-105"
                style={{
                  borderColor:
                    RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
                }}
              >
                <div
                  className="text-3xl font-bold mb-2"
                  style={{
                    color: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
                  }}
                >
                  {String(count)}
                </div>
                <div className="text-sm text-white/60">
                  {RARITY_LABELS[rarity as keyof typeof RARITY_LABELS]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Huy hiệu ({progress.badges.length})
            </h2>

            {progress.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {progress.badges.map((badge: string, index: number) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30 text-yellow-300 text-sm font-semibold"
                  >
                    🏆 {badge}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40">Chưa có huy hiệu nào</p>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-purple-400" />
              Thành tựu ({progress.achievements.length})
            </h2>

            {progress.achievements.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {progress.achievements.map(
                  (achievement: string, index: number) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 text-purple-300 text-sm font-semibold"
                    >
                      ⭐ {achievement}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-white/40">Chưa có thành tựu nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat card component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => {
  const colorClasses = {
    purple:
      "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
    yellow:
      "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
    orange:
      "from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${
        colorClasses[color as keyof typeof colorClasses]
      } rounded-2xl p-6 border backdrop-blur-sm transition-transform hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`${
            color === "purple"
              ? "text-purple-400"
              : color === "blue"
              ? "text-blue-400"
              : color === "yellow"
              ? "text-yellow-400"
              : "text-orange-400"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
};

// Planet progress component
const PlanetProgress: React.FC<{
  planetName: string;
  collected: number;
  total: number;
  percentage: number;
}> = ({ planetName, collected, total, percentage }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-semibold">{planetName}</span>
        <span className="text-white/60 text-sm">
          {collected}/{total} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ArtifactCollection;
