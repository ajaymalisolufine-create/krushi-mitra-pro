import { motion } from 'framer-motion';
import { Package, MapPin, Star, Zap, Sparkles, Shield, Loader2, Droplet, Leaf } from 'lucide-react';
import { useProducts, type Product } from '@/hooks/useProducts';

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

interface ProductsGridProps {
  onProductClick?: (product: Product) => void;
}

export const ProductsGrid = ({ onProductClick }: ProductsGridProps) => {
  const { data: products = [], isLoading } = useProducts();

  // Filter only active products for display
  const activeProducts = products.filter(p => p.status === 'active');

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
          <h2 className="text-lg font-semibold">आमची उत्पादने</h2>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {['सर्व', 'जैव-उत्तेजक', 'खते', 'कीटकनाशके'].map((cat, index) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              index === 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:border-primary'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 gap-4">
        {activeProducts.map((product, index) => {
          const ProductIcon = getProductIcon(product.icon);
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onProductClick?.(product)}
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

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">MRP</span>
                      <p className="font-bold text-primary">₹{product.mrp}</p>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/90 transition-colors">
                      <MapPin className="w-3 h-3" />
                      <span>विक्रेता शोधा</span>
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
    </div>
  );
};
