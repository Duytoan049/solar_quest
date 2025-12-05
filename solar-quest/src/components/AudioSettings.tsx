import { useAudio } from "@/hooks/useAudio";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function AudioSettings() {
  const { isMuted, toggleMute } = useAudio();

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
        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
        <span className="text-sm font-semibold">
          {isMuted ? "Âm thanh: Tắt" : "Âm thanh: Bật"}
        </span>
      </motion.button>
    </div>
  );
}
