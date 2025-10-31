import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import Galaxy from "../../ui/Galaxy";
import TextType from "../../ui/TextType";
// FIX 1: Import hook từ file GameContext.ts
import { useGameManager } from "@/core/engine/GameContext";
import { motion } from "framer-motion";
// FIX 2: Import type từ file types.ts
import type { SceneType } from "@/core/engine/types";

export default function MainMenu() {
  const [exit, setExit] = useState(false);
  const [nextScene, setNextScene] = useState<SceneType | null>(null);
  const { setScene, preloadSolarSystem, isSolarSystemLoaded } =
    useGameManager();
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
