import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import Galaxy from "../../ui/Galaxy";
import TextType from "../../ui/TextType";
import { useGameManager } from "@/core/engine/GameContext";
import { motion } from "framer-motion";
import type { SceneType } from "@/core/engine/types";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/hooks/useAudio";
import {
  ArrowRight,
  LogOut,
  User,
  Trophy,
  Rocket,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import AudioSettings from "@/components/AudioSettings";

export default function MainMenu() {
  const { t } = useTranslation();
  const { play, playMusic, stopMusic } = useAudio();
  const [exit, setExit] = useState(false);
  const [nextScene, setNextScene] = useState<SceneType | null>(null);
  const { setScene, preloadSolarSystem, isSolarSystemLoaded, sceneParams } =
    useGameManager();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isGuestMode = !user && sceneParams?.guestMode === true;

  const handleLogout = async () => {
    if (confirm(t("common.confirm") + ": " + t("auth.logout") + "?")) {
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
    if (!isSolarSystemLoaded) preloadSolarSystem();
    playMusic("main-menu", true);
    return () => stopMusic(true);
  }, [isSolarSystemLoaded, preloadSolarSystem, playMusic, stopMusic]);

  const handleStart = (scene: SceneType) => {
    setNextScene(scene);
    setExit(true);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exit ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (exit && nextScene) {
          setScene(nextScene, isGuestMode ? { guestMode: true } : undefined);
        }
      }}
      className="relative flex h-screen w-screen overflow-hidden bg-[#03050a] text-white"
    >
      <div className="absolute inset-0 z-0">
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={0.85}
          glowIntensity={0.22}
          saturation={0}
          hueShift={140}
          starSpeed={0.08}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_42%,rgba(103,232,249,0.08),transparent_32%),linear-gradient(180deg,rgba(3,5,10,0.04),rgba(3,5,10,0.72))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-black/35 to-transparent" />

      <div className="absolute left-6 top-5 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
            <Sparkles className="h-4 w-4 text-cyan-200/80" />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/35">
              Space exploration system
            </p>
            <p className="mt-0.5 text-[11px] font-medium tracking-[0.12em] text-white/80">
              SOLAR QUEST
            </p>
          </div>
        </div>
      </div>

      {user && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="group absolute right-6 top-5 z-20 w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-200/20 bg-gradient-to-br from-cyan-200/10 to-blue-300/10">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-white/80" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Astronaut
              </p>
              <p className="truncate text-sm font-semibold text-white/90">
                {user.displayName || t("userProfile.astronaut")}
              </p>
            </div>
          </div>

          <div className="mt-3 grid max-h-0 gap-1 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100">
            <button
              onClick={() => {
                play("click", { category: "ui" });
                handleStart("profile");
              }}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs text-white/65 transition hover:bg-white/[0.05] hover:text-white"
            >
              <Rocket className="h-3.5 w-3.5" />
              {t("mainMenu.myProgress")}
            </button>
            <button
              onClick={() => {
                play("click", { category: "ui" });
                handleStart("leaderboard");
              }}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs text-white/65 transition hover:bg-white/[0.05] hover:text-white"
            >
              <Trophy className="h-3.5 w-3.5" />
              {t("menu.leaderboard")}
            </button>
            <button
              onClick={() => {
                play("click", { category: "ui" });
                handleLogout();
              }}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs text-rose-200/70 transition hover:bg-rose-300/[0.06] hover:text-rose-100 disabled:opacity-40"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? t("common.loading") : t("menu.logout")}
            </button>
          </div>
        </motion.div>
      )}

      {isGuestMode && (
        <motion.button
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setScene("menu")}
          className="absolute right-6 top-5 z-20 flex items-center gap-3 rounded-full border border-cyan-200/15 bg-black/30 px-4 py-2.5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-cyan-200/30 hover:bg-white/[0.05]"
        >
          <LogIn className="h-4 w-4 text-cyan-100/80" />
          <span className="text-left">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Account
            </span>
            <span className="block text-xs font-semibold">
              {t("mainMenu.login")}
            </span>
          </span>
        </motion.button>
      )}

      <main className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.7)]" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Mission systems online
          </span>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-[min(80vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/[0.055] blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[min(80vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/[0.06]" />

          <p className="relative text-[10px] font-semibold uppercase tracking-[0.52em] text-cyan-100/45 sm:text-[11px]">
            Explore · Discover · Learn
          </p>

          <h1 className="font-display relative mt-4 text-6xl font-bold leading-none tracking-[-0.05em] text-white drop-shadow-[0_8px_50px_rgba(103,232,249,0.12)] sm:text-8xl">
            SOLAR
            <span className="block text-white/90">QUEST</span>
          </h1>

          <div className="mx-auto mt-5 h-px w-36 bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />

          <div className="mt-6 text-sm text-white/50 sm:text-base">
            <TextType
              text={[
                t("mainMenu.welcome1"),
                t("mainMenu.welcome2"),
                t("mainMenu.welcome3"),
              ]}
              typingSpeed={70}
              pauseDuration={2500}
              showCursor
              cursorCharacter="▋"
              deletingSpeed={28}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <Button
            onClick={() => {
              play("click", { category: "ui" });
              handleStart("warp");
            }}
          >
            {t("mainMenu.startExplore")}
            <ArrowRight className="h-4 w-4 text-cyan-100/80 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>

          <button
            onClick={() => {
              play("click", { category: "ui" });
              handleStart("game");
            }}
            className="rounded-full px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.26em] text-white/35 transition hover:text-white/75"
          >
            {t("mainMenu.aboutUs")}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[9px] font-medium uppercase tracking-[0.2em] text-white/25"
        >
          <span>8 planets</span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span>NASA data</span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span>AI companion</span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span>Interactive missions</span>
        </motion.div>
      </main>

      <div className="pointer-events-none absolute bottom-6 right-6 z-10 hidden text-right sm:block">
        <p className="text-[9px] uppercase tracking-[0.24em] text-white/20">
          Solar Quest
        </p>
        <p className="mt-1 text-[9px] font-mono tracking-[0.12em] text-white/15">
          EXPEDITION SYSTEM · 01
        </p>
      </div>

      <LanguageToggle />
      <AudioSettings />
    </motion.div>
  );
}
