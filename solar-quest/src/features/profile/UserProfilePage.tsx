// User Profile Page - View all planet progress
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGameManager } from "@/core/engine/GameContext";
import { getFirestoreProfile } from "@/services/firestoreService";
import { UserProfile } from "@/types/profile";
import Galaxy from "@/ui/Galaxy";
import {
  ArrowLeft,
  Trophy,
  Award,
  Target,
  Rocket,
  Loader2,
  Star,
} from "lucide-react";
import { planets } from "@/components/planets";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { setScene } = useGameManager();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllProfiles();
  }, [user]);

  const loadAllProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const allProfiles: UserProfile[] = [];

      for (const planet of planets) {
        const profile = await getFirestoreProfile(user.uid, planet.id);
        if (profile) {
          allProfiles.push(profile);
        }
      }

      setProfiles(allProfiles);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalScore = profiles.reduce((sum, p) => sum + (p.quizScore || 0), 0);
    const totalBadges = profiles.reduce(
      (sum, p) => sum + (p.badges?.length || 0),
      0
    );
    const planetsCompleted = profiles.filter((p) => p.quizScore > 0).length;

    return { totalScore, totalBadges, planetsCompleted };
  };

  const stats = getTotalStats();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "silver":
        return "from-gray-300 to-gray-500";
      case "bronze":
        return "from-orange-400 to-orange-600";
      default:
        return "from-gray-600 to-gray-800";
    }
  };

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case "gold":
        return "🥇";
      case "silver":
        return "🥈";
      case "bronze":
        return "🥉";
      default:
        return "⭐";
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

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Rocket className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {user?.displayName || "Astronaut"}
              </h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-gray-400 text-sm">Total Score</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalScore}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-gray-400 text-sm">Total Badges</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalBadges}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-gray-400 text-sm">Planets Explored</p>
                <p className="text-3xl font-bold text-white">
                  {stats.planetsCompleted} / {planets.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Planet Progress Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Planet Progress
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                Start exploring planets to see your progress!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile, index) => {
                const planet = planets.find((p) => p.id === profile.planetId);
                if (!planet) return null;

                return (
                  <motion.div
                    key={profile.planetId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {planet.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {profile.citizenName}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                          profile.quizTier
                        )} text-white text-sm font-bold`}
                      >
                        {getTierEmoji(profile.quizTier)}{" "}
                        {profile.quizTier.toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Role:</span>
                        <span className="text-white font-semibold">
                          {profile.role}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Quiz Score:
                        </span>
                        <span className="text-white font-semibold">
                          {profile.quizScore || 0}
                        </span>
                      </div>

                      {profile.badges && profile.badges.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm mb-2 block">
                            Badges:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {profile.badges.map((badge, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-300 text-xs"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile.lastVisited && (
                        <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
                          Last visited:{" "}
                          {new Date(profile.lastVisited).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
