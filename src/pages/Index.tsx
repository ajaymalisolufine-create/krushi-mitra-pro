import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@/components/SplashScreen';
import { AppHeader } from '@/components/AppHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { DashboardView } from '@/components/DashboardView';
import { ProductsGrid } from '@/components/ProductsGrid';
import { VideosSection } from '@/components/VideosSection';
import { PromotionsCarousel } from '@/components/PromotionsCarousel';
import { NotificationsSection } from '@/components/NotificationsSection';
import { AIChatBot } from '@/components/AIChatBot';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('mr');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsGrid />;
      case 'videos':
        return <VideosSection />;
      case 'promotions':
        return <PromotionsCarousel />;
      case 'notifications':
        return <NotificationsSection />;
      default:
        return <DashboardView />;
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-sunrise pb-24">
      <AppHeader language={language} onLanguageChange={setLanguage} />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
      />

      <AIChatBot />
    </div>
  );
};

export default Index;
