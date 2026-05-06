import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, ChevronRight } from 'lucide-react';
import { useProducts, type Product } from '@/hooks/useProducts';
import { useApp } from '@/contexts/AppContext';
import { useTracker } from '@/hooks/useTracker';
import { ProductDetailSheet } from './ProductDetailSheet';

const translations = {
  mr: { title: 'ट्रेंडिंग उत्पादने', viewAll: 'सर्व पहा', noProducts: 'ट्रेंडिंग उत्पादने उपलब्ध नाहीत' },
  hi: { title: 'ट्रेंडिंग उत्पाद', viewAll: 'सभी देखें', noProducts: 'कोई ट्रेंडिंग उत्पाद उपलब्ध नहीं' },
  en: { title: 'Trending Products', viewAll: 'View All', noProducts: 'No trending products available' },
};

export const TrendingProducts = () => {
  const { data: products = [] } = useProducts();
  const { language, setActiveTab } = useApp();
  const { track } = useTracker();
  const t = translations[language as keyof typeof translations] || translations.en;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const userState = localStorage.getItem('user_state') || '';
  
  const trendingProducts = products
    .filter(p => p.is_trending && p.status === 'active')
    .filter(p => {
      if (userState && p.available_states && p.available_states.length > 0) {
        return p.available_states.includes(userState);
      }
      return true;
    })
    .slice(0, 4);

  const handleProductClick = async (product: Product) => {
    await track('Trending Product', product.name, { productId: product.id });
    setSelectedProduct(product);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-semibold">{t.title}</h2>
          </div>
          <button 
            onClick={() => setActiveTab('products')}
            className="text-sm text-secondary font-medium flex items-center gap-1"
          >
            {t.viewAll} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {trendingProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t.noProducts}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {trendingProducts.map((product, index) => {
              const hasImage = product.image_url && product.image_url.length > 0;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleProductClick(product)}
                  className="bg-card rounded-xl p-3 shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer"
                >
                  {hasImage ? (
                    <img src={product.image_url!} alt={product.name} className="w-full h-20 rounded-lg object-cover mb-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center mb-2">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                  {product.tagline && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.tagline}</p>
                  )}
                  {product.mrp > 0 && <p className="text-sm font-bold text-primary mt-1">₹{product.mrp}</p>}
                  {product.benefits && product.benefits.length > 0 && (
                    <p className="text-xs text-secondary mt-1 line-clamp-1">✓ {product.benefits[0]}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <ProductDetailSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  );
};
