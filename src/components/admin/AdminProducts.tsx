import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Filter,
  Loader2,
  TrendingUp,
  Star,
} from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product } from '@/hooks/useProducts';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const indianStates = [
  'Maharashtra', 'Karnataka', 'Gujarat', 'Madhya Pradesh', 'Rajasthan',
  'Punjab', 'Uttar Pradesh', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana',
  'Kerala', 'West Bengal', 'Bihar', 'Odisha', 'Haryana', 'Jharkhand',
  'Chhattisgarh', 'Assam', 'Uttarakhand', 'Himachal Pradesh', 'Goa'
];

export const AdminProducts = () => {
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'fertilizers',
    crops: '',
    dosage: '',
    mrp: '',
    image_url: '',
    status: 'active',
    benefits: '',
    available_states: [] as string[],
    is_trending: false,
    is_best_seller: false,
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      tagline: product.tagline || '',
      description: product.description || '',
      category: product.category,
      crops: product.crops?.join(', ') || '',
      dosage: product.dosage || '',
      mrp: product.mrp.toString(),
      image_url: product.image_url || '',
      status: product.status,
      benefits: product.benefits?.join('\n') || '',
      available_states: product.available_states || [],
      is_trending: product.is_trending || false,
      is_best_seller: product.is_best_seller || false,
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      tagline: '',
      description: '',
      category: 'fertilizers',
      crops: '',
      dosage: '',
      mrp: '',
      image_url: '',
      status: 'active',
      benefits: '',
      available_states: [],
      is_trending: false,
      is_best_seller: false,
    });
    setShowModal(true);
  };

  const toggleState = (state: string) => {
    setFormData(prev => ({
      ...prev,
      available_states: prev.available_states.includes(state)
        ? prev.available_states.filter(s => s !== state)
        : [...prev.available_states, state]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      tagline: formData.tagline || null,
      description: formData.description || null,
      category: formData.category,
      crops: formData.crops.split(',').map(c => c.trim()).filter(Boolean),
      dosage: formData.dosage || null,
      mrp: parseFloat(formData.mrp) || 0,
      image_url: formData.image_url || null,
      icon: 'leaf',
      status: formData.status,
      benefits: formData.benefits.split('\n').map(b => b.trim()).filter(Boolean),
      available_states: formData.available_states.length > 0 ? formData.available_states : [],
      is_trending: formData.is_trending,
      is_best_seller: formData.is_best_seller,
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, updates: productData }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createProduct.mutate(productData, {
        onSuccess: () => setShowModal(false),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog ({products.length} products)</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Tags</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">MRP</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      {product.is_trending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </span>
                      )}
                      {product.is_best_seller && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-harvest-gold/20 text-accent text-xs">
                          <Star className="w-3 h-3" /> Bestseller
                        </span>
                      )}
                      {!product.is_trending && !product.is_best_seller && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold">₹{product.mrp}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active'
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        disabled={deleteProduct.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., THUNDER"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1850"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Short product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  placeholder="Detailed product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Benefits (one per line)</label>
                <Textarea
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Increases yield by 20%&#10;Improves root growth&#10;Enhances soil health"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="fertilizers">Fertilizers</option>
                    <option value="biostimulants">Bio-Stimulants</option>
                    <option value="pesticides">Pesticides</option>
                    <option value="plant-protection">Plant Protection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="2ml/L"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recommended Crops (comma-separated)</label>
                <input
                  type="text"
                  value={formData.crops}
                  onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Grape, Pomegranate, Cotton"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/product-image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="Product preview" 
                      className="w-20 h-20 object-cover rounded-lg border border-border"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available in States (leave empty for all)</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted rounded-xl border border-border">
                  {indianStates.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => toggleState(state)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        formData.available_states.includes(state)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border hover:bg-muted'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.available_states.length > 0 ? formData.available_states.join(', ') : 'All states'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Trending & Best Seller Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">Trending Product</span>
                  </div>
                  <Switch
                    checked={formData.is_trending}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_trending: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-harvest-gold" />
                    <span className="text-sm font-medium">Best Seller</span>
                  </div>
                  <Switch
                    checked={formData.is_best_seller}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_best_seller: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
