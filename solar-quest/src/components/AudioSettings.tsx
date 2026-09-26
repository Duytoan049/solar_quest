import { useAudio } from "@/hooks/useAudio";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function AudioSettings() {
  const { isMuted, toggleMute } = useAudio();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={toggleMute}
        aria-label={isMuted ? t("settings.enableAudio") : t("settings.disableAudio")}
        title={isMuted ? t("settings.enableAudio") : t("settings.disableAudio")}
        className={`group flex items-center gap-2.5 rounded-full border px-3.5 py-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 ${
          isMuted
            ? "border-rose-300/20 bg-rose-300/[0.06] text-rose-200 hover:border-rose-300/35"
            : "border-white/10 bg-black/35 text-white/85 hover:border-white/20 hover:bg-white/[0.06]"
        }`}
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${
          isMuted
            ? "border-rose-300/20 bg-rose-300/10"
            : "border-cyan-200/15 bg-cyan-200/[0.05]"
        }`}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] sm:block">
          {isMuted ? t("settings.soundOff") : t("settings.soundOn")}
        </span>
      </motion.button>
    </div>
  );
}
