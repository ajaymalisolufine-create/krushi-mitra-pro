import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Download, MapPin, Phone, Mail, Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const useFarmers = () => useQuery({
  queryKey: ['admin-farmers'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  refetchInterval: 60_000,
});

export const AdminFarmers = () => {
  const { data: farmers = [], isLoading } = useFarmers();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const states = useMemo(() => Array.from(new Set(farmers.map((f: any) => f.state).filter(Boolean))).sort(), [farmers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return farmers.filter((f: any) => {
      if (stateFilter && f.state !== stateFilter) return false;
      if (!q) return true;
      return (
        (f.name || '').toLowerCase().includes(q) ||
        (f.phone || '').toLowerCase().includes(q) ||
        (f.email || '').toLowerCase().includes(q) ||
        (f.city || '').toLowerCase().includes(q) ||
        (f.district || '').toLowerCase().includes(q) ||
        (f.pincode || '').toLowerCase().includes(q)
      );
    });
  }, [farmers, search, stateFilter]);

  const exportCsv = () => {
    const headers = ['Name', 'Mobile', 'Email', 'City/Village', 'District', 'State', 'Pincode', 'Language', 'Registered On', 'Last Active'];
    const rows = filtered.map((f: any) => [
      f.name || '', f.phone || '', f.email || '', f.city || '', f.district || '',
      f.state || '', f.pincode || '', f.language || '',
      f.first_install_at ? format(new Date(f.first_install_at), 'yyyy-MM-dd HH:mm') : f.created_at ? format(new Date(f.created_at), 'yyyy-MM-dd HH:mm') : '',
      f.last_active_at ? format(new Date(f.last_active_at), 'yyyy-MM-dd HH:mm') : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmers_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" />Farmer Registration Details</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} of {farmers.length} farmers</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, mobile, email, village, district, pincode..." className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted border border-border text-sm" />
        </div>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-muted border border-border text-sm">
          <option value="">All States</option>
          {states.map((s: any) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No farmers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Farmer</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Registered</th>
                  <th className="px-4 py-3 text-left">Last Active</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f: any) => {
                  const isReturning = f.last_active_at && f.first_install_at && new Date(f.last_active_at).getTime() - new Date(f.first_install_at).getTime() > 60_000;
                  return (
                    <tr key={f.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(f)}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{f.name || '—'}</div>
                        {f.email && <div className="text-xs text-muted-foreground">{f.email}</div>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{f.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs">{[f.city, f.district].filter(Boolean).join(', ')}</div>
                        <div className="text-xs text-muted-foreground">{[f.state, f.pincode].filter(Boolean).join(' • ')}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{f.first_install_at || f.created_at ? format(new Date(f.first_install_at || f.created_at), 'dd MMM yyyy') : '—'}</td>
                      <td className="px-4 py-3 text-xs">{f.last_active_at ? format(new Date(f.last_active_at), 'dd MMM yyyy HH:mm') : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isReturning ? 'bg-secondary/20 text-secondary' : 'bg-primary/10 text-primary'}`}>
                          {isReturning ? 'Existing Farmer' : 'New Farmer'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{selected.name || 'Farmer Profile'}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {selected.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><span>{selected.phone}</span></div>}
              {selected.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><span>{selected.email}</span></div>}
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <div>{[selected.city, selected.district].filter(Boolean).join(', ')}</div>
                  <div className="text-xs text-muted-foreground">{[selected.state, selected.pincode].filter(Boolean).join(' • ')}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div><div className="text-xs text-muted-foreground">Language</div><div>{selected.language || '—'}</div></div>
                <div><div className="text-xs text-muted-foreground">Crop</div><div>{selected.selected_crop || '—'}</div></div>
                <div><div className="text-xs text-muted-foreground">Registered</div><div>{selected.first_install_at || selected.created_at ? format(new Date(selected.first_install_at || selected.created_at), 'dd MMM yyyy HH:mm') : '—'}</div></div>
                <div><div className="text-xs text-muted-foreground">Last Active</div><div>{selected.last_active_at ? format(new Date(selected.last_active_at), 'dd MMM yyyy HH:mm') : '—'}</div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
