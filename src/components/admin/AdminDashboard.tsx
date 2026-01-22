import { motion } from 'framer-motion';
import {
  Users,
  Package,
  PlayCircle,
  Bell,
  TrendingUp,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  {
    title: 'Total Users',
    value: '12,458',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'bg-secondary/20 text-secondary',
  },
  {
    title: 'Products',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: Package,
    color: 'bg-harvest-gold/20 text-accent',
  },
  {
    title: 'Video Views',
    value: '89.2K',
    change: '+28%',
    trend: 'up',
    icon: PlayCircle,
    color: 'bg-sky-blue/20 text-sky-blue',
  },
  {
    title: 'Active Notifications',
    value: '8',
    change: '-2',
    trend: 'down',
    icon: Bell,
    color: 'bg-sunrise-orange/20 text-sunrise-orange',
  },
];

const recentActivities = [
  { action: 'New promotion created', item: 'THUNDER 20% OFF', time: '2 hours ago' },
  { action: 'Video uploaded', item: 'Grape Cultivation Guide', time: '5 hours ago' },
  { action: 'Product updated', item: 'TANGENT dosage info', time: '1 day ago' },
  { action: 'News published', item: 'Export update 2024', time: '2 days ago' },
];

const quickActions = [
  { label: 'Add Product', path: '/admin/products', icon: Package },
  { label: 'Create Promotion', path: '/admin/promotions', icon: TrendingUp },
  { label: 'Upload Video', path: '/admin/videos', icon: PlayCircle },
  { label: 'Send Notification', path: '/admin/notifications', icon: Bell },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-secondary' : 'text-destructive'
                }`}>
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all group"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.item}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* App Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">App Usage Analytics</h2>
          <select className="px-3 py-1.5 rounded-lg bg-muted text-sm border-0 focus:ring-2 focus:ring-primary">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Page Views</span>
            </div>
            <p className="text-2xl font-bold">45,892</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Download className="w-4 h-4" />
              <span className="text-sm">App Downloads</span>
            </div>
            <p className="text-2xl font-bold">2,341</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Active Users</span>
            </div>
            <p className="text-2xl font-bold">8,456</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
