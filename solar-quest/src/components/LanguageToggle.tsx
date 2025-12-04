import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  const handleToggle = () => {
    changeLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 group"
      aria-label="Change language"
    >
      <Globe className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
      <span className="text-white font-medium uppercase">
        {language === 'en' ? '🇬🇧 EN' : '🇻🇳 VI'}
      </span>
    </button>
  );
};

export default LanguageToggle;
