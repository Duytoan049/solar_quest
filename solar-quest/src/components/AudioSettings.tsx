import { useAudio } from "@/hooks/useAudio";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AudioSettings() {
  const {
    isMuted,
    toggleMute,
    setMasterVolume,
    setMusicVolume,
    setSFXVolume,
  } = useAudio();

  const [isOpen, setIsOpen] = useState(false);

  // Get current volumes from localStorage
  const masterVolume = parseFloat(
    localStorage.getItem("audio_master_volume") || "0.7"
  );
  const musicVolume = parseFloat(
    localStorage.getItem("audio_music_volume") || "0.5"
  );
  const sfxVolume = parseFloat(
    localStorage.getItem("audio_sfx_volume") || "0.8"
  );

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-black/80 backdrop-blur-md rounded-full border border-white/20 
          hover:bg-white/10 transition-all shadow-lg"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-gray-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-0 w-64 bg-black/90 backdrop-blur-md rounded-lg 
              border border-white/20 p-4 shadow-2xl"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio Settings
            </h3>

            {/* Master Volume */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Master</span>
                <span className="text-white font-semibold">
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume * 100}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value) / 100)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                  slider-thumb"
              />
            </div>

            {/* Music Volume */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Music</span>
                <span className="text-white font-semibold">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume * 100}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value) / 100)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                  slider-thumb"
              />
            </div>

            {/* SFX Volume */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Sound Effects</span>
                <span className="text-white font-semibold">
                  {Math.round(sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume * 100}
                onChange={(e) => setSFXVolume(parseFloat(e.target.value) / 100)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                  slider-thumb"
              />
            </div>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`w-full py-2 rounded-lg font-semibold transition-all ${
                isMuted
                  ? "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30"
                  : "bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
              }`}
            >
              {isMuted ? "🔇 Unmute All" : "🔊 Mute All"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(102, 126, 234, 0.6);
        }

        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(102, 126, 234, 0.6);
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          box-shadow: 0 0 12px rgba(102, 126, 234, 0.9);
        }

        .slider-thumb::-moz-range-thumb:hover {
          box-shadow: 0 0 12px rgba(102, 126, 234, 0.9);
        }
      `}</style>
    </div>
  );
}
