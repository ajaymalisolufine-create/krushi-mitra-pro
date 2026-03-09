import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, Upload, X, Image as ImageIcon, GripVertical, Play } from 'lucide-react';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, type Banner } from '@/hooks/useBanners';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Switch } from '@/components/ui/switch';

const REDIRECT_TYPES = [
  { value: 'none', label: 'No Redirect' },
  { value: 'news', label: 'News Section' },
  { value: 'offers', label: 'Offers Section' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'products', label: 'Products' },
  { value: 'videos', label: 'Videos Section' },
  { value: 'external', label: 'External Link' },
];

export const AdminBanners = () => {
  const { data: banners = [], isLoading } = useBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const { uploadImage, isUploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    video_url: '',
    redirect_type: 'none',
    redirect_target: '',
    is_enabled: true,
    sort_order: 0,
  });

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData({ title: '', image_url: '', video_url: '', redirect_type: 'none', redirect_target: '', is_enabled: true, sort_order: banners.length });
    setShowModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditing(banner);
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      video_url: (banner as any).video_url || '',
      redirect_type: banner.redirect_type,
      redirect_target: banner.redirect_target || '',
      is_enabled: banner.is_enabled,
      sort_order: banner.sort_order,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this banner?')) deleteBanner.mutate(id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setFormData(prev => ({ ...prev, image_url: url }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleToggleEnabled = (banner: Banner) => {
    updateBanner.mutate({ id: banner.id, updates: { is_enabled: !banner.is_enabled } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      title: formData.title,
      image_url: formData.image_url,
      video_url: formData.video_url || null,
      redirect_type: formData.redirect_type,
      redirect_target: formData.redirect_target || null,
      is_enabled: formData.is_enabled,
      sort_order: formData.sort_order,
    };

    if (editing) {
      updateBanner.mutate({ id: editing.id, updates: data }, { onSuccess: () => setShowModal(false) });
    } else {
      createBanner.mutate(data, { onSuccess: () => setShowModal(false) });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners</h1>
          <p className="text-muted-foreground">Manage homepage banner carousel ({banners.length} banners)</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Add Banner
        </button>
      </div>

      <div className="space-y-3">
        {banners.map((banner, index) => (
          <motion.div key={banner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="relative shrink-0">
              <img src={banner.image_url} alt={banner.title} className="w-24 h-14 object-cover rounded-lg" />
              {(banner as any).video_url && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{banner.title}</h3>
              <p className="text-xs text-muted-foreground">
                {REDIRECT_TYPES.find(r => r.value === banner.redirect_type)?.label || 'None'}
                {(banner as any).video_url && ' • 🎬 Video'}
              </p>
            </div>
            <Switch checked={banner.is_enabled} onCheckedChange={() => handleToggleEnabled(banner)} />
            <button onClick={() => handleEdit(banner)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(banner.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
          </motion.div>
        ))}
        {banners.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No banners yet. Create your first banner.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto my-4">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Banner' : 'Create Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Banner Image *</label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
                {formData.image_url ? (
                  <div className="relative">
                    <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-border" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                    className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors disabled:opacity-50">
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : <><Upload className="w-6 h-6 text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload image (800x350)</span></>}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Video URL <span className="text-xs text-muted-foreground">(optional - auto-plays in banner)</span></label>
                <input type="url" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="YouTube URL (plays then redirects)" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Redirect To</label>
                  <select value={formData.redirect_type} onChange={e => setFormData({ ...formData, redirect_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    {REDIRECT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority Order</label>
                  <input type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {formData.redirect_type !== 'none' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Redirect Target</label>
                  <input type="text" value={formData.redirect_target} onChange={e => setFormData({ ...formData, redirect_target: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={formData.redirect_type === 'external' ? 'https://...' : 'Item ID or name'} />
                </div>
              )}

              <div className="flex items-center gap-3">
                <Switch checked={formData.is_enabled} onCheckedChange={checked => setFormData({ ...formData, is_enabled: checked })} />
                <label className="text-sm font-medium">Show on Homepage</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={!formData.image_url || createBanner.isPending || updateBanner.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {(createBanner.isPending || updateBanner.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
