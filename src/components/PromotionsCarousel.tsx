import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronLeft, ChevronRight, MessageCircle, Phone, Clock } from 'lucide-react';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  product: string;
  validUntil: string;
  bgGradient: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: 'THUNDER 20% OFF! ⚡',
    description: 'द्राक्ष मण्यांची एकसमान वाढ मिळवा',
    discount: '20%',
    product: 'THUNDER',
    validUntil: '31 जानेवारी',
    bgGradient: 'from-harvest-gold via-sunrise-orange to-harvest-gold',
  },
  {
    id: 2,
    title: 'TANGENT सुपर ऑफर 🍇',
    description: 'फुलोरा बूस्टर - आता विशेष किंमतीत',
    discount: '15%',
    product: 'TANGENT',
    validUntil: '15 फेब्रुवारी',
    bgGradient: 'from-secondary via-leaf-green to-secondary',
  },
  {
    id: 3,
    title: 'कॉम्बो पॅक ऑफर 🎁',
    description: 'THUNDER + TANGENT एकत्र खरेदीवर',
    discount: '25%',
    product: 'कॉम्बो',
    validUntil: '28 फेब्रुवारी',
    bgGradient: 'from-primary via-secondary to-primary',
  },
];

export const PromotionsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
    setAutoPlay(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
    setAutoPlay(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">विशेष ऑफर्स</h2>
      </div>

      <div className="relative">
        {/* Carousel */}
        <div className="overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className={`bg-gradient-to-r ${promotions[currentIndex].bgGradient} p-6 text-white relative min-h-[200px]`}
            >
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

              <div className="relative z-10">
                {/* Discount Badge */}
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <span className="text-2xl font-bold">{promotions[currentIndex].discount}</span>
                  <span className="text-sm ml-1">सूट</span>
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  {promotions[currentIndex].title}
                </h3>
                <p className="text-white/90 mb-4">
                  {promotions[currentIndex].description}
                </p>

                {/* Valid Until */}
                <div className="flex items-center gap-2 text-sm text-white/80 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>वैध: {promotions[currentIndex].validUntil} पर्यंत</span>
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

        {/* Dots Indicator */}
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
      </div>
    </div>
  );
};
