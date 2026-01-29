import { motion } from 'framer-motion';
import { Star, Package, ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useApp } from '@/contexts/AppContext';

const translations = {
  mr: {
    title: 'सर्वाधिक विक्री',
    viewAll: 'सर्व पहा',
    noProducts: 'सर्वाधिक विक्री उत्पादने उपलब्ध नाहीत',
    bestseller: 'बेस्टसेलर',
  },
  hi: {
    title: 'सबसे ज्यादा बिकने वाले',
    viewAll: 'सभी देखें',
    noProducts: 'कोई बेस्टसेलर उत्पाद उपलब्ध नहीं',
    bestseller: 'बेस्टसेलर',
  },
  en: {
    title: 'Best Selling Products',
    viewAll: 'View All',
    noProducts: 'No best selling products available',
    bestseller: 'Bestseller',
  },
};

export const BestSellingProducts = () => {
  const { data: products = [] } = useProducts();
  const { language, setActiveTab } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const bestSellingProducts = products.filter(p => p.is_best_seller && p.status === 'active').slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-harvest-gold fill-harvest-gold" />
          <h2 className="text-lg font-semibold">{t.title}</h2>
        </div>
        <button 
          onClick={() => setActiveTab('products')}
          className="text-sm text-secondary font-medium flex items-center gap-1"
        >
          {t.viewAll} <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {bestSellingProducts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t.noProducts}</p>
      ) : (
        <div className="space-y-3">
          {bestSellingProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-harvest-gold/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{product.name}</h3>
                    <span className="px-2 py-0.5 bg-harvest-gold/20 text-accent text-xs font-medium rounded-full">
                      {t.bestseller}
                    </span>
                  </div>
                  {product.tagline && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{product.tagline}</p>
                  )}
                  {product.benefits && product.benefits.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {product.benefits.slice(0, 2).map((benefit, i) => (
                        <p key={i} className="text-xs text-secondary flex items-center gap-1">
                          <span className="text-secondary">✓</span> {benefit}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <p className="font-bold text-primary">₹{product.mrp}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
