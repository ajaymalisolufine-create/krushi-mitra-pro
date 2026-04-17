import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityLog {
  id: string;
  user_id: string | null;
  phone: string | null;
  email: string | null;
  activity_type: string;
  screen_name: string | null;
  activity_data: Record<string, any> | null;
  created_at: string;
}

interface ProfileLite {
  user_id: string;
  name: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
}

const SCREEN_TYPES = [
  { key: 'all', label: 'All Screens' },
  { key: 'product_view', label: 'Product View' },
  { key: 'product_enquiry', label: 'Product Enquiry' },
  { key: 'promotion_view', label: 'Promotion' },
  { key: 'offer_click', label: 'Offer Click' },
  { key: 'banner_click', label: 'Banner Click' },
  { key: 'news_view', label: 'News View' },
  { key: 'video_view', label: 'Video View' },
  { key: 'search', label: 'Search' },
  { key: 'section_visit', label: 'Section Visit' },
  { key: 'login_success', label: 'Login' },
  { key: 'otp_sent', label: 'OTP Sent' },
];

// Pull a user-friendly title from activity_data (no descriptions)
const extractTitle = (log: ActivityLog): string => {
  const d = log.activity_data || {};
  const candidates = [
    d.product_name, d.productName,
    d.offer_name, d.offerName,
    d.promotion_name, d.promotionName, d.promotion_title,
    d.banner_title, d.bannerTitle,
    d.news_title, d.newsTitle, d.title,
    d.video_title, d.videoTitle,
    d.query, d.search_query,
    d.name,
  ];
  const found = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
  if (found) return String(found);
  if (log.activity_type === 'section_visit' && log.screen_name) return log.screen_name;
  return '-';
};

export const AdminFarmerActivity = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [screenFilter, setScreenFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['farmer-activity', screenFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('farmer_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (screenFilter !== 'all') query = query.eq('activity_type', screenFilter);
      if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
      if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ActivityLog[];
    },
  });

  // Fetch profiles for joining (name, state, district)
  const userIds = useMemo(
    () => Array.from(new Set(logs.map((l) => l.user_id).filter(Boolean))) as string[],
    [logs],
  );

  const { data: profiles = [] } = useQuery({
    queryKey: ['farmer-activity-profiles', userIds.join(',')],
    queryFn: async () => {
      if (userIds.length === 0) return [] as ProfileLite[];
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, name, phone, state, district')
        .in('user_id', userIds);
      if (error) throw error;
      return (data || []) as ProfileLite[];
    },
    enabled: userIds.length > 0,
  });

  const profileMap = useMemo(() => {
    const m = new Map<string, ProfileLite>();
    profiles.forEach((p) => m.set(p.user_id, p));
    return m;
  }, [profiles]);

  const getRow = (log: ActivityLog) => {
    const p = log.user_id ? profileMap.get(log.user_id) : undefined;
    const dataAny = (log.activity_data || {}) as Record<string, any>;
    return {
      name: p?.name || dataAny._name || '-',
      phone: p?.phone || log.phone || '-',
      state: p?.state || dataAny._state || '-',
      district: p?.district || dataAny._district || '-',
      screen: log.screen_name || log.activity_type.replace(/_/g, ' '),
      title: extractTitle(log),
    };
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter((log) => {
      const r = getRow(log);
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.screen.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, searchQuery, profileMap]);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Farmer Activity</h1>
        <p className="text-muted-foreground">
          Track farmer interactions ({filteredLogs.length} records)
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name, mobile, state, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={screenFilter} onValueChange={setScreenFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Screen Type" />
          </SelectTrigger>
          <SelectContent>
            {SCREEN_TYPES.map((t) => (
              <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="To date"
        />
      </div>

      {/* Activity Table */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium whitespace-nowrap">Date</th>
                <th className="px-4 py-3 font-medium">User Name</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Mobile</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Screen</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const r = getRow(log);
                  return (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{r.phone}</td>
                      <td className="px-4 py-3 text-xs">{r.state}</td>
                      <td className="px-4 py-3 text-xs">{r.district}</td>
                      <td className="px-4 py-3 text-xs capitalize">
                        {r.screen.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[280px] truncate">
                        {r.title}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
