import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send, Bell, Users, MapPin, Grape, Clock, Trash2, Loader2, CheckCircle, Eye, BellRing, Newspaper, Megaphone, Play, RefreshCw, Sparkles } from 'lucide-react';
import { useNotifications, useCreateNotification, useUpdateNotification, useDeleteNotification, type Notification } from '@/hooks/useNotifications';
import { useTranslateContent } from '@/hooks/useTranslateContent';
import { TranslationPreview } from './TranslationPreview';
import { format } from 'date-fns';

const CATEGORY_OPTIONS = [
  { value: 'news', label: 'News', icon: Newspaper },
  { value: 'offer', label: 'Offer', icon: Megaphone },
  { value: 'video', label: 'Video', icon: Play },
  { value: 'update', label: 'Update', icon: RefreshCw },
];

export const AdminNotifications = () => {
  const { data: notifications = [], isLoading } = useNotifications();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();
  const { generateTranslations, isGenerating } = useTranslateContent();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', message: '', target_type: 'all', target_value: 'All',
    scheduled_at: '', category: 'update', redirect_target: '', image_url: '',
    popup_enabled: false, push_enabled: false,
    translations: {} as Record<string, { title: string; message: string }>,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-secondary/20 text-secondary';
      case 'scheduled': return 'bg-sky-blue/20 text-sky-blue';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (cat: string | null) => {
    switch (cat) {
      case 'news': return 'bg-sky-blue/20 text-sky-blue';
      case 'offer': return 'bg-harvest-gold/20 text-accent';
      case 'video': return 'bg-purple-500/20 text-purple-600';
      default: return 'bg-secondary/20 text-secondary';
    }
  };

  const getTargetIcon = (type: string | null) => {
    switch (type) {
      case 'location': return MapPin;
      case 'crop': return Grape;
      default: return Users;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this notification?')) deleteNotification.mutate(id);
  };

  const handleSendNow = (notif: Notification) => {
    if (confirm('Send this notification now?')) {
      updateNotification.mutate({ id: notif.id, updates: { status: 'sent', sent_at: new Date().toISOString() } });
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '', message: '', target_type: 'all', target_value: 'All',
      scheduled_at: '', category: 'update', redirect_target: '', image_url: '',
      popup_enabled: false, push_enabled: false, translations: {},
    });
    setShowModal(true);
  };

  const handleAIGenerate = async () => {
    const translations = await generateTranslations(formData.title, 'notification', {
      category: formData.category,
      context: formData.message || undefined,
    });
    if (translations) {
      setFormData(prev => ({
        ...prev,
        title: translations.en?.title || prev.title,
        message: translations.en?.message || prev.message,
        translations,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    createNotification.mutate({
      title: formData.title,
      message: formData.message,
      target_type: formData.target_type || null,
      target_value: formData.target_value || null,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
      sent_at: null,
      status: isDraft ? 'draft' : 'scheduled',
      category: formData.category,
      redirect_target: formData.redirect_target || null,
      image_url: formData.image_url || null,
      popup_enabled: formData.popup_enabled,
      push_enabled: formData.push_enabled,
      translations: Object.keys(formData.translations).length > 0 ? formData.translations : null,
    } as any, {
      onSuccess: () => setShowModal(false),
    });
  };

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Manage popup & push notifications</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Create Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Send, count: sentCount, label: 'Sent', color: 'bg-secondary/20 text-secondary' },
          { icon: Clock, count: scheduledCount, label: 'Scheduled', color: 'bg-sky-blue/20 text-sky-blue' },
          { icon: Users, count: notifications.length, label: 'Total', color: 'bg-harvest-gold/20 text-accent' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold">{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border"><h2 className="font-semibold">All Notifications</h2></div>
        <div className="divide-y divide-border">
          {notifications.map((notif, index) => {
            const TargetIcon = getTargetIcon(notif.target_type);
            const hasTranslations = notif.translations && Object.keys(notif.translations as object).length > 0;
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0"><Bell className="w-5 h-5 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasTranslations && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-600">🌐</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(notif.category)}`}>{notif.category || 'update'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notif.status)}`}>{notif.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notif.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><TargetIcon className="w-3 h-3" />{notif.target_value || 'All Users'}</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{notif.scheduled_at ? format(new Date(notif.scheduled_at), 'MMM dd, HH:mm') : 'Immediate'}</div>
                      {notif.popup_enabled && <span className="flex items-center gap-1 text-primary"><Eye className="w-3 h-3" />Popup</span>}
                      {notif.push_enabled && <span className="flex items-center gap-1 text-primary"><BellRing className="w-3 h-3" />Push</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {notif.status !== 'sent' && (
                      <button onClick={() => handleSendNow(notif)} disabled={updateNotification.isPending}
                        className="p-2 rounded-lg hover:bg-secondary/10 text-secondary transition-colors" title="Send Now"><CheckCircle className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => handleDelete(notif.id)} disabled={deleteNotification.isPending}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {notifications.length === 0 && <div className="p-8 text-center text-muted-foreground">No notifications yet.</div>}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-lg my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Notification</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title / Topic</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. New grape spray schedule" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setFormData({ ...formData, category: opt.value })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${formData.category === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}>
                      <opt.icon className="w-5 h-5" /><span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={handleAIGenerate} disabled={isGenerating || !formData.title.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-colors disabled:opacity-50">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> AI Generate + Translate (MR/HI/EN)</>}
              </button>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="Description for farmers..." required />
              </div>

              <TranslationPreview translations={formData.translations} onUpdate={t => setFormData(prev => ({ ...prev, translations: t }))} />

              <div>
                <label className="block text-sm font-medium mb-2">Notification Type</label>
                <div className="flex gap-3">
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${formData.popup_enabled ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <input type="checkbox" checked={formData.popup_enabled} onChange={e => setFormData({ ...formData, popup_enabled: e.target.checked })} className="sr-only" />
                    <Eye className={`w-4 h-4 ${formData.popup_enabled ? 'text-primary' : 'text-muted-foreground'}`} /><span className="text-sm font-medium">Popup</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${formData.push_enabled ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <input type="checkbox" checked={formData.push_enabled} onChange={e => setFormData({ ...formData, push_enabled: e.target.checked })} className="sr-only" />
                    <BellRing className={`w-4 h-4 ${formData.push_enabled ? 'text-primary' : 'text-muted-foreground'}`} /><span className="text-sm font-medium">Push</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Redirect Target (optional)</label>
                <input type="text" value={formData.redirect_target} onChange={e => setFormData({ ...formData, redirect_target: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., video-id or page name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target</label>
                  <select value={formData.target_type} onChange={e => setFormData({ ...formData, target_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="all">All Users</option><option value="crop">By Crop</option><option value="location">By Location</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Value</label>
                  <select value={formData.target_value} onChange={e => setFormData({ ...formData, target_value: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>All</option><option>Grape</option><option>Chickpea</option><option>Sangli</option><option>Miraj</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Schedule</label>
                <input type="datetime-local" value={formData.scheduled_at} onChange={e => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="button" onClick={e => handleSubmit(e, true)} disabled={createNotification.isPending}
                  className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors">Save Draft</button>
                <button type="button" onClick={e => handleSubmit(e, false)} disabled={createNotification.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createNotification.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" /> Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
