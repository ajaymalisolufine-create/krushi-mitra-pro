import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useActiveBanners } from '@/hooks/useBanners';
import { useApp } from '@/contexts/AppContext';

export const BannerCarousel = () => {
  const { data: banners = [], isLoading } = useActiveBanners();
  const { setActiveTab } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentIndex((prev) => (prev + 1) % banners.length);
      else setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
    setTouchStart(null);
  }, [touchStart, banners.length]);

  const handleBannerClick = (redirectType: string, redirectTarget: string | null) => {
    if (!redirectType || redirectType === 'none') return;
    
    const tabMap: Record<string, string> = {
      news: 'notifications',
      offers: 'notifications',
      notifications: 'notifications',
      videos: 'videos',
      products: 'products',
    };
    
    const tab = tabMap[redirectType];
    if (tab) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-44 bg-muted rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleBannerClick(currentBanner.redirect_type, currentBanner.redirect_target)}
            className="cursor-pointer relative"
          >
            <img
              src={currentBanner.image_url}
              alt={currentBanner.title}
              className="w-full h-44 object-cover rounded-2xl"
              loading="eager"
            />
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-2xl">
              <p className="text-white font-semibold text-sm">{currentBanner.title}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav arrows for desktop */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center z-10 hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center z-10 hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
