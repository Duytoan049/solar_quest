// Ví dụ: Cách cập nhật MainMenu với i18n
// File: src/features/menu/MainMenu.tsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // THÊM DÒNG NÀY
import Button from "../../ui/Button";
import Galaxy from "../../ui/Galaxy";
import TextType from "../../ui/TextType";
import { useGameManager } from "@/core/engine/GameContext";
import { motion } from "framer-motion";
import type { SceneType } from "@/core/engine/types";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Trophy, Rocket, LogIn } from "lucide-react";

export default function MainMenu() {
  const { t } = useTranslation(); // THÊM DÒNG NÀY
  const [exit, setExit] = useState(false);
  const [nextScene, setNextScene] = useState<SceneType | null>(null);
  const { setScene, preloadSolarSystem, isSolarSystemLoaded, sceneParams } =
    useGameManager();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isGuestMode = !user && sceneParams?.guestMode === true;

  const handleLogout = async () => {
    // THAY ĐỔI: Sử dụng t() thay vì text cứng
    if (confirm(t("auth.confirmLogout") || "Bạn có chắc muốn đăng xuất?")) {
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

  // ... rest of the code

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <Galaxy />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* THAY ĐỔI: Title với i18n */}
        <TextType
          text={t("menu.title")} // Thay vì "SOLAR QUEST"
          className="mb-8 text-center text-6xl font-bold md:text-8xl"
          delay={50}
        />

        {/* Buttons với i18n */}
        <div className="mt-8 flex flex-col gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleStart("warp")}
            className="min-w-[200px]"
          >
            <Rocket className="mr-2 h-5 w-5" />
            {t("menu.start")} {/* Thay vì "Start Journey" */}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => setScene("profile")}
            className="min-w-[200px]"
          >
            <User className="mr-2 h-5 w-5" />
            {t("menu.profile")} {/* Thay vì "Profile" */}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => setScene("leaderboard")}
            className="min-w-[200px]"
          >
            <Trophy className="mr-2 h-5 w-5" />
            {t("menu.leaderboard")} {/* Thay vì "Leaderboard" */}
          </Button>

          {user && !isGuestMode && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="min-w-[200px]"
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isLoggingOut ? t("common.loading") : t("menu.logout")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// VÍ DỤ 2: Component với form input
// ============================================

import { useTranslation } from "react-i18next";

function LoginForm() {
  const { t } = useTranslation();

  return (
    <form className="space-y-4">
      <div>
        <label className="block mb-2">{t("auth.email")}</label>
        <input
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-2">{t("auth.password")}</label>
        <input
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        {t("auth.login")}
      </button>

      <p className="text-center text-sm">
        {t("auth.noAccount")}{" "}
        <a href="/register" className="text-blue-500">
          {t("auth.register")}
        </a>
      </p>
    </form>
  );
}

// ============================================
// VÍ DỤ 3: Component với conditional rendering
// ============================================

function ArtifactCard({ artifact }) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="artifact-card p-4 border rounded">
      <h3 className="text-xl font-bold mb-2">
        {/* Hiển thị tên theo ngôn ngữ */}
        {language === "vi" ? artifact.nameVi : artifact.nameEn}
      </h3>

      <p className="text-gray-600 mb-2">
        {t("artifact.rarity")}: {t(`artifact.${artifact.rarity}`)}
      </p>

      <p className="mb-4">
        {language === "vi" ? artifact.descriptionVi : artifact.descriptionEn}
      </p>

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        {t("artifact.viewDetails")}
      </button>
    </div>
  );
}

// ============================================
// VÍ DỤ 4: Component với dynamic values
// ============================================

function ScoreDisplay({ score, artifacts, planets }) {
  const { t } = useTranslation();

  return (
    <div className="score-panel">
      <h2>{t("profile.statistics")}</h2>

      <div className="stat-item">
        <span>{t("profile.totalScore")}:</span>
        <span className="font-bold">{score.toLocaleString()}</span>
      </div>

      <div className="stat-item">
        <span>{t("artifact.total")}:</span>
        <span className="font-bold">{artifacts}</span>
      </div>

      <div className="stat-item">
        <span>{t("leaderboard.planetsVisited")}:</span>
        <span className="font-bold">{planets}</span>
      </div>
    </div>
  );
}

// ============================================
// VÍ DỤ 5: Component với array mapping
// ============================================

function PlanetList({ planets }) {
  const { t } = useTranslation();

  return (
    <div className="planet-list">
      <h2 className="text-2xl font-bold mb-4">{t("planet.explore")}</h2>

      {planets.map((planet) => (
        <div key={planet.id} className="planet-item mb-4 p-4 border rounded">
          <h3 className="text-xl font-bold">{planet.name}</h3>

          <div className="planet-info mt-2 space-y-1">
            <p>
              <strong>{t("planet.diameter")}:</strong> {planet.diameter}
            </p>
            <p>
              <strong>{t("planet.distance")}:</strong> {planet.distance}
            </p>
            <p>
              <strong>{t("planet.moons")}:</strong> {planet.moons}
            </p>
          </div>

          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            {t("planet.explore")}
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// VÍ DỤ 6: Toast/Notification với i18n
// ============================================

import toast from "react-hot-toast";

function GameActions() {
  const { t } = useTranslation();

  const handleCollectArtifact = () => {
    // Success notification
    toast.success(t("artifact.found"));
  };

  const handleError = () => {
    // Error notification
    toast.error(t("common.error"));
  };

  const handleSave = () => {
    // Info notification
    toast.success(t("common.save") + " " + t("common.success"));
  };

  return (
    <div>
      <button onClick={handleCollectArtifact}>{t("artifact.collect")}</button>
    </div>
  );
}

// ============================================
// VÍ DỤ 7: Modal với i18n
// ============================================

function ConfirmDialog({ onConfirm, onCancel, message }) {
  const { t } = useTranslation();

  return (
    <div className="modal">
      <div className="modal-content p-6">
        <h3 className="text-xl font-bold mb-4">{t("common.confirm")}</h3>

        <p className="mb-6">{message}</p>

        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {t("common.confirm")}
          </button>

          <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
