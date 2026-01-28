import { motion } from 'framer-motion';
import { Globe, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const languages = [
  { code: 'mr', name: 'मराठी', nameEn: 'Marathi', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', nameEn: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'English', nameEn: 'English', flag: '🇬🇧' },
];

interface LanguageSelectionScreenProps {
  onComplete: () => void;
}

export const LanguageSelectionScreen = ({ onComplete }: LanguageSelectionScreenProps) => {
  const { language, setLanguage, trackInteraction } = useApp();

  const handleLanguageSelect = async (langCode: string) => {
    // Update localStorage directly for immediate persistence
    localStorage.setItem('app_language', langCode);
    // Update context state
    setLanguage(langCode);
    // Track the interaction
    await trackInteraction('language_selection', 'select_language', { language: langCode });
    // Proceed to next screen
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-white rounded-full" />
        <div className="absolute bottom-32 left-20 w-16 h-16 border-2 border-white rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <Globe className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">भाषा निवडा</h1>
        <p className="text-white/80">Select your preferred language</p>
      </motion.div>

      <div className="w-full max-w-sm space-y-3">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onClick={() => handleLanguageSelect(lang.code)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
              language === lang.code
                ? 'bg-white text-primary shadow-glow'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left">
                <p className="font-semibold">{lang.name}</p>
                <p className="text-sm opacity-70">{lang.nameEn}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
