import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send, Bell, Users, MapPin, Grape, Clock, Trash2, Loader2 } from 'lucide-react';
import { useNotifications, useCreateNotification, useDeleteNotification, type Notification } from '@/hooks/useNotifications';
import { format } from 'date-fns';

export const AdminNotifications = () => {
  const { data: notifications = [], isLoading } = useNotifications();
  const createNotification = useCreateNotification();
  const deleteNotification = useDeleteNotification();

  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_type: 'all',
    target_value: 'All',
    scheduled_at: '',
    status: 'scheduled',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-secondary/20 text-secondary';
      case 'scheduled': return 'bg-sky-blue/20 text-sky-blue';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTargetIcon = (type: string | null) => {
    switch (type) {
      case 'all': return Users;
      case 'location': return MapPin;
      case 'crop': return Grape;
      default: return Users;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      deleteNotification.mutate(id);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      message: '',
      target_type: 'all',
      target_value: 'All',
      scheduled_at: '',
      status: 'scheduled',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    const notificationData = {
      title: formData.title,
      message: formData.message,
      target_type: formData.target_type || null,
      target_value: formData.target_value || null,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
      sent_at: null,
      status: isDraft ? 'draft' : 'scheduled',
    };

    createNotification.mutate(notificationData, {
      onSuccess: () => setShowModal(false),
    });
  };

  // Calculate stats
  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length;

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
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Send push notifications to users</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sentCount}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-blue/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scheduledCount}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-harvest-gold/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Recent Notifications</h2>
        </div>
        <div className="divide-y divide-border">
          {notifications.map((notif, index) => {
            const TargetIcon = getTargetIcon(notif.target_type);
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notif.status)}`}>
                        {notif.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TargetIcon className="w-3 h-3" />
                        <span>{notif.target_value || 'All Users'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{notif.scheduled_at ? format(new Date(notif.scheduled_at), 'MMM dd, yyyy HH:mm') : 'Immediate'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(notif.id)}
                    disabled={deleteNotification.isPending}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-bold mb-4">Create Notification</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., New Offer! 🎉"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Notification message..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Type</label>
                  <select
                    value={formData.target_type}
                    onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Users</option>
                    <option value="crop">By Crop</option>
                    <option value="location">By Location</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target</label>
                  <select
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>All</option>
                    <option>Grape</option>
                    <option>Chickpea</option>
                    <option>Sangli</option>
                    <option>Miraj</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Schedule</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={createNotification.isPending}
                  className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={createNotification.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createNotification.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
