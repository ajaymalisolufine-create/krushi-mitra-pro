import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Newspaper, Loader2, Sparkles, Link, Play, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useNews, useCreateNews, useUpdateNews, useDeleteNews, type News } from '@/hooks/useNews';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useTranslateContent } from '@/hooks/useTranslateContent';
import { TranslationPreview } from './TranslationPreview';
import { format } from 'date-fns';

export const AdminNews = () => {
  const { data: news = [], isLoading } = useNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();
  const { uploadImage, isUploading } = useImageUpload();
  const { generateTranslations, isGenerating } = useTranslateContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSaving = createNews.isPending || updateNews.isPending;

  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
    category: 'general',
    status: 'published',
    image_url: '',
    video_url: '',
    external_url: '',
    translations: {} as Record<string, { title: string; message: string }>,
  });

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Export': return 'bg-secondary/20 text-secondary';
      case 'Scheme': return 'bg-harvest-gold/20 text-accent';
      case 'Weather': return 'bg-sky-blue/20 text-sky-blue';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this news?')) {
      deleteNews.mutate(id);
    }
  };

  const handleEdit = (item: News) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      content: item.content || '',
      source: item.source || '',
      category: item.category || 'general',
      status: item.status,
      image_url: item.image_url || '',
      video_url: (item as any).video_url || '',
      external_url: item.external_url || '',
      translations: (item as any).translations || {},
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingNews(null);
    setFormData({
      title: '', content: '', source: '', category: 'general', status: 'published',
      image_url: '', video_url: '', external_url: '', translations: {},
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
    const translations = await generateTranslations(formData.title, 'news', {
      category: formData.category,
      context: formData.content || undefined,
    });
    if (translations) {
      setFormData(prev => ({
        ...prev,
        content: translations.en?.message || prev.content,
        translations,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newsData: any = {
      title: formData.title,
      content: formData.content || null,
      source: formData.source || null,
      category: formData.category || null,
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
      external_url: formData.external_url || null,
      status: formData.status,
      published_at: new Date().toISOString(),
      translations: Object.keys(formData.translations).length > 0 ? formData.translations : null,
    };

    if (editingNews) {
      updateNews.mutate({ id: editingNews.id, updates: newsData }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createNews.mutate(newsData, {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News</h1>
          <p className="text-muted-foreground">Manage agriculture news ({news.length} articles)</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Add News
        </button>
      </div>

      <div className="space-y-3">
        {news.map((item, index) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
            <div className="flex items-start gap-4">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-xl object-cover shrink-0" loading="lazy" decoding="async" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Newspaper className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {(item as any).translations && Object.keys((item as any).translations).length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-600">🌐</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'published' ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className={`px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>{item.category}</span>
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{format(new Date(item.published_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-medium">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} disabled={deleteNews.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-xs font-medium">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-6 w-full max-w-lg my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingNews ? 'Edit News' : 'Add News'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <textarea value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" rows={2} placeholder="News headline" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="News content/description..." />
              </div>

              {/* AI Generate Button */}
              <button type="button" onClick={handleAIGenerate} disabled={isGenerating || isSaving || !formData.title.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-colors disabled:opacity-50">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating translations...</> : <><Sparkles className="w-4 h-4" /> AI Generate Translations (MR/HI/EN)</>}
              </button>

              <TranslationPreview translations={formData.translations} onUpdate={t => setFormData(prev => ({ ...prev, translations: t }))} />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Image <span className="text-xs text-muted-foreground">(optional)</span></label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="hidden" />
                {formData.image_url ? (
                  <div className="relative inline-block">
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
                  <label className="block text-sm font-medium mb-1">Video URL <span className="text-xs text-muted-foreground">(optional)</span></label>
                  <input type="url" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="YouTube URL" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">External Link <span className="text-xs text-muted-foreground">(optional)</span></label>
                  <input type="url" value={formData.external_url} onChange={e => setFormData({ ...formData, external_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source</label>
                  <input type="text" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Agri News" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="general">General</option>
                    <option value="Export">Export</option>
                    <option value="Scheme">Scheme</option>
                    <option value="Weather">Weather</option>
                    <option value="Market">Market</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving || isUploading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving...' : editingNews ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
