import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Star, Loader2, Check, Filter } from 'lucide-react';
import { useProducts, type Product } from '@/hooks/useProducts';
import { useApp } from '@/contexts/AppContext';
import { ProductDetailSheet } from './ProductDetailSheet';
import { allIndianCrops, getCropLabel, buildCropMapping } from '@/lib/crops';

const cropMapping = buildCropMapping();

const categories = [
  { key: 'all', mr: 'सर्व', hi: 'सभी', en: 'All' },
  { key: 'biostimulants', mr: 'जैव-उत्तेजक', hi: 'जैव-उत्तेजक', en: 'Biostimulants' },
  { key: 'fertilizers', mr: 'खते', hi: 'उर्वरक', en: 'Fertilizers' },
  { key: 'pesticides', mr: 'कीटकनाशके', hi: 'कीटनाशक', en: 'Pesticides' },
];

export const ProductsGrid = () => {
  const { data: products = [], isLoading } = useProducts();
  const { language, selectedCrops, setSelectedCrops, trackInteraction, userState } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCropFilter, setShowCropFilter] = useState(false);

  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
    }
  };

  const toggleCropFilter = (cropId: string) => {
    if (selectedCrops.includes(cropId)) {
      setSelectedCrops(selectedCrops.filter(c => c !== cropId));
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  // Filter products by user's state (from login), selected crops, and category
  const filteredProducts = products
    .filter(p => p.status === 'active')
    .filter(p => {
      // State filter: if product has available_states and user has a state, filter
      if (userState && p.available_states && p.available_states.length > 0) {
        return p.available_states.includes(userState);
      }
      return true;
    })
    .filter(p => {
      if (selectedCrops.length === 0) return true;
      return selectedCrops.some(selectedCrop => {
        const cropNames = cropMapping[selectedCrop] || [];
        return p.crops?.some(productCrop => 
          cropNames.some(name => productCrop.toLowerCase().includes(name.toLowerCase()))
        ) ?? false;
      });
    })
    .filter(p => {
      if (activeCategory === 'all') return true;
      return p.category.toLowerCase() === activeCategory.toLowerCase();
    });

  const handleProductClick = async (product: Product) => {
    await trackInteraction('products', 'view_product', { productId: product.id, productName: product.name });
    setSelectedProduct(product);
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
        <button
          onClick={() => setShowCropFilter(!showCropFilter)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedCrops.length > 0
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Filter className="w-4 h-4" />
          {selectedCrops.length > 0 
            ? `${selectedCrops.length} ${getText('पिके', 'फसलें', 'crops')}`
            : getText('पीक फिल्टर', 'फसल फ़िल्टर', 'Crop Filter')
          }
        </button>
      </div>

      {/* Crop Multi-Select Filter */}
      <AnimatePresence>
        {showCropFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-sm font-medium mb-2">
                {getText('पिके निवडा (एकापेक्षा जास्त)', 'फसलें चुनें (एक से अधिक)', 'Select Crops (Multiple)')}
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {allIndianCrops.map((crop) => {
                  const isSelected = selectedCrops.includes(crop.id);
                  return (
                    <button
                      key={crop.id}
                      onClick={() => toggleCropFilter(crop.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {getCropLabel(crop, language)}
                    </button>
                  );
                })}
              </div>
              {selectedCrops.length > 0 && (
                <button
                  onClick={() => setSelectedCrops([])}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {getText('सर्व साफ करा', 'सभी साफ़ करें', 'Clear all')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            const hasImage = product.image_url && product.image_url.length > 0;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleProductClick(product)}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer group"
              >
                <div className="flex gap-4">
                  {/* Product Image or Icon */}
                  {hasImage ? (
                    <img 
                      src={product.image_url!} 
                      alt={product.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-border shrink-0 group-hover:scale-105 transition-transform"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Package className="w-10 h-10 text-white" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.tagline}</p>
                      </div>
                      {(product.is_trending || product.is_best_seller) && (
                        <div className="flex items-center gap-1 bg-harvest-gold/20 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-harvest-gold text-harvest-gold" />
                        </div>
                      )}
                    </div>

                    {product.benefits && product.benefits.length > 0 && (
                      <p className="text-xs text-secondary flex items-center gap-1 mt-2">
                        <Check className="w-3 h-3" />
                        {product.benefits[0]}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {product.mrp > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground">MRP</span>
                          <p className="font-bold text-primary">₹{product.mrp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Crops */}
                {product.crops && product.crops.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.crops.slice(0, 4).map((crop) => (
                      <span key={crop} className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                        {crop}
                      </span>
                    ))}
                    {product.crops.length > 4 && (
                      <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                        +{product.crops.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <ProductDetailSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
