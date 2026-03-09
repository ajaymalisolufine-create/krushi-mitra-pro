import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Bell, Shield, Save, UserPlus, Loader2, CheckCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((row: any) => { map[row.key] = row.value; });
      return map;
    },
  });
};

const useUpsertSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data: existing } = await supabase.from('app_settings').select('id').eq('key', key).single();
      if (existing) {
        const { error } = await supabase.from('app_settings').update({ value } as any).eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('app_settings').insert({ key, value } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast.success('Setting saved!');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to save'),
  });
};

export const AdminSettings = () => {
  const { data: settings = {} } = useAppSettings();
  const upsertSetting = useUpsertSetting();
  const { uploadImage, isUploading } = useImageUpload();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);

  const currentLogo = settings['company_logo'] || '';

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      upsertSetting.mutate({ key: 'company_logo', value: url });
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    upsertSetting.mutate({ key: 'company_logo', value: '' });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) { toast.error('Please fill in all fields'); return; }
    if (newAdminPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsCreatingAdmin(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: newAdminEmail, password: newAdminPassword });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');
      const { error: roleError } = await supabase.from('user_roles').insert({ user_id: authData.user.id, role: 'admin' as const });
      if (roleError) throw roleError;
      toast.success('Admin account created!');
      setAdminCreated(true);
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure app settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Logo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Company Logo</h2>
              <p className="text-sm text-muted-foreground">Upload or change the company logo used across the app</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
            {currentLogo ? (
              <div className="relative">
                <img src={currentLogo} alt="Company Logo" className="w-32 h-32 object-contain rounded-xl border border-border bg-muted p-2" />
                <button type="button" onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploading}
                className="w-32 h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors disabled:opacity-50">
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : <><Upload className="w-6 h-6 text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload logo</span></>}
              </button>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Recommended: PNG or SVG with transparent background</p>
              <p>Max size: 5MB</p>
              {currentLogo && (
                <button onClick={() => logoInputRef.current?.click()} disabled={isUploading}
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Change Logo'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Create Admin */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center"><UserPlus className="w-5 h-5 text-secondary" /></div>
            <div><h2 className="font-semibold">Create Admin Account</h2><p className="text-sm text-muted-foreground">Add a new administrator</p></div>
          </div>
          {adminCreated ? (
            <div className="p-4 bg-secondary/10 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <div><p className="font-medium text-secondary">Admin created!</p></div>
              <button onClick={() => setAdminCreated(false)} className="ml-auto text-sm text-primary hover:underline">Create another</button>
            </div>
          ) : (
            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="admin@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Min 6 characters" minLength={6} required />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={isCreatingAdmin}
                  className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isCreatingAdmin ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><UserPlus className="w-4 h-4" />Create Admin</>}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* General Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Settings className="w-5 h-5 text-primary" /></div>
            <h2 className="font-semibold">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">App Name</label><input type="text" defaultValue="Solufine Krushi Mitra" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-1">Contact Email</label><input type="email" defaultValue="support@solufineagritech.com" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-1">Contact Phone</label><input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </motion.div>

        {/* Language Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center"><Globe className="w-5 h-5 text-secondary" /></div>
            <h2 className="font-semibold">Language Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Default Language</label>
              <select className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Enabled Languages</label>
              <div className="space-y-2">
                {['Marathi', 'Hindi', 'English'].map(lang => (
                  <label key={lang} className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-primary" /><span className="text-sm">{lang}</span></label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-harvest-gold/20 flex items-center justify-center"><Bell className="w-5 h-5 text-accent" /></div>
            <h2 className="font-semibold">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between"><span className="text-sm">Enable Push Notifications</span><input type="checkbox" defaultChecked className="rounded text-primary" /></label>
            <label className="flex items-center justify-between"><span className="text-sm">Promotional Notifications</span><input type="checkbox" defaultChecked className="rounded text-primary" /></label>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-blue/20 flex items-center justify-center"><Shield className="w-5 h-5 text-sky-blue" /></div>
            <h2 className="font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">Change Password</button>
            <button className="w-full px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">Enable Two-Factor Auth</button>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </motion.div>
    </div>
  );
};
