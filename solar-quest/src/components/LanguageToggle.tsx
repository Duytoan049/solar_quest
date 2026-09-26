import React from "react";
import { Globe2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageToggle: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <button
      onClick={() => changeLanguage(language === "en" ? "vi" : "en")}
      aria-label="Change language"
      className="fixed bottom-5 left-[72px] z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3.5 py-2.5 text-white/80 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-200/30 hover:bg-white/[0.06] hover:text-white"
    >
      <Globe2 className="h-4 w-4 text-cyan-200/80" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
        {language === "en" ? "EN" : "VI"}
      </span>
    </button>
  );
};

export default LanguageToggle;
