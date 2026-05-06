import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, MapPin, Package, Zap, Sparkles, Shield, Droplet, Leaf, ShoppingBag, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useEnquire } from '@/hooks/useEnquire';
import { getTranslatedText } from '@/hooks/useTranslateContent';
import type { Product } from '@/hooks/useProducts';

const getProductIcon = (icon: string | null) => {
  switch (icon) {
    case 'zap': return Zap;
    case 'flower': case 'sparkles': return Sparkles;
    case 'shield': return Shield;
    case 'droplet': return Droplet;
    case 'leaf': return Leaf;
    default: return Package;
  }
};

const getProductGradient = (icon: string | null) => {
  switch (icon) {
    case 'zap': return 'from-harvest-gold to-sunrise-orange';
    case 'flower': case 'sparkles': return 'from-secondary to-leaf-green';
    case 'shield': return 'from-sky-blue to-secondary';
    case 'droplet': return 'from-sky-blue to-primary';
    default: return 'from-primary to-secondary';
  }
};

interface ProductDetailSheetProps {
  product: Product | null;
  onClose: () => void;
  onFindDealer?: () => void;
}

export const ProductDetailSheet = ({ product, onClose, onFindDealer }: ProductDetailSheetProps) => {
  const { language, setActiveTab } = useApp();
  const { enquire, isSubmitting: isEnquiring } = useEnquire();

  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
    }
  };

  const handleFindDealer = () => {
    onClose();
    onFindDealer?.();
    setActiveTab('contact');
  };

  const handleEnquireNow = async () => {
    if (!product) return;
    await enquire({
      sourceType: 'product',
      sourceId: product.id,
      sourceTitle: product.name,
      productId: product.id,
      productName: product.name,
      trackScreen: 'Product Enquiry',
    });
  };

  if (!product) return null;

  const ProductIcon = getProductIcon(product.icon);
  const hasImage = product.image_url && product.image_url.length > 0;

  // Get translated content
  const translations = (product as any).translations as Record<string, { title: string; message: string }> | null;
  const translated = getTranslatedText(translations, language, product.name, product.description || '');
  const displayDescription = translated.message || product.description;

  return (
    <AnimatePresence>
      {product && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}
            className="bg-card rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">{product.name}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                {hasImage ? (
                  <img src={product.image_url!} alt={product.name} className="w-24 h-24 rounded-2xl object-cover border border-border"
                    onError={e => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getProductGradient(product.icon)} flex items-center justify-center`}>
                    <ProductIcon className="w-12 h-12 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xl">{product.name}</h3>
                  <p className="text-muted-foreground">{product.tagline}</p>
                  {product.mrp > 0 && <p className="text-2xl font-bold text-primary mt-2">₹{product.mrp}</p>}
                </div>
              </div>

              {displayDescription && (
                <div>
                  <h4 className="font-semibold mb-2">{getText('वर्णन', 'विवरण', 'Description')}</h4>
                  <p className="text-sm text-muted-foreground">{displayDescription}</p>
                </div>
              )}

              {product.benefits && product.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">{getText('फायदे', 'लाभ', 'Benefits')}</h4>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" /><span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.dosage && (
                <div>
                  <h4 className="font-semibold mb-2">{getText('डोस', 'खुराक', 'Dosage')}</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-xl">{product.dosage}</p>
                </div>
              )}

              {product.crops && product.crops.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">{getText('योग्य पिके', 'उपयुक्त फसलें', 'Suitable Crops')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.crops.map(crop => (
                      <span key={crop} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">{crop}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleEnquireNow} disabled={isEnquiring}
                className="w-full py-3 bg-gradient-to-r from-harvest-gold to-sunrise-orange text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {isEnquiring ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                {getText('चौकशी करा', 'पूछताछ करें', 'Enquire Now')}
              </button>

              <button onClick={handleFindDealer}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                {getText('विक्रेता शोधा', 'विक्रेता खोजें', 'Find Dealer')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
