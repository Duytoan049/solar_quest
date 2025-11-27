import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import Galaxy from "../../ui/Galaxy";
import TextType from "../../ui/TextType";
// FIX 1: Import hook từ file GameContext.ts
import { useGameManager } from "@/core/engine/GameContext";
import { motion } from "framer-motion";
// FIX 2: Import type từ file types.ts
import type { SceneType } from "@/core/engine/types";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Trophy, Rocket } from "lucide-react";

export default function MainMenu() {
  const [exit, setExit] = useState(false);
  const [nextScene, setNextScene] = useState<SceneType | null>(null);
  const { setScene, preloadSolarSystem, isSolarSystemLoaded } =
    useGameManager();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      setIsLoggingOut(true);
      try {
        await logout();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setIsLoggingOut(false);
      }
    }
  };
  useEffect(() => {
    // ⚡ Bắt đầu tải sẵn hệ mặt trời khi menu vừa hiển thị
    if (!isSolarSystemLoaded) {
      preloadSolarSystem();
    }
  }, [isSolarSystemLoaded, preloadSolarSystem]);
  const handleStart = (scene: SceneType) => {
    // FIX: XÓA LỆNH GỌI PRELOAD Ở ĐÂY
    // preloadSolarSystem(); // <--- Dòng này không còn cần thiết

    setNextScene(scene);
    setExit(true);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exit ? 0 : 1 }}
      transition={{ duration: 1 }}
      onAnimationComplete={() => {
        if (exit && nextScene) setScene(nextScene);
      }}
      className="relative flex justify-center h-screen w-screen overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white"
    >
      <div className="absolute inset-0 w-full h-full z-0">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          starSpeed={0.1}
        />
      </div>

      {/* User Profile Card - Top Right */}
      {user && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 min-w-[280px]"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">
                {user.displayName || "Astronaut"}
              </h3>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleStart("profile")}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm"
            >
              <Rocket className="w-4 h-4" />
              <span>My Progress</span>
            </button>
            <button
              onClick={() => handleStart("leaderboard")}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm"
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-400 text-sm disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <h1
          // style={{ fontFamily: "Montreal-Serial Bold" }}
          className="text-6xl font-bold text-white pt-25"
          style={{
            textShadow: "0 0 15px rgba(128, 200, 255, 0.7)",
          }}
        >
          SOLAR QUEST
        </h1>

        <TextType
          text={[
            "Welcome, astronaut, to your journey of conquering the universe!",
            "Ready to explore the mysteries of the galaxy?",
            "Start your spaceship and begin the space adventure!",
          ]}
          typingSpeed={75}
          pauseDuration={2500}
          showCursor={true}
          cursorCharacter="_"
          deletingSpeed={30}
          style={{
            fontFamily: "Sebino-Regular",
            paddingBottom: "100px",
          }}
        />
        <div className="flex flex-col items-center gap-6">
          <Button
            style={{ fontFamily: "Sebino-Regular" }}
            onClick={() => handleStart("warp")}
          >
            Start Explore
          </Button>
          <Button
            style={{ fontFamily: "Sebino-Regular" }}
            onClick={() => handleStart("3dlook")}
          >
            Setting
          </Button>

          {/* <Button
            style={{ fontFamily: "Sebino-Regular" }}
            onClick={() => handleStart("demo")}
          >
            Demo Game
          </Button> */}

          <Button
            style={{ fontFamily: "Sebino-Regular" }}
            onClick={() => handleStart("game")}
          >
            About Us
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
