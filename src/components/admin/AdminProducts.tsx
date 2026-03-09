import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Package, Loader2,
  TrendingUp, Star, Upload, X, Image as ImageIcon, Check, Sparkles, FileSpreadsheet,
} from 'lucide-react';
import { AdminBulkUpload } from './AdminBulkUpload';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product } from '@/hooks/useProducts';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useTranslateContent } from '@/hooks/useTranslateContent';
import { TranslationPreview } from './TranslationPreview';
import { allIndianCrops, indianStates } from '@/lib/crops';

export const AdminProducts = () => {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { uploadImage, isUploading } = useImageUpload();
  const { generateTranslations, isGenerating } = useTranslateContent();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'fertilizers',
    crops: [] as string[],
    dosage: '',
    mrp: '',
    image_url: '',
    status: 'active',
    benefits: '',
    available_states: [] as string[],
    is_trending: false,
    is_best_seller: false,
    translations: {} as Record<string, { title: string; message: string }>,
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
      crops: product.crops || [],
      dosage: product.dosage || '',
      mrp: product.mrp > 0 ? product.mrp.toString() : '',
      image_url: product.image_url || '',
      status: product.status,
      benefits: product.benefits?.join('\n') || '',
      available_states: product.available_states || [],
      is_trending: product.is_trending || false,
      is_best_seller: product.is_best_seller || false,
      translations: (product as any).translations || {},
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '', tagline: '', description: '', category: 'fertilizers',
      crops: [], dosage: '', mrp: '', image_url: '', status: 'active',
      benefits: '', available_states: [], is_trending: false, is_best_seller: false, translations: {},
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

  const toggleCrop = (cropName: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(cropName)
        ? prev.crops.filter(c => c !== cropName)
        : [...prev.crops, cropName]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = await uploadImage(file);
    if (imageUrl) setFormData(prev => ({ ...prev, image_url: imageUrl }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImage = () => setFormData(prev => ({ ...prev, image_url: '' }));

  const handleAIGenerate = async () => {
    const translations = await generateTranslations(formData.name, 'product', {
      context: formData.description || formData.tagline || undefined,
    });
    if (translations) {
      setFormData(prev => ({
        ...prev,
        description: translations.en?.message || prev.description,
        translations,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: any = {
      name: formData.name,
      tagline: formData.tagline || null,
      description: formData.description || null,
      category: formData.category,
      crops: formData.crops.length > 0 ? formData.crops : [],
      dosage: formData.dosage || null,
      mrp: parseFloat(formData.mrp) || 0,
      image_url: formData.image_url || null,
      icon: 'leaf',
      status: formData.status,
      benefits: formData.benefits.split('\n').map(b => b.trim()).filter(Boolean),
      available_states: formData.available_states.length > 0 ? formData.available_states : [],
      is_trending: formData.is_trending,
      is_best_seller: formData.is_best_seller,
      translations: Object.keys(formData.translations).length > 0 ? formData.translations : null,
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, updates: productData }, { onSuccess: () => setShowModal(false) });
    } else {
      createProduct.mutate(productData, { onSuccess: () => setShowModal(false) });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog ({products.length} products)</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

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
                <motion.tr key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-semibold">{product.name}</p>
                          {(product as any).translations && Object.keys((product as any).translations).length > 0 && (
                            <span className="text-xs">🌐</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">{product.category}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      {product.is_trending && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs"><TrendingUp className="w-3 h-3" /> Trending</span>}
                      {product.is_best_seller && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-harvest-gold/20 text-accent text-xs"><Star className="w-3 h-3" /> Bestseller</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold">{product.mrp > 0 ? `₹${product.mrp}` : '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>{product.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" disabled={deleteProduct.isPending}><Trash2 className="w-4 h-4 text-destructive" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., THUNDER" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MRP (₹) <span className="text-xs text-muted-foreground">(optional)</span></label>
                  <input type="number" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="1850" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tagline</label>
                <input type="text" value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Short product description" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Description</label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px]" placeholder="Detailed product description..." />
              </div>

              {/* AI Translate Button */}
              <button type="button" onClick={handleAIGenerate} disabled={isGenerating || !formData.name.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-colors disabled:opacity-50">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating translations...</> : <><Sparkles className="w-4 h-4" /> AI Translate Description (MR/HI/EN)</>}
              </button>

              <TranslationPreview translations={formData.translations} onUpdate={t => setFormData(prev => ({ ...prev, translations: t }))} />

              <div>
                <label className="block text-sm font-medium mb-1">Benefits (one per line)</label>
                <Textarea value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })}
                  className="min-h-[100px]" placeholder="Increases yield by 20%&#10;Improves root growth" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="fertilizers">Fertilizers</option>
                    <option value="biostimulants">Bio-Stimulants</option>
                    <option value="pesticides">Pesticides</option>
                    <option value="plant-protection">Plant Protection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dosage</label>
                  <input type="text" value={formData.dosage} onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="2ml/L" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recommended Crops</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-muted rounded-xl border border-border">
                  {allIndianCrops.map(crop => {
                    const isSelected = formData.crops.includes(crop.en);
                    return (
                      <button key={crop.id} type="button" onClick={() => toggleCrop(crop.en)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>
                        {isSelected && <Check className="w-3 h-3" />} {crop.en}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Selected: {formData.crops.length > 0 ? formData.crops.join(', ') : 'None'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Image</label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="hidden" />
                {formData.image_url ? (
                  <div className="relative inline-block">
                    <img src={formData.image_url} alt="Product" className="w-32 h-32 object-cover rounded-xl border border-border" onError={e => { e.currentTarget.src = '/placeholder.svg'; }} />
                    <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                    className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors disabled:opacity-50">
                    {isUploading ? <><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /><span className="text-sm text-muted-foreground">Uploading...</span></> : <><Upload className="w-8 h-8 text-muted-foreground" /><span className="text-sm text-muted-foreground">Click to upload image</span></>}
                  </button>
                )}
                <div className="mt-3">
                  <label className="block text-xs text-muted-foreground mb-1">Or paste image URL</label>
                  <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="https://example.com/product-image.jpg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available in States</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted rounded-xl border border-border">
                  {indianStates.map(state => (
                    <button key={state} type="button" onClick={() => toggleState(state)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${formData.available_states.includes(state) ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}>
                      {state}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Selected: {formData.available_states.length > 0 ? formData.available_states.join(', ') : 'All states'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-secondary" /><span className="text-sm font-medium">Trending Product</span></div>
                  <Switch checked={formData.is_trending} onCheckedChange={checked => setFormData({ ...formData, is_trending: checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Star className="w-4 h-4 text-harvest-gold" /><span className="text-sm font-medium">Best Seller</span></div>
                  <Switch checked={formData.is_best_seller} onCheckedChange={checked => setFormData({ ...formData, is_best_seller: checked })} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
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
