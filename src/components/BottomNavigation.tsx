import { motion } from 'framer-motion';
import { Home, Package, PlayCircle, Tag, Bell, LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  labelMr: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: Home, label: 'Home', labelMr: 'होम' },
  { id: 'products', icon: Package, label: 'Products', labelMr: 'उत्पादने' },
  { id: 'videos', icon: PlayCircle, label: 'Videos', labelMr: 'व्हिडिओ' },
  { id: 'promotions', icon: Tag, label: 'Offers', labelMr: 'ऑफर' },
  { id: 'notifications', icon: Bell, label: 'Alerts', labelMr: 'सूचना' },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: string;
}

export const BottomNavigation = ({ activeTab, onTabChange, language }: BottomNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-card z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
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
                {language === 'mr' ? item.labelMr : item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
