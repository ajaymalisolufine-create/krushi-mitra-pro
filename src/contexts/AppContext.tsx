import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  selectedCrops: string[];
  setSelectedCrops: (crops: string[]) => void;
  selectedCrop: string | null; // Legacy support - returns first crop
  setSelectedCrop: (crop: string | null) => void;
  user: User | null;
  phone: string | null;
  setPhone: (phone: string | null) => void;
  pincode: string | null;
  setPincode: (pincode: string | null) => void;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  trackInteraction: (screenName: string, interactionType: string, data?: Record<string, unknown>) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'mr');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(() => {
    const saved = localStorage.getItem('selected_crops');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to legacy single crop
        const legacyCrop = localStorage.getItem('selected_crop');
        return legacyCrop ? [legacyCrop] : [];
      }
    }
    const legacyCrop = localStorage.getItem('selected_crop');
    return legacyCrop ? [legacyCrop] : [];
  });
  const [user, setUser] = useState<User | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [pincode, setPincodeState] = useState<string | null>(() => localStorage.getItem('user_pincode'));
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
    if (selectedCrops.length > 0) {
      localStorage.setItem('selected_crops', JSON.stringify(selectedCrops));
      localStorage.setItem('selected_crop', selectedCrops[0]); // Legacy support
    } else {
      localStorage.removeItem('selected_crops');
      localStorage.removeItem('selected_crop');
    }
  }, [selectedCrops]);

  const setPincode = (newPincode: string | null) => {
    setPincodeState(newPincode);
    if (newPincode) {
      localStorage.setItem('user_pincode', newPincode);
    } else {
      localStorage.removeItem('user_pincode');
    }
  };

  // Legacy support for single crop selection
  const selectedCrop = selectedCrops.length > 0 ? selectedCrops[0] : null;
  const setSelectedCrop = (crop: string | null) => {
    if (crop) {
      setSelectedCrops([crop]);
    } else {
      setSelectedCrops([]);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPhone(null);
    setPincode(null);
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
      selectedCrops,
      setSelectedCrops,
      selectedCrop,
      setSelectedCrop,
      user,
      phone,
      setPhone,
      pincode,
      setPincode,
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