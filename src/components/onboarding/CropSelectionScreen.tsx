import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, ChevronRight, Grape, Wheat, Leaf, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const crops = [
  { id: 'grapes', nameEn: 'Grapes', nameMr: 'द्राक्षे', nameHi: 'अंगूर', icon: Grape, color: 'from-purple-500 to-purple-700' },
  { id: 'chickpea', nameEn: 'Chickpea', nameMr: 'हरभरा', nameHi: 'चना', icon: Wheat, color: 'from-harvest-gold to-sunrise-orange' },
  { id: 'cotton', nameEn: 'Cotton', nameMr: 'कापूस', nameHi: 'कपास', icon: Leaf, color: 'from-sky-blue to-blue-500' },
  { id: 'sugarcane', nameEn: 'Sugarcane', nameMr: 'ऊस', nameHi: 'गन्ना', icon: Sprout, color: 'from-secondary to-leaf-green' },
  { id: 'pomegranate', nameEn: 'Pomegranate', nameMr: 'डाळिंब', nameHi: 'अनार', icon: Grape, color: 'from-red-500 to-rose-600' },
  { id: 'onion', nameEn: 'Onion', nameMr: 'कांदा', nameHi: 'प्याज', icon: Leaf, color: 'from-primary to-secondary' },
];

interface CropSelectionScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export const CropSelectionScreen = ({ onComplete, onBack }: CropSelectionScreenProps) => {
  const { language, selectedCrops, setSelectedCrops, trackInteraction } = useApp();
  const [localCrops, setLocalCrops] = useState<string[]>(selectedCrops);

  const getCropName = (crop: typeof crops[0]) => {
    switch (language) {
      case 'mr': return crop.nameMr;
      case 'hi': return crop.nameHi;
      default: return crop.nameEn;
    }
  };

  const getTitle = () => {
    switch (language) {
      case 'mr': return 'आपली पिके निवडा';
      case 'hi': return 'अपनी फसलें चुनें';
      default: return 'Select Your Crops';
    }
  };

  const getSubtitle = () => {
    switch (language) {
      case 'mr': return 'एक किंवा अधिक पिके निवडा';
      case 'hi': return 'एक या अधिक फसलें चुनें';
      default: return 'Select one or more crops';
    }
  };

  const getContinueText = () => {
    switch (language) {
      case 'mr': return 'पुढे जा';
      case 'hi': return 'आगे बढ़ें';
      default: return 'Continue';
    }
  };

  const toggleCrop = (cropId: string) => {
    if (localCrops.includes(cropId)) {
      setLocalCrops(localCrops.filter(c => c !== cropId));
    } else {
      setLocalCrops([...localCrops, cropId]);
    }
  };

  const handleContinue = async () => {
    if (localCrops.length > 0) {
      setSelectedCrops(localCrops);
      await trackInteraction('crop_selection', 'select_crops', { crops: localCrops });
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sunrise flex flex-col p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 pt-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-card"
        >
          <Sprout className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-xl font-bold text-foreground mb-2">{getTitle()}</h1>
        <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
        {localCrops.length > 0 && (
          <p className="text-sm text-primary mt-2 font-medium">
            {localCrops.length} {language === 'mr' ? 'पिके निवडली' : language === 'hi' ? 'फसलें चुनी' : 'crops selected'}
          </p>
        )}
      </motion.div>

      {/* Crop Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
        {crops.map((crop, index) => {
          const Icon = crop.icon;
          const isSelected = localCrops.includes(crop.id);
          return (
            <motion.button
              key={crop.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => toggleCrop(crop.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-card'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${crop.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {getCropName(crop)}
              </p>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 max-w-sm mx-auto w-full space-y-3"
      >
        <Button
          onClick={handleContinue}
          disabled={localCrops.length === 0}
          className="w-full h-14 text-lg font-semibold bg-gradient-hero hover:opacity-90 transition-opacity"
        >
          {getContinueText()}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full text-muted-foreground"
        >
          ← {language === 'mr' ? 'मागे' : language === 'hi' ? 'पीछे' : 'Back'}
        </Button>
      </motion.div>
    </div>
  );
};