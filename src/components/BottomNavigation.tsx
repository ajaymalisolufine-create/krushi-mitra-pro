import { motion } from 'framer-motion';
import { Home, Package, Bot, Phone, LucideIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface NavItem {
  id: string;
  icon: LucideIcon;
  labelMr: string;
  labelHi: string;
  labelEn: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: Home, labelMr: 'होम', labelHi: 'होम', labelEn: 'Home' },
  { id: 'ai', icon: Bot, labelMr: 'AI', labelHi: 'AI', labelEn: 'AI' },
  { id: 'products', icon: Package, labelMr: 'उत्पादने', labelHi: 'उत्पाद', labelEn: 'Products' },
  { id: 'contact', icon: Phone, labelMr: 'संपर्क', labelHi: 'संपर्क', labelEn: 'Contact' },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const { language, trackInteraction } = useApp();

  const getLabel = (item: NavItem) => {
    switch (language) {
      case 'mr': return item.labelMr;
      case 'hi': return item.labelHi;
      default: return item.labelEn;
    }
  };

  const handleTabChange = async (tabId: string) => {
    await trackInteraction('navigation', 'tab_change', { from: activeTab, to: tabId });
    onTabChange(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-card z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-hero rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon 
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-[10px] font-medium relative z-10 transition-colors ${
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {getLabel(item)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
