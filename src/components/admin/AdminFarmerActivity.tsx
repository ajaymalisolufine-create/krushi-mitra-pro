import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Filter, Users, Eye, MousePointer } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

const ACTIVITY_TYPES = [
  { key: 'all', label: 'All Activities' },
  { key: 'product_view', label: 'Product Views' },
  { key: 'search', label: 'Searches' },
  { key: 'section_visit', label: 'Section Visits' },
  { key: 'otp_sent', label: 'OTP Sent' },
  { key: 'login_success', label: 'Logins' },
];

export const AdminFarmerActivity = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['farmer-activity', activityFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('farmer_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (activityFilter !== 'all') {
        query = query.eq('activity_type', activityFilter);
      }
      if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00`);
      }
      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ActivityLog[];
    },
  });

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.email?.toLowerCase().includes(q) ||
      log.phone?.includes(q) ||
      log.screen_name?.toLowerCase().includes(q) ||
      log.activity_type.toLowerCase().includes(q) ||
      JSON.stringify(log.activity_data || {}).toLowerCase().includes(q)
    );
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product_view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'search': return <Search className="w-4 h-4 text-amber-500" />;
      case 'section_visit': return <MousePointer className="w-4 h-4 text-green-500" />;
      default: return <Users className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Farmer Activity History</h1>
        <p className="text-muted-foreground">Track farmer interactions and behavior ({filteredLogs.length} records)</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {ACTIVITY_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From date" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To date" />
      </div>

      {/* Activity Table */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Activity</th>
                <th className="text-left px-4 py-3 font-medium">Screen</th>
                <th className="text-left px-4 py-3 font-medium">Details</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">No activity logs found</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs truncate max-w-[150px]">{log.email || 'Anonymous'}</p>
                      {log.phone && <p className="text-xs text-muted-foreground">{log.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(log.activity_type)}
                        <span className="capitalize text-xs">{log.activity_type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.screen_name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.activity_data ? JSON.stringify(log.activity_data).slice(0, 80) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
