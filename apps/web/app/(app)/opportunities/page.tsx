'use client';
import { useEffect, useState, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Target, Plus, X, ArrowRight, Zap, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

type Opportunity = {
  id: string;
  title: string;
  opportunity_type: string;
  description: string | null;
  district: string | null;
  province: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  eligibility: Record<string, string>;
  evidence_requirements: unknown[];
  readiness_score: number | null;
  urgency: string | null;
  next_decision: string | null;
  created_at: string;
  _viability_count?: number;
  _participation_count?: number;
};

const OPP_TYPES = [
  'Guest Experience', 'Seasonal Activation', 'F&B Programme',
  'Adventure & Outdoor', 'Community Partnership', 'Event Activation',
  'Joint Venture', 'Co-marketing', 'Other',
];

const OPP_STATUSES = ['Draft', 'Under Review', 'Open', 'Active', 'Completed', 'Cancelled'];

const STATUS_STYLES: Record<string, string> = {
  draft:        'text-[#9BA7B8] bg-white/5 border-white/10',
  under_review: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  open:         'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  active:       'text-[#9B6DFF] bg-[#9B6DFF]/10 border-[#9B6DFF]/20',
  completed:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled:    'text-red-400 bg-red-400/10 border-red-400/20',
};

const URGENCY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high:     'text-amber-400',
  normal:   'text-[#9BA7B8]',
  low:      'text-[#9BA7B8]',
};

const FILTER_TABS = ['All', 'Draft', 'Under Review', 'Open', 'Active', 'Completed'] as const;
type FilterTab = typeof FILTER_TABS[number];

function pill(s: string) { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

function CreateOpportunityModal({ orgId, onClose, onCreated }: {
  orgId: string;
  onClose: () => void;
  onCreated: (o: Opportunity) => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', opportunity_type: 'Guest Experience', status: 'Draft',
    district: '', province: 'KwaZulu-Natal', description: '',
    start_date: '', end_date: '', target_audience: '', business_categories: '',
    activation_goal: '', participation_requirements: '', expected_outputs: '',
    outcome_measures: '', visibility: 'Private', urgency: 'normal',
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError(null);
    const eligibility: Record<string, string> = { visibility: form.visibility };
    if (form.target_audience) eligibility.target_audience = form.target_audience;
    if (form.business_categories) eligibility.business_categories = form.business_categories;
    if (form.activation_goal) eligibility.activation_goal = form.activation_goal;
    if (form.participation_requirements) eligibility.participation_requirements = form.participation_requirements;
    if (form.expected_outputs) eligibility.expected_outputs = form.expected_outputs;
    if (form.outcome_measures) eligibility.outcome_measures = form.outcome_measures;

    const payload: Record<string, unknown> = {
      organization_id: orgId,
      title: form.title,
      opportunity_type: form.opportunity_type,
      status: form.status.toLowerCase().replace(/ /g, '_'),
      district: form.district || null,
      province: form.province || null,
      description: form.description || null,
      eligibility,
      evidence_requirements: [],
      urgency: form.urgency,
    };
    if (form.start_date) payload.start_date = form.start_date;
    if (form.end_date) payload.end_date = form.end_date;

    const { data, error: err } = await supabase.from('opportunities').insert(payload).select().single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated(data as Opportunity);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-6 px-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#08111f] border border-white/10 rounded-xl shadow-2xl mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[#E6EDF5]">Create Opportunity</h2>
          <button onClick={onClose} className="text-[#9BA7B8] hover:text-[#E6EDF5]"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Southern Drakensberg Stay & Experience Partnership" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Type</label>
              <select value={form.opportunity_type} onChange={e => set('opportunity_type', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {OPP_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Urgency</label>
              <select value={form.urgency} onChange={e => set('urgency', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Visibility</label>
              <select value={form.visibility} onChange={e => set('visibility', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                <option>Private</option><option>Internal</option><option>Public</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">District</label>
              <input value={form.district} onChange={e => set('district', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Underberg" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Province</label>
              <input value={form.province} onChange={e => set('province', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
                placeholder="Describe the opportunity…" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Target Audience</label>
              <input value={form.target_audience} onChange={e => set('target_audience', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Leisure travellers, families" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Business Categories</label>
              <input value={form.business_categories} onChange={e => set('business_categories', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Adventure, F&B, Wellness" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Activation Goal</label>
              <input value={form.activation_goal} onChange={e => set('activation_goal', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="What does success look like?" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Outcome Measures</label>
              <input value={form.outcome_measures} onChange={e => set('outcome_measures', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Guest satisfaction score, bookings generated" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-[#9BA7B8] border border-white/10 rounded hover:bg-[#08111f]">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 text-xs text-[#020912] bg-[#C6A66B] rounded hover:bg-[#C6A66B]/90 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Opportunity'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RadarCard({ opp, onOpen }: { opp: Opportunity; onOpen: () => void }) {
  const statusKey = opp.status.toLowerCase().replace(/ /g, '_');
  const urgencyKey = (opp.urgency ?? 'normal').toLowerCase();
  const hasViability = (opp._viability_count ?? 0) > 0;
  const hasParticipation = (opp._participation_count ?? 0) > 0;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-white/10 bg-[#08111f] p-4 hover:border-[#C6A66B]/30 hover:bg-[#0a1425] transition-colors space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${STATUS_STYLES[statusKey] ?? STATUS_STYLES.draft}`}>
              {pill(opp.status)}
            </span>
            {opp.urgency && opp.urgency !== 'normal' && (
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${URGENCY_COLORS[urgencyKey] ?? ''}`}>
                ▲ {pill(opp.urgency)}
              </span>
            )}
            <span className="text-[10px] text-[#9BA7B8] uppercase tracking-widest">{opp.opportunity_type}</span>
          </div>
          <h3 className="text-sm font-semibold text-[#E6EDF5] leading-snug">{opp.title}</h3>
          {opp.description && <p className="text-xs text-[#9BA7B8] line-clamp-1">{opp.description}</p>}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#9BA7B8]">
            {opp.district && <span>📍 {opp.district}</span>}
            {opp.start_date && <span>📅 {new Date(opp.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
          </div>
        </div>

        {/* Readiness score */}
        <div className="flex-shrink-0 text-right min-w-[48px]">
          {opp.readiness_score !== null ? (
            <>
              <div className="text-xl font-bold text-[#C6A66B]">{Math.round(opp.readiness_score)}</div>
              <div className="text-[9px] text-[#9BA7B8] uppercase tracking-widest">readiness</div>
            </>
          ) : (
            <div className="text-[9px] text-[#9BA7B8] uppercase tracking-widest">unscored</div>
          )}
        </div>
      </div>

      {/* Journey progress indicators */}
      <div className="flex items-center gap-4 pt-1 border-t border-white/5">
        <div className={`flex items-center gap-1 text-[10px] ${hasViability ? 'text-emerald-400' : 'text-[#9BA7B8]'}`}>
          {hasViability ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          Viability{hasViability ? ` (${opp._viability_count})` : ''}
        </div>
        <div className={`flex items-center gap-1 text-[10px] ${hasParticipation ? 'text-emerald-400' : 'text-[#9BA7B8]'}`}>
          {hasParticipation ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          Participation{hasParticipation ? ` (${opp._participation_count})` : ''}
        </div>
        {opp.next_decision && (
          <div className="ml-auto flex items-center gap-1 text-[10px] text-amber-400">
            <AlertCircle className="w-3 h-3" />
            <span className="truncate max-w-[140px]">{opp.next_decision}</span>
          </div>
        )}
        <ArrowRight className="w-3.5 h-3.5 text-[#9BA7B8] ml-auto flex-shrink-0" />
      </div>
    </button>
  );
}

export default function OpportunityRadarPage() {
  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('All');

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const [oppsRes, vaRes, partRes] = await Promise.all([
      supabase.from('opportunities').select('*').eq('organization_id', oid).order('created_at', { ascending: false }),
      supabase.from('viability_analyses').select('opportunity_id').eq('organization_id', oid),
      supabase.from('participation_records').select('opportunity_id').eq('organization_id', oid),
    ]);

    const vaCounts: Record<string, number> = {};
    for (const v of vaRes.data ?? []) {
      vaCounts[v.opportunity_id] = (vaCounts[v.opportunity_id] ?? 0) + 1;
    }
    const partCounts: Record<string, number> = {};
    for (const p of partRes.data ?? []) {
      partCounts[p.opportunity_id] = (partCounts[p.opportunity_id] ?? 0) + 1;
    }

    const enriched: Opportunity[] = (oppsRes.data ?? []).map((o: any) => ({
      ...o,
      _viability_count: vaCounts[o.id] ?? 0,
      _participation_count: partCounts[o.id] ?? 0,
    }));

    // Sort: critical/high urgency first, then by created_at
    enriched.sort((a, b) => {
      const urgencyOrder: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
      const ua = urgencyOrder[a.urgency ?? 'normal'] ?? 2;
      const ub = urgencyOrder[b.urgency ?? 'normal'] ?? 2;
      if (ua !== ub) return ua - ub;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setOpps(enriched);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  function openWorkspace(id: string) {
    window.location.href = `/opportunities/${id}`;
  }

  const filtered = filterTab === 'All'
    ? opps
    : opps.filter(o => pill(o.status) === filterTab);

  if (loading) return <div className="p-6 text-[#9BA7B8] text-sm">Loading…</div>;

  const criticalCount = opps.filter(o => o.urgency === 'critical').length;
  const needsDecision = opps.filter(o => !o.next_decision).length;

  return (
    <div className="space-y-5">
      {showCreate && orgId && (
        <CreateOpportunityModal orgId={orgId} onClose={() => setShowCreate(false)} onCreated={o => { setOpps(prev => [o, ...prev]); }} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">Opportunity Radar</h1>
          <p className="mt-1 text-xs text-[#9BA7B8]">
            {opps.length} opportunit{opps.length === 1 ? 'y' : 'ies'}
            {criticalCount > 0 && <span className="ml-2 text-red-400">· {criticalCount} critical</span>}
            {needsDecision > 0 && <span className="ml-2 text-amber-400">· {needsDecision} need next decision</span>}
          </p>
        </div>
        {orgId && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#C6A66B]/90">
            <Plus className="w-3.5 h-3.5" /> New Opportunity
          </button>
        )}
      </div>

      {/* Radar legend */}
      <div className="flex items-center gap-4 text-[10px] text-[#9BA7B8] bg-[#08111f] border border-white/5 rounded-lg px-4 py-2.5">
        <Zap className="w-3 h-3 text-[#C6A66B] flex-shrink-0" />
        <span>Cards ranked by urgency · Click to open Workspace · Readiness score derives from viability assessments</span>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 border-b border-white/10 overflow-x-auto">
        {FILTER_TABS.map(t => (
          <button key={t} onClick={() => setFilterTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              filterTab === t ? 'border-[#C6A66B] text-[#C6A66B]' : 'border-transparent text-[#9BA7B8] hover:text-[#9BA7B8]'
            }`}
          >
            {t}
            {t !== 'All' && (
              <span className="ml-1.5 text-[9px] opacity-60">
                {opps.filter(o => pill(o.status) === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {fetching && <div className="text-[#9BA7B8] text-sm">Loading radar…</div>}

      {!fetching && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-4 rounded-xl border border-dashed border-white/10">
          <Target className="w-8 h-8 text-[#9BA7B8]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">{filterTab === 'All' ? 'No opportunities yet' : `No ${filterTab} opportunities`}</p>
            <p className="text-xs text-[#9BA7B8] mt-1">
              {filterTab === 'All' ? 'Create an opportunity to start the intelligence lifecycle' : 'Change the filter to see others'}
            </p>
          </div>
          {filterTab === 'All' && orgId && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 py-2 border border-[#C6A66B]/30 text-[#C6A66B] text-xs rounded hover:bg-[#C6A66B]/10">
              <Plus className="w-3.5 h-3.5" /> New Opportunity
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(o => (
          <RadarCard key={o.id} opp={o} onOpen={() => openWorkspace(o.id)} />
        ))}
      </div>
    </div>
  );
}
