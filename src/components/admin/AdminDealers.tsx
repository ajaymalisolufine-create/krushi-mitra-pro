import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Search, Loader2, X } from 'lucide-react';
import { useDealers, useCreateDealer, useUpdateDealer, useDeleteDealer, type Dealer } from '@/hooks/useDealers';

export const AdminDealers = () => {
  const { data: dealers = [], isLoading } = useDealers();
  const createDealer = useCreateDealer();
  const updateDealer = useUpdateDealer();
  const deleteDealer = useDeleteDealer();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [newPincode, setNewPincode] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Sangli',
    phone: '',
    email: '',
    lat: '',
    lng: '',
    pincode: '',
    serving_pincodes: [] as string[],
    status: 'active',
  });

  const filteredDealers = dealers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (d.pincode?.includes(searchQuery) ?? false)
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dealer?')) {
      deleteDealer.mutate(id);
    }
  };

  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setFormData({
      name: dealer.name,
      address: dealer.address || '',
      city: dealer.city || 'Sangli',
      phone: dealer.phone || '',
      email: dealer.email || '',
      lat: dealer.lat?.toString() || '',
      lng: dealer.lng?.toString() || '',
      pincode: dealer.pincode || '',
      serving_pincodes: dealer.serving_pincodes || [],
      status: dealer.status,
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingDealer(null);
    setFormData({
      name: '',
      address: '',
      city: 'Sangli',
      phone: '',
      email: '',
      lat: '',
      lng: '',
      pincode: '',
      serving_pincodes: [],
      status: 'active',
    });
    setNewPincode('');
    setShowModal(true);
  };

  const addServingPincode = () => {
    if (newPincode && /^[1-9][0-9]{5}$/.test(newPincode) && !formData.serving_pincodes.includes(newPincode)) {
      setFormData(prev => ({
        ...prev,
        serving_pincodes: [...prev.serving_pincodes, newPincode]
      }));
      setNewPincode('');
    }
  };

  const removeServingPincode = (pincode: string) => {
    setFormData(prev => ({
      ...prev,
      serving_pincodes: prev.serving_pincodes.filter(p => p !== pincode)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dealerData = {
      name: formData.name,
      address: formData.address || null,
      city: formData.city || null,
      phone: formData.phone || null,
      email: formData.email || null,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
      pincode: formData.pincode || null,
      serving_pincodes: formData.serving_pincodes.length > 0 ? formData.serving_pincodes : null,
      status: formData.status,
    };

    if (editingDealer) {
      updateDealer.mutate({ id: editingDealer.id, updates: dealerData }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createDealer.mutate(dealerData, {
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
          <h1 className="text-2xl font-bold text-foreground">Dealers</h1>
          <p className="text-muted-foreground">Manage dealer locations ({dealers.length} dealers)</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Dealer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search dealers by name, city or pincode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Map Placeholder */}
      <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
        <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Google Maps Integration</p>
            <p className="text-xs text-muted-foreground">Sangli + 50km radius</p>
          </div>
        </div>
      </div>

      {/* Dealers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDealers.map((dealer, index) => (
          <motion.div
            key={dealer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-4 shadow-card border border-border/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">{dealer.name}</h3>
                  <p className="text-xs text-muted-foreground">{dealer.city}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                dealer.status === 'active'
                  ? 'bg-secondary/20 text-secondary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {dealer.status}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-2">{dealer.address}</p>

            {/* Pincode Info */}
            {(dealer.pincode || (dealer.serving_pincodes && dealer.serving_pincodes.length > 0)) && (
              <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                {dealer.pincode && (
                  <p className="text-xs text-primary font-medium mb-1">
                    📍 Primary: {dealer.pincode}
                  </p>
                )}
                {dealer.serving_pincodes && dealer.serving_pincodes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground">Serves:</span>
                    {dealer.serving_pincodes.map((pc) => (
                      <span key={pc} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {pc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1 text-sm mb-4">
              {dealer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{dealer.phone}</span>
                </div>
              )}
              {dealer.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{dealer.email}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(dealer)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(dealer.id)}
                disabled={deleteDealer.isPending}
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
            className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingDealer ? 'Edit Dealer' : 'Add New Dealer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dealer Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Shree Krushi Kendra"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="Full address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Sangli"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Pincode</label>
                  <input
                    type="tel"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="416410"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Serving Pincodes */}
              <div>
                <label className="block text-sm font-medium mb-1">Serving Pincodes (Areas Covered)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="tel"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add pincode"
                    maxLength={6}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addServingPincode();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addServingPincode}
                    className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
                  >
                    Add
                  </button>
                </div>
                {formData.serving_pincodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-xl">
                    {formData.serving_pincodes.map((pc) => (
                      <span
                        key={pc}
                        className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                      >
                        {pc}
                        <button
                          type="button"
                          onClick={() => removeServingPincode(pc)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Add all pincodes this dealer can serve
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="dealer@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  disabled={createDealer.isPending || updateDealer.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(createDealer.isPending || updateDealer.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingDealer ? 'Update' : 'Add Dealer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};