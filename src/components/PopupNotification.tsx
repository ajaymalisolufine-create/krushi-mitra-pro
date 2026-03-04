import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ArrowRight } from 'lucide-react';
import { useActivePopupNotifications, type Notification } from '@/hooks/useNotifications';
import { useApp } from '@/contexts/AppContext';

const SEEN_POPUPS_KEY = 'seen_popup_notifications';

const getSeenPopups = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_POPUPS_KEY) || '[]');
  } catch {
    return [];
  }
};

const markPopupSeen = (id: string) => {
  const seen = getSeenPopups();
  if (!seen.includes(id)) {
    seen.push(id);
    localStorage.setItem(SEEN_POPUPS_KEY, JSON.stringify(seen));
  }
};

const getCTALabel = (category: string | null, language: string) => {
  if (language === 'mr') {
    switch (category) {
      case 'video': return 'व्हिडिओ पहा';
      case 'offer': return 'ऑफर पहा';
      case 'news': return 'बातमी वाचा';
      default: return 'अधिक जाणून घ्या';
    }
  }
  switch (category) {
    case 'video': return 'Watch Video';
    case 'offer': return 'View Offer';
    case 'news': return 'Read More';
    default: return 'Know More';
  }
};

const getRedirectTab = (category: string | null): string => {
  switch (category) {
    case 'video': return 'videos';
    case 'offer': return 'updates';
    case 'news': return 'updates';
    default: return 'updates';
  }
};

export const PopupNotification = () => {
  const { data: popups = [] } = useActivePopupNotifications();
  const { language, setActiveTab } = useApp();
  const [currentPopup, setCurrentPopup] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (popups.length === 0) return;
    const seen = getSeenPopups();
    const unseen = popups.find(p => !seen.includes(p.id));
    if (unseen) {
      setCurrentPopup(unseen);
      setVisible(true);
    }
  }, [popups]);

  const handleClose = () => {
    if (currentPopup) markPopupSeen(currentPopup.id);
    setVisible(false);
    setCurrentPopup(null);
  };

  const handleCTA = () => {
    if (currentPopup) {
      markPopupSeen(currentPopup.id);
      setActiveTab(getRedirectTab(currentPopup.category));
    }
    setVisible(false);
    setCurrentPopup(null);
  };

  return (
    <AnimatePresence>
      {visible && currentPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-border/50"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            {currentPopup.image_url && (
              <div className="w-full h-44 overflow-hidden">
                <img
                  src={currentPopup.image_url}
                  alt={currentPopup.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent capitalize">
                    {currentPopup.category || 'update'}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-foreground leading-tight">
                {currentPopup.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentPopup.message}
              </p>

              <button
                onClick={handleCTA}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                {getCTALabel(currentPopup.category, language)}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
