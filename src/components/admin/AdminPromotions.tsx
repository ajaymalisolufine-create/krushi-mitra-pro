import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Tag, Percent, Loader2 } from 'lucide-react';
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, type Promotion } from '@/hooks/usePromotions';
import { format } from 'date-fns';

export const AdminPromotions = () => {
  const { data: promotions = [], isLoading } = usePromotions();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    valid_from: '',
    valid_until: '',
    status: 'active',
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
      valid_from: promo.valid_from ? format(new Date(promo.valid_from), 'yyyy-MM-dd') : '',
      valid_until: promo.valid_until ? format(new Date(promo.valid_until), 'yyyy-MM-dd') : '',
      status: promo.status,
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setFormData({
      title: '',
      description: '',
      discount: '',
      valid_from: format(new Date(), 'yyyy-MM-dd'),
      valid_until: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const promotionData = {
      title: formData.title,
      description: formData.description || null,
      discount: formData.discount || null,
      image_url: null,
      valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      status: formData.status,
    };

    if (editingPromotion) {
      updatePromotion.mutate({ id: editingPromotion.id, updates: promotionData }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createPromotion.mutate(promotionData, {
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
          <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground">Manage offers and campaigns ({promotions.length} promotions)</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Promotion
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promo.status)}`}>
                {promo.status}
              </span>
            </div>

            <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>

            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="px-2 py-0.5 rounded-full bg-harvest-gold/20 text-accent text-xs font-bold">
                {promo.discount}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Calendar className="w-3 h-3" />
              <span>
                {promo.valid_from ? format(new Date(promo.valid_from), 'MMM dd') : 'N/A'} - {promo.valid_until ? format(new Date(promo.valid_until), 'MMM dd, yyyy') : 'No end date'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(promo)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(promo.id)}
                disabled={deletePromotion.isPending}
                className="px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., THUNDER 20% OFF!"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="Promotion description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="20%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
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
                  disabled={createPromotion.isPending || updatePromotion.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(createPromotion.isPending || updatePromotion.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingPromotion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
