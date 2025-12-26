import { useAudio } from "@/hooks/useAudio";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function AudioSettings() {
  const { isMuted, toggleMute } = useAudio();
  const { t, i18n } = useTranslation();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMute}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all shadow-lg 
          ${
            isMuted
              ? "bg-red-600/20 border-red-500/40 text-red-200"
              : "bg-black/80 border-white/20 text-white"
          }`}
        title={isMuted ? t("settings.enableAudio") : t("settings.disableAudio")}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
        <span className="text-sm font-semibold">
          {isMuted ? t("settings.soundOff") : t("settings.soundOn")}
        </span>
      </motion.button>
    </div>
  );
}
