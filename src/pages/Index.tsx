import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@/components/SplashScreen';
import { AppHeader } from '@/components/AppHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { DashboardView } from '@/components/DashboardView';
import { ProductsGrid } from '@/components/ProductsGrid';
import { LanguageSelectionScreen } from '@/components/onboarding/LanguageSelectionScreen';
import { CropSelectionScreen } from '@/components/onboarding/CropSelectionScreen';
import { PhoneLoginScreen } from '@/components/auth/PhoneLoginScreen';
import { AIAssistantScreen } from '@/components/screens/AIAssistantScreen';
import { ContactScreen } from '@/components/screens/ContactScreen';
import { NotificationsScreen } from '@/components/screens/NotificationsScreen';
import { VideosScreen } from '@/components/screens/VideosScreen';
import { useApp } from '@/contexts/AppContext';

type OnboardingStep = 'splash' | 'language' | 'crop' | 'login' | 'main';

const Index = () => {
  const { language, setLanguage, selectedCrop, trackInteraction, activeTab, setActiveTab } = useApp();
  const [step, setStep] = useState<OnboardingStep>('splash');

  // Check if onboarding is complete
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    if (onboardingComplete === 'true' && selectedCrop) {
      setStep('main');
    }
  }, [selectedCrop]);

  const handleSplashComplete = () => {
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    if (onboardingComplete === 'true' && selectedCrop) {
      setStep('main');
    } else {
      setStep('language');
    }
  };

  const handleLanguageComplete = () => {
    setStep('crop');
  };

  const handleCropComplete = () => {
    setStep('login');
  };

  const handleLoginComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    trackInteraction('onboarding', 'complete', { authenticated: true });
    setStep('main');
  };

  const handleLoginSkip = () => {
    localStorage.setItem('onboarding_complete', 'true');
    trackInteraction('onboarding', 'complete', { authenticated: false, skipped: true });
    setStep('main');
  };

  const handleLanguageBack = () => {
    setStep('language');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardView />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'videos':
        return <VideosScreen />;
      case 'products':
        return <ProductsGrid />;
      case 'contact':
        return <ContactScreen />;
      default:
        return <DashboardView />;
    }
  };

  // Render onboarding steps
  if (step === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (step === 'language') {
    return <LanguageSelectionScreen onComplete={handleLanguageComplete} />;
  }

  if (step === 'crop') {
    return <CropSelectionScreen onComplete={handleCropComplete} onBack={handleLanguageBack} />;
  }

  if (step === 'login') {
    return <PhoneLoginScreen onComplete={handleLoginComplete} onSkip={handleLoginSkip} />;
  }

  // Main app
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
      />
    </div>
  );
};

export default Index;
