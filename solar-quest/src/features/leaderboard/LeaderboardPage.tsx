// Global Leaderboard Page
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGameManager } from "@/core/engine/GameContext";
import {
  getLeaderboard,
  getUserRank,
  LeaderboardEntry,
} from "@/services/firestoreService";
import Galaxy from "@/ui/Galaxy";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Loader2,
  Crown,
  Star,
} from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { setScene } = useGameManager();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const top100 = await getLeaderboard(100);
      setLeaderboard(top100);

      if (user) {
        const rank = await getUserRank(user.uid);
        setUserRank(rank);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-orange-400/20 to-orange-500/20 border-orange-400/50";
      default:
        return "bg-black/40 border-white/20";
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Galaxy density={0.8} speed={0.2} glowIntensity={0.5} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setScene("menu")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-white">
              Global Leaderboard
            </h1>
          </div>
          <p className="text-gray-400">
            Top explorers across the Solar Quest universe
          </p>

          {userRank !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg"
            >
              <p className="text-blue-300">
                Your Rank: <span className="font-bold">#{userRank}</span>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-20">
              <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                No players yet. Be the first to explore!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = user?.uid === entry.userId;

                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.02 }}
                    className={`backdrop-blur-xl rounded-xl border p-4 transition-all ${
                      isCurrentUser
                        ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30"
                        : getRankBgColor(rank)
                    } ${rank <= 3 ? "hover:scale-[1.02]" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-12 text-center flex-shrink-0">
                        {getRankIcon(rank) || (
                          <span className="text-2xl font-bold text-white">
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate">
                          {entry.displayName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-400">
                              (You)
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {entry.planetsCompleted} planet
                          {entry.planetsCompleted !== 1 ? "s" : ""} explored
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-400">
                            {entry.totalScore}
                          </p>
                          <p className="text-xs text-gray-400">Score</p>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">
                            {entry.totalBadges}
                          </p>
                          <p className="text-xs text-gray-400">Badges</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>Leaderboard updates in real-time as you complete quizzes</p>
          <p className="mt-1">Showing top {leaderboard.length} explorers</p>
        </motion.div>
      </div>
    </div>
  );
}
