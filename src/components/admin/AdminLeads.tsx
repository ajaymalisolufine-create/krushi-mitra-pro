import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Phone, MessageCircle, Download, Search, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

type Lead = {
  id: string;
  created_at: string;
  name: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
  source_type: string;
  source_title: string | null;
  product_name: string | null;
  status: string;
  notes: string | null;
};

const STATUSES = ['new', 'contacted', 'converted', 'closed'] as const;
const SOURCES = ['all', 'product', 'offer', 'promotion', 'news', 'video'] as const;

export const AdminLeads = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ status: string; notes: string }>({ status: 'new', notes: '' });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['admin-leads'],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_enquiries')
        .select('id, created_at, name, phone, state, district, village, source_type, source_title, product_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase.from('product_enquiries').update({ status, notes }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Lead updated');
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['admin-leads'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Update failed'),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter(l => {
      if (sourceFilter !== 'all' && l.source_type !== sourceFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (from && new Date(l.created_at) < new Date(from)) return false;
      if (to && new Date(l.created_at) > new Date(to + 'T23:59:59')) return false;
      if (q) {
        const hay = `${l.name || ''} ${l.phone || ''} ${l.state || ''} ${l.district || ''} ${l.village || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, sourceFilter, statusFilter, from, to]);

  const exportCSV = () => {
    const headers = ['Date', 'Name', 'Mobile', 'State', 'District', 'Village', 'Type', 'Details', 'Status', 'Notes'];
    const rows = filtered.map(l => [
      format(new Date(l.created_at), 'yyyy-MM-dd HH:mm'),
      l.name || '',
      l.phone || '',
      l.state || '',
      l.district || '',
      l.village || '',
      l.source_type,
      l.source_title || l.product_name || '',
      l.status,
      (l.notes || '').replace(/\n/g, ' '),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEdit = (l: Lead) => {
    setEditingId(l.id);
    setDraft({ status: l.status, notes: l.notes || '' });
  };

  const callHref = (p: string | null) => (p ? `tel:${p.replace(/\s+/g, '')}` : '#');
  const waHref = (p: string | null, l: Lead) => {
    if (!p) return '#';
    const num = p.replace(/\D/g, '');
    const e164 = num.startsWith('91') ? num : `91${num}`;
    const text = encodeURIComponent(`Hello ${l.name || ''}, regarding your enquiry on ${l.source_title || l.product_name}`);
    return `https://wa.me/${e164}?text=${text}`;
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      new: 'bg-sky-blue/20 text-sky-blue',
      contacted: 'bg-harvest-gold/20 text-accent',
      converted: 'bg-secondary/20 text-secondary',
      closed: 'bg-muted text-muted-foreground',
    };
    return map[s] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Leads / Farmer Enquiries</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {leads.length} leads</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / mobile / district / village"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          {SOURCES.map(s => <option key={s} value={s}>{s === 'all' ? 'All types' : s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Farmer</th>
                  <th className="text-left px-3 py-2">Mobile</th>
                  <th className="text-left px-3 py-2">District / Village</th>
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-left px-3 py-2">Details</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No leads found</td></tr>
                )}
                {filtered.map(l => {
                  const editing = editingId === l.id;
                  return (
                    <tr key={l.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2 whitespace-nowrap">{format(new Date(l.created_at), 'dd MMM HH:mm')}</td>
                      <td className="px-3 py-2">{l.name || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{l.phone || '—'}</td>
                      <td className="px-3 py-2 text-xs">
                        <div>{l.district || '—'}</div>
                        <div className="text-muted-foreground">{l.village || ''}</div>
                      </td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-muted text-xs capitalize">{l.source_type}</span></td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={l.source_title || l.product_name || ''}>
                        {l.source_title || l.product_name || '—'}
                      </td>
                      <td className="px-3 py-2">
                        {editing ? (
                          <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
                            className="px-2 py-1 rounded-md bg-muted text-xs">
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusBadge(l.status)}`}>{l.status}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {l.phone && (
                            <>
                              <a href={callHref(l.phone)} className="p-1.5 rounded-md hover:bg-muted" title="Call">
                                <Phone className="w-4 h-4 text-primary" />
                              </a>
                              <a href={waHref(l.phone, l)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-muted" title="WhatsApp">
                                <MessageCircle className="w-4 h-4 text-secondary" />
                              </a>
                            </>
                          )}
                          {editing ? (
                            <button onClick={() => updateLead.mutate({ id: l.id, status: draft.status, notes: draft.notes })}
                              className="p-1.5 rounded-md hover:bg-muted" title="Save">
                              {updateLead.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-primary" />}
                            </button>
                          ) : (
                            <button onClick={() => startEdit(l)} className="text-xs text-primary px-2 py-1 hover:underline">Edit</button>
                          )}
                        </div>
                        {editing && (
                          <textarea value={draft.notes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                            placeholder="Notes" rows={2}
                            className="mt-1 w-48 px-2 py-1 rounded-md bg-muted text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                        )}
                        {!editing && l.notes && (
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 max-w-[200px]" title={l.notes}>{l.notes}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
