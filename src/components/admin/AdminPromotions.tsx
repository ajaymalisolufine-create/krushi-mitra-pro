import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Tag, Percent, Loader2, X, Image as ImageIcon, Sparkles, Link } from 'lucide-react';
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, type Promotion } from '@/hooks/usePromotions';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useTranslateContent } from '@/hooks/useTranslateContent';
import { TranslationPreview } from './TranslationPreview';
import { format } from 'date-fns';

export const AdminPromotions = () => {
  const { data: promotions = [], isLoading } = usePromotions();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();
  const { uploadImage, isUploading } = useImageUpload();
  const { generateTranslations, isGenerating } = useTranslateContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSaving = createPromotion.isPending || updatePromotion.isPending;

  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    image_url: '',
    video_url: '',
    external_url: '',
    valid_from: '',
    valid_until: '',
    status: 'active',
    translations: {} as Record<string, { title: string; message: string }>,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-secondary/20 text-secondary';
      case 'scheduled': return 'bg-sky-blue/20 text-sky-blue';
      case 'expired': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      deletePromotion.mutate(id);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      title: promo.title,
      description: promo.description || '',
      discount: promo.discount || '',
      image_url: promo.image_url || '',
      video_url: (promo as any).video_url || '',
      external_url: (promo as any).external_url || '',
      valid_from: promo.valid_from ? format(new Date(promo.valid_from), 'yyyy-MM-dd') : '',
      valid_until: promo.valid_until ? format(new Date(promo.valid_until), 'yyyy-MM-dd') : '',
      status: promo.status,
      translations: (promo as any).translations || {},
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setFormData({
      title: '', description: '', discount: '', image_url: '', video_url: '', external_url: '',
      valid_from: format(new Date(), 'yyyy-MM-dd'), valid_until: '', status: 'active', translations: {},
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setFormData(prev => ({ ...prev, image_url: url }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAIGenerate = async () => {
    const translations = await generateTranslations(formData.title, 'promotion', {
      category: 'offer',
      context: formData.description || formData.discount || undefined,
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
    const promotionData: any = {
      title: formData.title,
      description: formData.description || null,
      discount: formData.discount || null,
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
      external_url: formData.external_url || null,
      valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      status: formData.status,
      translations: Object.keys(formData.translations).length > 0 ? formData.translations : null,
    };

    if (editingPromotion) {
      updatePromotion.mutate({ id: editingPromotion.id, updates: promotionData }, { onSuccess: () => setShowModal(false) });
    } else {
      createPromotion.mutate(promotionData, { onSuccess: () => setShowModal(false) });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground">Manage offers and campaigns ({promotions.length} promotions)</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Create Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo, index) => (
          <motion.div key={promo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50">
            {promo.image_url && <img src={promo.image_url} alt={promo.title} className="w-full h-32 object-cover" loading="lazy" decoding="async" />}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  {(promo as any).translations && Object.keys((promo as any).translations).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-600">🌐</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promo.status)}`}>{promo.status}</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{promo.description}</p>
              {promo.discount && (
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="px-2 py-0.5 rounded-full bg-harvest-gold/20 text-accent text-xs font-bold">{promo.discount}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="w-3 h-3" />
                <span>{promo.valid_from ? format(new Date(promo.valid_from), 'MMM dd') : 'N/A'} - {promo.valid_until ? format(new Date(promo.valid_until), 'MMM dd, yyyy') : 'No end date'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(promo)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(promo.id)} disabled={deletePromotion.isPending} className="px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-lg my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., THUNDER 20% OFF!" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="Promotion description..." />
              </div>

              <button type="button" onClick={handleAIGenerate} disabled={isGenerating || isSaving || !formData.title.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-colors disabled:opacity-50">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating translations...</> : <><Sparkles className="w-4 h-4" /> AI Translate (MR/HI/EN)</>}
              </button>

              <TranslationPreview translations={formData.translations} onUpdate={t => setFormData(prev => ({ ...prev, translations: t }))} />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Image <span className="text-xs text-muted-foreground">(optional)</span></label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="hidden" />
                {formData.image_url ? (
                  <div className="relative inline-block w-full">
                    <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-border" loading="lazy" decoding="async" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                    className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors disabled:opacity-50">
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : <><ImageIcon className="w-6 h-6 text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload image</span></>}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Video URL <span className="text-xs text-muted-foreground">(opt)</span></label>
                  <input type="url" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="YouTube URL" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">External Link <span className="text-xs text-muted-foreground">(opt)</span></label>
                  <input type="url" value={formData.external_url} onChange={e => setFormData({ ...formData, external_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <input type="text" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="20%" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <input type="date" value={formData.valid_from} onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <input type="date" value={formData.valid_until} onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving || isUploading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving...' : editingPromotion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
