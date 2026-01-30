import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
interface AppHeaderProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}
export const AppHeader = ({
  language,
  onLanguageChange
}: AppHeaderProps) => {
  return <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Logo */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-card">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-primary leading-tight">Solufine Agritec</h1>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight">Krushi Mitra</p>
          </div>
        </motion.div>

        {/* Language Toggle */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }}>
          <LanguageToggle currentLang={language} onLanguageChange={onLanguageChange} />
        </motion.div>
      </div>
    </header>;
};