import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  selectedCrop: string | null;
  setSelectedCrop: (crop: string | null) => void;
  user: User | null;
  phone: string | null;
  setPhone: (phone: string | null) => void;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  trackInteraction: (screenName: string, interactionType: string, data?: Record<string, unknown>) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'mr');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(() => localStorage.getItem('selected_crop'));
  const [user, setUser] = useState<User | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Set up auth listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.phone) {
        setPhone(session.user.phone);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.phone) {
        setPhone(session.user.phone);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  useEffect(() => {
    if (selectedCrop) {
      localStorage.setItem('selected_crop', selectedCrop);
    } else {
      localStorage.removeItem('selected_crop');
    }
  }, [selectedCrop]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPhone(null);
  };

  const trackInteraction = async (screenName: string, interactionType: string, data?: Record<string, unknown>) => {
    try {
      await supabase.from('lead_interactions').insert([{
        user_id: user?.id || undefined,
        phone: phone || undefined,
        language,
        selected_crop: selectedCrop || undefined,
        screen_name: screenName,
        interaction_type: interactionType,
        interaction_data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      }]);
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      selectedCrop,
      setSelectedCrop,
      user,
      phone,
      setPhone,
      isAuthenticated: !!user,
      signOut,
      trackInteraction,
      activeTab,
      setActiveTab,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
