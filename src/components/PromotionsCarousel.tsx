import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronLeft, ChevronRight, MessageCircle, Phone, Clock, Loader2, X } from 'lucide-react';
import { useActivePromotions } from '@/hooks/usePromotions';
import { format } from 'date-fns';

const gradients = [
  'from-harvest-gold via-sunrise-orange to-harvest-gold',
  'from-secondary via-leaf-green to-secondary',
  'from-primary via-secondary to-primary',
  'from-sky-blue via-secondary to-sky-blue',
];

export const PromotionsCarousel = () => {
  const { data: promotions = [], isLoading } = useActivePromotions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);

  useEffect(() => {
    if (!autoPlay || promotions.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, promotions.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
    setAutoPlay(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
    setAutoPlay(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">विशेष ऑफर्स</h2>
        </div>
        <div className="flex items-center justify-center h-48 bg-muted rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">विशेष ऑफर्स</h2>
        </div>
        <div className="flex items-center justify-center h-48 bg-muted rounded-2xl">
          <p className="text-muted-foreground">No active promotions</p>
        </div>
      </div>
    );
  }

  const currentPromo = promotions[currentIndex];
  const bgGradient = gradients[currentIndex % gradients.length];

  return (
    <div className="space-y-4">
      {/* Promo Detail Modal */}
      <AnimatePresence>
        {selectedPromo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setSelectedPromo(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
            >
              {selectedPromo.image_url && (
                <img src={selectedPromo.image_url} alt={selectedPromo.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {selectedPromo.discount && (
                    <span className="px-4 py-2 bg-primary text-primary-foreground text-lg font-bold rounded-full">{selectedPromo.discount}</span>
                  )}
                  <button onClick={() => setSelectedPromo(null)} className="p-2 rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-lg font-bold mb-2">{selectedPromo.title}</h2>
                {selectedPromo.description && <p className="text-muted-foreground mb-4">{selectedPromo.description}</p>}
                {selectedPromo.valid_until && (
                  <p className="text-xs text-secondary font-medium mb-4 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    वैध: {format(new Date(selectedPromo.valid_until), 'dd MMM yyyy')} पर्यंत
                  </p>
                )}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp शेअर
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-full font-medium text-sm">
                    <Phone className="w-4 h-4" />
                    विक्रेता संपर्क
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">विशेष ऑफर्स</h2>
      </div>

      <div className="relative">
        {/* Carousel */}
        <div className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => setSelectedPromo(currentPromo)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className={`bg-gradient-to-r ${bgGradient} p-6 text-white relative min-h-[200px]`}
            >
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

              <div className="relative z-10">
                {/* Discount Badge */}
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <span className="text-2xl font-bold">{currentPromo.discount}</span>
                  <span className="text-sm ml-1">सूट</span>
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  {currentPromo.title}
                </h3>
                <p className="text-white/90 mb-4">
                  {currentPromo.description}
                </p>

                {/* Valid Until */}
                <div className="flex items-center gap-2 text-sm text-white/80 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>
                    वैध: {currentPromo.valid_until 
                      ? format(new Date(currentPromo.valid_until), 'dd MMM yyyy') 
                      : 'No end date'} पर्यंत
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-full font-medium text-sm shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp शेअर
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    विक्रेता संपर्क
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {promotions.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoPlay(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-6 bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
