import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tag,
  PlayCircle,
  Newspaper,
  Bell,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
  Sprout,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { AdminSetup } from './AdminSetup';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'promotions', label: 'Promotions', icon: Tag, path: '/admin/promotions' },
  { id: 'videos', label: 'Videos', icon: PlayCircle, path: '/admin/videos' },
  { id: 'news', label: 'News', icon: Newspaper, path: '/admin/news' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { id: 'dealers', label: 'Dealers', icon: MapPin, path: '/admin/dealers' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export const AdminLayout = () => {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null);
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if any admins exist (with timeout to prevent infinite loading)
  const checkAdmins = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const { data, error } = await supabase.functions.invoke('admin-bootstrap', {
        body: { action: 'status' },
      });
      clearTimeout(timeoutId);
      if (error) throw error;
      setHasAdmins(!!data?.hasAdmins);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Error checking admins:', err);
      // On error/timeout, assume admins exist (show login instead of setup)
      setHasAdmins(true);
    } finally {
      setAdminCheckDone(true);
    }
  }, []);

  useEffect(() => {
    checkAdmins();
  }, [checkAdmins]);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Show loading only while initial checks are pending
  const isInitializing = !adminCheckDone || (authLoading && hasAdmins);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  // No admins exist - show setup
  if (!hasAdmins) {
    return <AdminSetup onSetupComplete={() => setHasAdmins(true)} />;
  }

  // Not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          // Avoid full page reloads (they abort in-flight requests and can break login)
          navigate('/admin');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="font-bold text-primary">Solufine</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {sidebarOpen && active && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Toggle & Logout */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <Menu className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-primary text-sm">Solufine Admin</h1>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          className="lg:hidden fixed top-16 left-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col"
        >
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </motion.aside>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:overflow-y-auto">
        <div className="lg:hidden h-16" /> {/* Mobile header spacer */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
