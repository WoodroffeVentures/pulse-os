'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Wrench, CheckCircle2, Clock, AlertCircle, Plus, X } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  property_id: string | null;
  notes: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
};

type Property = { id: string; name: string; };

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['pending', 'in_progress', 'completed', 'overdue'];

function PriorityChip({ p }: { p: string }) {
  const map: Record<string, [string, string]> = {
    urgent: ['#D45D5D', '#D45D5D18'],
    high: ['#D68B5C', '#D68B5C18'],
    medium: ['#C6A66B', '#C6A66B18'],
    low: ['#617089', '#61708918'],
  };
  const [color, bg] = map[p] ?? ['#617089', '#61708918'];
  return (
    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border"
      style={{ color, background: bg, borderColor: `${color}44` }}>
      {p}
    </span>
  );
}

function StatusChip({ s }: { s: string }) {
  const map: Record<string, [string, string]> = {
    pending: ['#617089', '#61708918'],
    in_progress: ['#C6A66B', '#C6A66B18'],
    completed: ['#2BB8A5', '#2BB8A518'],
    overdue: ['#D45D5D', '#D45D5D18'],
  };
  const [color, bg] = map[s] ?? ['#617089', '#61708918'];
  return (
    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border font-semibold"
      style={{ color, background: bg, borderColor: `${color}44` }}>
      {s.replace('_', ' ')}
    </span>
  );
}

function CreateIssueModal({ orgId, properties, onClose, onSaved }: {
  orgId: string; properties: Property[]; onClose: () => void; onSaved: (t: Task) => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({ title: '', property_id: '', priority: 'medium', notes: '', due_at: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) { setError('Issue title is required.'); return; }
    setSaving(true); setError(null);
    const { data, error: err } = await supabase.from('tasks').insert({
      organization_id: orgId,
      property_id: form.property_id || null,
      title: form.title.trim(),
      category: 'maintenance',
      priority: form.priority,
      status: 'pending',
      notes: form.notes.trim() || null,
      due_at: form.due_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved(data as Task);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-[#08111f] border border-white/10 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[#E6EDF5]">Log Maintenance Issue</h2>
          <button onClick={onClose} className="text-[#617089] hover:text-[#E6EDF5]"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Issue Description *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
              placeholder="e.g. Geyser not heating — Woody's Cottage" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Property</label>
            <select value={form.property_id} onChange={e => set('property_id', e.target.value)}
              className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
              <option value="">Not property-specific</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Target Date</label>
              <input type="date" value={form.due_at} onChange={e => set('due_at', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
              placeholder="Description, location within property, what was tried…" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-[#9BA7B8] border border-white/10 rounded hover:bg-white/5">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 text-xs text-[#020912] bg-[#C6A66B] rounded hover:bg-[#C6A66B]/90 disabled:opacity-50">
            {saving ? 'Saving…' : 'Log Issue'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [fetching, setFetching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const [tRes, pRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('organization_id', oid).eq('category', 'maintenance').order('created_at', { ascending: false }),
      supabase.from('properties').select('id,name').eq('organization_id', oid).order('name'),
    ]);
    setTasks(tRes.data ?? []);
    setProperties(pRes.data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  async function markStatus(task: Task, status: string) {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('tasks')
      .update({ status, updated_at: now })
      .eq('id', task.id).select().single();
    if (!error && data) setTasks(prev => prev.map(t => t.id === task.id ? data as Task : t));
  }

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  const displayed = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const open = tasks.filter(t => t.status !== 'completed').length;
  const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

  const propName = (id: string | null) => id ? (properties.find(p => p.id === id)?.name ?? id) : 'Not property-specific';

  return (
    <div className="space-y-6">
      {creating && orgId && (
        <CreateIssueModal
          orgId={orgId}
          properties={properties}
          onClose={() => setCreating(false)}
          onSaved={t => { setTasks(prev => [t, ...prev]); setCreating(false); }}
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">Maintenance</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">Operational defects, follow-ups and guest-impacting issues.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#020912] bg-[#C6A66B] rounded hover:bg-[#C6A66B]/90">
          <Plus className="w-3.5 h-3.5" /> Log Issue
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Open Issues</div>
          <div className="text-2xl font-mono font-semibold text-[#E6EDF5]">{open}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Urgent</div>
          <div className="text-2xl font-mono font-semibold text-[#D45D5D]">{urgent}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Resolved</div>
          <div className="text-2xl font-mono font-semibold text-[#2BB8A5]">{tasks.filter(t => t.status === 'completed').length}</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded border transition-colors ${filter === s ? 'bg-[#C6A66B]/10 text-[#C6A66B] border-[#C6A66B]/30' : 'text-[#617089] border-white/10 hover:border-white/20'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl border border-dashed border-white/10">
          <Wrench className="w-8 h-8 text-[#374151]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">{filter === 'all' ? 'No maintenance issues logged' : `No ${filter.replace('_', ' ')} issues`}</p>
            <p className="text-xs text-[#617089] mt-1">Log issues to track defects, repairs and follow-ups across properties.</p>
          </div>
          <button onClick={() => setCreating(true)} className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">
            Log first issue
          </button>
        </div>
      )}

      <div className="space-y-2">
        {displayed.map(task => (
          <div key={task.id} className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {task.status === 'completed'
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : task.status === 'overdue'
                  ? <AlertCircle className="w-4 h-4 text-[#D45D5D]" />
                  : <Clock className="w-4 h-4 text-[#D68B5C]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-[#617089] line-through' : 'text-[#E6EDF5]'}`}>
                    {task.title}
                  </span>
                  <PriorityChip p={task.priority} />
                  <StatusChip s={task.status} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#617089]">
                  <span>{propName(task.property_id)}</span>
                  {task.due_at && <span>Target {new Date(task.due_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>}
                  <span>Logged {new Date(task.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                </div>
                {task.notes && <p className="text-xs text-[#9BA7B8] mt-1">{task.notes}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {task.status !== 'in_progress' && task.status !== 'completed' && (
                  <button onClick={() => markStatus(task, 'in_progress')}
                    className="text-[10px] px-2 py-1 rounded border border-white/10 text-[#9BA7B8] hover:text-[#E6EDF5] hover:border-[#C6A66B]/30">
                    In Progress
                  </button>
                )}
                {task.status !== 'completed' && (
                  <button onClick={() => markStatus(task, 'completed')}
                    className="text-[10px] px-2 py-1 rounded border border-emerald-500/30 text-emerald-400 hover:bg-emerald-400/10">
                    Resolve
                  </button>
                )}
                {task.status === 'completed' && (
                  <button onClick={() => markStatus(task, 'pending')}
                    className="text-[10px] px-2 py-1 rounded border border-white/10 text-[#617089] hover:text-[#9BA7B8]">
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
