import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

interface LanguageToggleProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageToggle = ({ currentLang, onLanguageChange }: LanguageToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card shadow-card border border-border"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-2 bg-card rounded-xl shadow-card-hover border border-border overflow-hidden z-50 min-w-[140px]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                currentLang === lang.code ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};
