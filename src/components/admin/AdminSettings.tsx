import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, UserPlus, Loader2, CheckCircle, Upload, X, Image as ImageIcon, Phone, Mail, Globe, MapPin, Building2, Facebook, Instagram, Youtube, Twitter, MessageSquare, KeyRound, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAppSettings, useUpsertSetting, type PlatformSettings } from '@/hooks/useAppSettings';
import { toast } from 'sonner';

const FIELDS: { key: keyof PlatformSettings; label: string; icon: any; placeholder: string; type?: string }[] = [
  { key: 'company_name', label: 'Company Name', icon: Building2, placeholder: 'Solufine Agritech Pvt. Ltd.' },
  { key: 'admin_email', label: 'Admin Gmail ID', icon: Mail, placeholder: 'admin@gmail.com', type: 'email' },
  { key: 'support_email', label: 'Support Email', icon: Mail, placeholder: 'support@example.com', type: 'email' },
  { key: 'contact_phone', label: 'Contact Number', icon: Phone, placeholder: '+919175700256', type: 'tel' },
  { key: 'whatsapp_phone', label: 'WhatsApp Number', icon: Phone, placeholder: '+919175700256', type: 'tel' },
  { key: 'website_url', label: 'Website URL', icon: Globe, placeholder: 'https://example.com', type: 'url' },
  { key: 'office_address', label: 'Office Address', icon: MapPin, placeholder: 'Miraj, Maharashtra 416410' },
  { key: 'social_facebook', label: 'Facebook URL', icon: Facebook, placeholder: 'https://facebook.com/...' },
  { key: 'social_instagram', label: 'Instagram URL', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { key: 'social_youtube', label: 'YouTube URL', icon: Youtube, placeholder: 'https://youtube.com/...' },
  { key: 'social_twitter', label: 'Twitter / X URL', icon: Twitter, placeholder: 'https://x.com/...' },
];

export const AdminSettings = () => {
  const { data: settings = {}, isLoading } = useAppSettings();
  const upsert = useUpsertSetting();
  const { uploadImage, isUploading } = useImageUpload();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PlatformSettings>({});
  const [savingAll, setSavingAll] = useState(false);

  // Admin creation
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);

  useEffect(() => {
    if (!isLoading) setForm(settings);
  }, [isLoading]); // eslint-disable-line

  const set = (k: keyof PlatformSettings, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const validatePhone = (p: string) => !p || /^\+?\d{10,15}$/.test(p.replace(/\s/g, ''));
  const validateEmail = (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateUrl = (u: string) => !u || /^https?:\/\/.+/.test(u);

  const handleSaveAll = async () => {
    // Basic validation
    if (form.contact_phone && !validatePhone(form.contact_phone)) return toast.error('Invalid contact number');
    if (form.whatsapp_phone && !validatePhone(form.whatsapp_phone)) return toast.error('Invalid WhatsApp number');
    if (form.admin_email && !validateEmail(form.admin_email)) return toast.error('Invalid admin email');
    if (form.support_email && !validateEmail(form.support_email)) return toast.error('Invalid support email');
    if (form.website_url && !validateUrl(form.website_url)) return toast.error('Website URL must start with http(s)://');

    setSavingAll(true);
    try {
      for (const f of FIELDS) {
        const value = (form[f.key] ?? '') as string;
        if ((settings[f.key] ?? '') !== value) {
          await upsert.mutateAsync({ key: f.key, value });
        }
      }
      toast.success('Settings saved — changes are live');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSavingAll(false);
    }
  };

  const currentLogo = settings.company_logo || '';

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      await upsert.mutateAsync({ key: 'company_logo', value: url });
      toast.success('Logo updated');
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveLogo = async () => {
    await upsert.mutateAsync({ key: 'company_logo', value: '' });
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
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Updates here reflect instantly across the farmer app, contact page and notifications</p>
      </div>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-primary" /></div>
          <div><h2 className="font-semibold">Company Logo</h2><p className="text-sm text-muted-foreground">PNG/SVG, max 5MB</p></div>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
          {currentLogo ? (
            <div className="relative">
              <img src={currentLogo} alt="Company Logo" className="w-32 h-32 object-contain rounded-xl border border-border bg-muted p-2" />
              <button type="button" onClick={handleRemoveLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploading} className="w-32 h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary disabled:opacity-50">
              {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : <><Upload className="w-6 h-6 text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload logo</span></>}
            </button>
          )}
          {currentLogo && (
            <button onClick={() => logoInputRef.current?.click()} disabled={isUploading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {isUploading ? 'Uploading...' : 'Change Logo'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Editable Platform Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Settings className="w-5 h-5 text-primary" /></div>
          <div><h2 className="font-semibold">Contact & Branding</h2><p className="text-sm text-muted-foreground">Used on Contact page, Footer & Notifications</p></div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map(({ key, label, icon: Icon, placeholder, type }) => (
              <div key={key} className={key === 'office_address' ? 'md:col-span-2' : ''}>
                <label className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {label}
                </label>
                <input
                  type={type || 'text'}
                  value={(form[key] ?? '') as string}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-5">
          <button onClick={handleSaveAll} disabled={savingAll} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50">
            {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Changes
          </button>
        </div>
      </motion.div>

      {/* Create Admin */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center"><UserPlus className="w-5 h-5 text-secondary" /></div>
          <div><h2 className="font-semibold">Create Admin Account</h2><p className="text-sm text-muted-foreground">Add another administrator</p></div>
        </div>
        {adminCreated ? (
          <div className="p-4 bg-secondary/10 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-secondary" />
            <p className="font-medium text-secondary">Admin created!</p>
            <button onClick={() => setAdminCreated(false)} className="ml-auto text-sm text-primary hover:underline">Create another</button>
          </div>
        ) : (
          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="admin@example.com" className="px-3 py-2.5 rounded-xl bg-muted border border-border" required />
            <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} placeholder="Password (min 6)" minLength={6} className="px-3 py-2.5 rounded-xl bg-muted border border-border" required />
            <button type="submit" disabled={isCreatingAdmin} className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {isCreatingAdmin ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><UserPlus className="w-4 h-4" />Create Admin</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
