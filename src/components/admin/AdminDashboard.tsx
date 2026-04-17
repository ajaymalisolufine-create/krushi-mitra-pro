import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Package, PlayCircle, Bell, TrendingUp, ArrowUpRight, ArrowDownRight,
  ShoppingBag, Activity, CheckCircle2, Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const POLL_MS = 60_000;

const useDashboardData = () =>
  useQuery({
    queryKey: ['admin-dashboard'],
    refetchInterval: POLL_MS,
    queryFn: async () => {
      const now = new Date();
      const day1 = subDays(now, 1).toISOString();
      const day7 = subDays(now, 7).toISOString();
      const day14 = subDays(now, 14).toISOString();

      const [
        farmersTotal, farmersPrev, dau, wau, installed, installedPrev,
        productsCount, notifActive, videoSum, leadsTotal, leadsToday,
        leadsConverted, leadsPending, activityWeek,
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).lt('created_at', day7),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('last_active_at', day1),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('last_active_at', day7),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).not('first_install_at', 'is', null),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).not('first_install_at', 'is', null).lt('first_install_at', day7),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).in('status', ['sent', 'scheduled']),
        supabase.from('videos').select('views'),
        supabase.from('product_enquiries').select('id', { count: 'exact', head: true }),
        supabase.from('product_enquiries').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay(now).toISOString()),
        supabase.from('product_enquiries').select('id', { count: 'exact', head: true }).eq('status', 'converted'),
        supabase.from('product_enquiries').select('id', { count: 'exact', head: true }).in('status', ['new', 'contacted']),
        supabase.from('farmer_activity_logs').select('created_at, activity_type').gte('created_at', day14),
      ]);

      const totalVideoViews = (videoSum.data || []).reduce((s, v: any) => s + (v.views || 0), 0);

      // 7-day chart series
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(now, 6 - i);
        return { key: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE') };
      });
      const series = days.map(d => ({ day: d.label, views: 0, enquiries: 0 }));
      (activityWeek.data || []).forEach((row: any) => {
        const k = format(new Date(row.created_at), 'yyyy-MM-dd');
        const idx = days.findIndex(d => d.key === k);
        if (idx >= 0) {
          if (row.activity_type === 'enquire_now') series[idx].enquiries += 1;
          else series[idx].views += 1;
        }
      });

      return {
        farmersTotal: farmersTotal.count || 0,
        farmersGrowth: pct(farmersTotal.count || 0, farmersPrev.count || 0),
        dau: dau.count || 0,
        wau: wau.count || 0,
        installed: installed.count || 0,
        installedGrowth: pct(installed.count || 0, installedPrev.count || 0),
        productsCount: productsCount.count || 0,
        notifActive: notifActive.count || 0,
        totalVideoViews,
        leadsTotal: leadsTotal.count || 0,
        leadsToday: leadsToday.count || 0,
        leadsConverted: leadsConverted.count || 0,
        leadsPending: leadsPending.count || 0,
        series,
      };
    },
  });

const useRecentActivity = () =>
  useQuery({
    queryKey: ['admin-recent-activity'],
    refetchInterval: POLL_MS,
    queryFn: async () => {
      const [products, promos, videos, news] = await Promise.all([
        supabase.from('products').select('id, name, created_at, updated_at').order('updated_at', { ascending: false }).limit(3),
        supabase.from('promotions').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('videos').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('news').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
      ]);
      const items = [
        ...(products.data || []).map((p: any) => ({ kind: 'Product', title: p.name, ts: p.updated_at })),
        ...(promos.data || []).map((p: any) => ({ kind: 'Promotion', title: p.title, ts: p.created_at })),
        ...(videos.data || []).map((p: any) => ({ kind: 'Video', title: p.title, ts: p.created_at })),
        ...(news.data || []).map((p: any) => ({ kind: 'News', title: p.title, ts: p.created_at })),
      ];
      return items.sort((a, b) => +new Date(b.ts) - +new Date(a.ts)).slice(0, 8);
    },
  });

function pct(curr: number, prev: number): { value: number; trend: 'up' | 'down' | 'flat' } {
  if (prev === 0) return { value: curr > 0 ? 100 : 0, trend: curr > 0 ? 'up' : 'flat' };
  const v = ((curr - prev) / prev) * 100;
  return { value: Math.round(v), trend: v > 0 ? 'up' : v < 0 ? 'down' : 'flat' };
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, dataUpdatedAt } = useDashboardData();
  const { data: recent = [] } = useRecentActivity();

  useEffect(() => {
    document.title = 'Admin Dashboard';
  }, []);

  const stats = useMemo(() => {
    const d = data;
    return [
      { title: 'Total Farmers', value: d?.farmersTotal ?? 0, change: d?.farmersGrowth, icon: Users, color: 'bg-secondary/20 text-secondary' },
      { title: 'Active (7d)', value: d?.wau ?? 0, sub: `${d?.dau ?? 0} today`, icon: Activity, color: 'bg-primary/20 text-primary' },
      { title: 'Installed', value: d?.installed ?? 0, change: d?.installedGrowth, icon: TrendingUp, color: 'bg-sky-blue/20 text-sky-blue' },
      { title: 'Video Views', value: d?.totalVideoViews ?? 0, icon: PlayCircle, color: 'bg-harvest-gold/20 text-accent' },
      { title: 'Products', value: d?.productsCount ?? 0, icon: Package, color: 'bg-harvest-gold/20 text-accent' },
      { title: 'Active Notifications', value: d?.notifActive ?? 0, icon: Bell, color: 'bg-sunrise-orange/20 text-sunrise-orange' },
    ];
  }, [data]);

  const leadStats = [
    { title: 'Total Leads', value: data?.leadsTotal ?? 0, icon: ShoppingBag, color: 'bg-primary/20 text-primary', path: '/admin/leads' },
    { title: "Today's Leads", value: data?.leadsToday ?? 0, icon: Clock, color: 'bg-sky-blue/20 text-sky-blue', path: '/admin/leads' },
    { title: 'Converted', value: data?.leadsConverted ?? 0, icon: CheckCircle2, color: 'bg-secondary/20 text-secondary', path: '/admin/leads' },
    { title: 'Pending', value: data?.leadsPending ?? 0, icon: Bell, color: 'bg-sunrise-orange/20 text-sunrise-orange', path: '/admin/leads' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Auto-refresh every 60s {dataUpdatedAt ? `· updated ${format(new Date(dataUpdatedAt), 'HH:mm:ss')}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.change.trend === 'up' ? 'text-secondary' : stat.change.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.change.value}%
                    {stat.change.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : stat.change.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xl font-bold">{isLoading ? '…' : stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                {stat.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leads cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Leads Overview</h2>
          <button onClick={() => navigate('/admin/leads')} className="text-sm text-primary hover:underline">View all leads →</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {leadStats.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.title} onClick={() => navigate(s.path)}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50 text-left hover:border-primary transition-colors">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold mt-3">{isLoading ? '…' : s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <h2 className="font-semibold mb-4">Last 7 days · Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.series || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Page views" />
                <Bar dataKey="enquiries" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Enquiries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No recent items.</p>}
            {recent.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.kind}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(new Date(r.ts), 'dd MMM HH:mm')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
