import { motion } from 'framer-motion';
import { Settings, Globe, Bell, Shield, Database, Palette, Save } from 'lucide-react';

export const AdminSettings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure app settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">App Name</label>
              <input
                type="text"
                defaultValue="Solufine Krushi Mitra"
                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                defaultValue="support@solufineagritech.com"
                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="tel"
                defaultValue="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </motion.div>

        {/* Language Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-secondary" />
            </div>
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
                {['Marathi', 'Hindi', 'English'].map((lang) => (
                  <label key={lang} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary" />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-harvest-gold/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-semibold">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm">Enable Push Notifications</span>
              <input type="checkbox" defaultChecked className="rounded text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Weather Alerts</span>
              <input type="checkbox" defaultChecked className="rounded text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Promotional Notifications</span>
              <input type="checkbox" defaultChecked className="rounded text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Crop Calendar Reminders</span>
              <input type="checkbox" defaultChecked className="rounded text-primary" />
            </label>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-blue/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-blue" />
            </div>
            <h2 className="font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin Email</label>
              <input
                type="email"
                defaultValue="admin@solufine.com"
                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="w-full px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
              Change Password
            </button>
            <button className="w-full px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
              Enable Two-Factor Auth
            </button>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </motion.div>
    </div>
  );
};
