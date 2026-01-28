import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Star, Zap, Sparkles, Shield, Loader2, Droplet, Leaf, X, Check, ChevronDown } from 'lucide-react';
import { useProducts, type Product } from '@/hooks/useProducts';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

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

const cropMapping: Record<string, string[]> = {
  grapes: ['द्राक्षे', 'Grapes', 'अंगूर', 'Grape'],
  chickpea: ['हरभरा', 'Chickpea', 'चना'],
  cotton: ['कापूस', 'Cotton', 'कपास'],
  sugarcane: ['ऊस', 'Sugarcane', 'गन्ना'],
  pomegranate: ['डाळिंब', 'Pomegranate', 'अनार'],
  onion: ['कांदा', 'Onion', 'प्याज'],
};

const categories = [
  { key: 'all', mr: 'सर्व', hi: 'सभी', en: 'All' },
  { key: 'biostimulants', mr: 'जैव-उत्तेजक', hi: 'जैव-उत्तेजक', en: 'Biostimulants' },
  { key: 'fertilizers', mr: 'खते', hi: 'उर्वरक', en: 'Fertilizers' },
  { key: 'pesticides', mr: 'कीटकनाशके', hi: 'कीटनाशक', en: 'Pesticides' },
];

const indianStates = [
  'Maharashtra', 'Karnataka', 'Gujarat', 'Madhya Pradesh', 'Rajasthan',
  'Punjab', 'Uttar Pradesh', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana',
];

interface ProductsGridProps {
  onProductClick?: (product: Product) => void;
}

export const ProductsGrid = ({ onProductClick }: ProductsGridProps) => {
  const { data: products = [], isLoading } = useProducts();
  const { language, selectedCrop, trackInteraction } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [showStateSelector, setShowStateSelector] = useState(false);

  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
    }
  };

  // Filter products based on selected crop, category, and state
  const filteredProducts = products
    .filter(p => p.status === 'active')
    .filter(p => {
      if (!selectedCrop) return true;
      const cropNames = cropMapping[selectedCrop] || [];
      return p.crops?.some(productCrop => 
        cropNames.some(name => productCrop.toLowerCase().includes(name.toLowerCase()))
      ) ?? true;
    })
    .filter(p => {
      if (activeCategory === 'all') return true;
      return p.category.toLowerCase() === activeCategory.toLowerCase();
    })
    .filter(p => {
      // Filter by state - if no states specified, show in all states
      if (!p.available_states || p.available_states.length === 0) return true;
      return p.available_states.includes(selectedState);
    });

  const handleProductClick = async (product: Product) => {
    await trackInteraction('products', 'view_product', { productId: product.id, productName: product.name });
    setSelectedProduct(product);
    onProductClick?.(product);
  };

  const handleFindDealer = async (product: Product) => {
    await trackInteraction('products', 'find_dealer', { productId: product.id, productName: product.name });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{getText('आमची उत्पादने', 'हमारे उत्पाद', 'Our Products')}</h2>
        </div>
        {selectedCrop && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {getText('पिकासाठी', 'फसल के लिए', 'For')} {selectedCrop}
          </span>
        )}
      </div>

      {/* State Selector */}
      <div className="relative">
        <button
          onClick={() => setShowStateSelector(!showStateSelector)}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {getText('राज्य:', 'राज्य:', 'State:')} {selectedState}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showStateSelector ? 'rotate-180' : ''}`} />
        </button>
        
        {showStateSelector && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowStateSelector(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto"
            >
              {indianStates.map((state) => (
                <button
                  key={state}
                  onClick={() => {
                    setSelectedState(state);
                    setShowStateSelector(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                    selectedState === state ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {state}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:border-primary'
            }`}
          >
            {getText(cat.mr, cat.hi, cat.en)}
          </motion.button>
        ))}
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {getText('या श्रेणीत उत्पादने नाहीत', 'इस श्रेणी में उत्पाद नहीं हैं', 'No products in this category')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product, index) => {
            const ProductIcon = getProductIcon(product.icon);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleProductClick(product)}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer group"
              >
                <div className="flex gap-4">
                  {/* Product Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getProductGradient(product.icon)} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <ProductIcon className="w-10 h-10 text-white" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.tagline}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-harvest-gold/20 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-harvest-gold text-harvest-gold" />
                        <span className="text-xs font-semibold text-accent">4.8</span>
                      </div>
                    </div>

                    {/* Benefits Preview */}
                    {product.benefits && product.benefits.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-secondary flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {product.benefits[0]}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">MRP</span>
                        <p className="font-bold text-primary">₹{product.mrp}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFindDealer(product);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/90 transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{getText('विक्रेता शोधा', 'विक्रेता खोजें', 'Find Dealer')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Crops */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.crops?.map((crop) => (
                    <span
                      key={crop}
                      className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground"
                    >
                      {crop}
                    </span>
                  ))}
                  {product.dosage && (
                    <span className="px-2 py-0.5 bg-secondary/10 rounded-full text-xs font-medium text-secondary">
                      {product.dosage}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Product Header */}
                <div className="flex gap-4">
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getProductGradient(selectedProduct.icon)} flex items-center justify-center`}>
                    {(() => {
                      const Icon = getProductIcon(selectedProduct.icon);
                      return <Icon className="w-12 h-12 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{selectedProduct.name}</h3>
                    <p className="text-muted-foreground">{selectedProduct.tagline}</p>
                    <p className="text-2xl font-bold text-primary mt-2">₹{selectedProduct.mrp}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div>
                    <h4 className="font-semibold mb-2">{getText('वर्णन', 'विवरण', 'Description')}</h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                )}

                {/* Benefits */}
                {selectedProduct.benefits && selectedProduct.benefits.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">{getText('फायदे', 'लाभ', 'Benefits')}</h4>
                    <ul className="space-y-2">
                      {selectedProduct.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dosage */}
                {selectedProduct.dosage && (
                  <div className="bg-muted rounded-xl p-3">
                    <h4 className="font-semibold text-sm mb-1">{getText('डोस', 'खुराक', 'Dosage')}</h4>
                    <p className="text-primary font-medium">{selectedProduct.dosage}</p>
                  </div>
                )}

                {/* Crops */}
                <div>
                  <h4 className="font-semibold mb-2">{getText('शिफारस केलेली पिके', 'अनुशंसित फसलें', 'Recommended Crops')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.crops?.map((crop) => (
                      <span key={crop} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleFindDealer(selectedProduct)}
                  className="w-full h-12 bg-gradient-hero hover:opacity-90"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  {getText('जवळचे विक्रेते शोधा', 'नजदीकी विक्रेता खोजें', 'Find Nearby Dealer')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
