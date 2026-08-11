'use client';
import { useEffect, useState, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Target, Plus, X, ArrowRight } from 'lucide-react';

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
  eligibility: Record<string, unknown>;
  evidence_requirements: unknown[];
  created_at: string;
};

const OPP_TYPES = [
  'Guest Experience', 'Seasonal Activation', 'F&B Programme',
  'Adventure & Outdoor', 'Community Partnership', 'Event Activation',
  'Joint Venture', 'Co-marketing', 'Other',
];

const OPP_STATUSES = ['Draft', 'Under Review', 'Open', 'Active', 'Completed', 'Cancelled'];

const STATUS_STYLES: Record<string, string> = {
  Draft:       'text-[#617089] bg-white/5 border-white/10',
  'Under Review': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Open:        'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Active:      'text-[#9B6DFF] bg-[#9B6DFF]/10 border-[#9B6DFF]/20',
  Completed:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Cancelled:   'text-red-400 bg-red-400/10 border-red-400/20',
};

function CreateOpportunityModal({ orgId, onClose, onCreated }: {
  orgId: string;
  onClose: () => void;
  onCreated: (o: Opportunity) => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    opportunity_type: 'Guest Experience',
    status: 'Draft',
    district: '',
    province: 'KwaZulu-Natal',
    description: '',
    start_date: '',
    end_date: '',
    // stored in eligibility jsonb
    target_audience: '',
    business_categories: '',
    activation_goal: '',
    participation_requirements: '',
    expected_outputs: '',
    outcome_measures: '',
    visibility: 'Private',
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError(null);

    const eligibility: Record<string, string> = {};
    if (form.target_audience) eligibility.target_audience = form.target_audience;
    if (form.business_categories) eligibility.business_categories = form.business_categories;
    if (form.activation_goal) eligibility.activation_goal = form.activation_goal;
    if (form.participation_requirements) eligibility.participation_requirements = form.participation_requirements;
    if (form.expected_outputs) eligibility.expected_outputs = form.expected_outputs;
    if (form.outcome_measures) eligibility.outcome_measures = form.outcome_measures;
    eligibility.visibility = form.visibility;

    const payload: Record<string, unknown> = {
      organization_id: orgId,
      title: form.title,
      opportunity_type: form.opportunity_type,
      status: form.status.toLowerCase().replace(' ', '_'),
      district: form.district || null,
      province: form.province || null,
      description: form.description || null,
      eligibility,
      evidence_requirements: [],
    };
    if (form.start_date) payload.start_date = form.start_date;
    if (form.end_date) payload.end_date = form.end_date;

    const { data, error: err } = await supabase
      .from('opportunities')
      .insert(payload)
      .select().single();

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
          <button onClick={onClose} className="text-[#617089] hover:text-[#E6EDF5]"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. PILOT TEST — Southern Drakensberg Stay & Experience Partnership" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Type</label>
              <select value={form.opportunity_type} onChange={e => set('opportunity_type', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {OPP_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">District</label>
              <input value={form.district} onChange={e => set('district', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Underberg" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Province</label>
              <input value={form.province} onChange={e => set('province', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Visibility</label>
              <select value={form.visibility} onChange={e => set('visibility', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                <option>Private</option>
                <option>Internal</option>
                <option>Public</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Target Audience</label>
              <input value={form.target_audience} onChange={e => set('target_audience', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Leisure travellers, families" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Business Categories Required</label>
              <input value={form.business_categories} onChange={e => set('business_categories', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Adventure, F&B, Wellness" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
                placeholder="Describe the opportunity…" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Activation Goal</label>
              <input value={form.activation_goal} onChange={e => set('activation_goal', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="What does success look like?" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Participation Requirements</label>
              <textarea value={form.participation_requirements} onChange={e => set('participation_requirements', e.target.value)} rows={2}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
                placeholder="What must participating businesses provide or commit to?" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Expected Outputs</label>
              <input value={form.expected_outputs} onChange={e => set('expected_outputs', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. 3 curated experience packages, monthly activity calendar" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Outcome Measures</label>
              <input value={form.outcome_measures} onChange={e => set('outcome_measures', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Guest satisfaction score, bookings generated, revenue uplift" />
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

function StatusPill({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${STATUS_STYLES[label] ?? STATUS_STYLES['Draft']}`}>
      {label}
    </span>
  );
}

export default function OpportunitiesPage() {
  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .eq('organization_id', oid)
      .order('created_at', { ascending: false });
    setOpps(data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      {showCreate && orgId && (
        <CreateOpportunityModal orgId={orgId} onClose={() => setShowCreate(false)} onCreated={o => setOpps(prev => [o, ...prev])} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">Opportunities</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">
            {opps.length} opportunit{opps.length === 1 ? 'y' : 'ies'} · production database
          </p>
        </div>
        {orgId && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#C6A66B]/90">
            <Plus className="w-3.5 h-3.5" /> Create Opportunity
          </button>
        )}
      </div>

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && opps.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-4 rounded-xl border border-dashed border-white/10">
          <Target className="w-8 h-8 text-[#374151]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No opportunities yet</p>
            <p className="text-xs text-[#617089] mt-1">Create an opportunity to start the PULSE workflow</p>
          </div>
          {orgId && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 py-2 border border-[#C6A66B]/30 text-[#C6A66B] text-xs rounded hover:bg-[#C6A66B]/10">
              <Plus className="w-3.5 h-3.5" /> Create Opportunity
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {opps.map(o => (
          <div key={o.id} className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusPill status={o.status} />
                  <span className="text-[10px] text-[#617089] uppercase tracking-widest">{o.opportunity_type}</span>
                  {(o.eligibility as Record<string, string>)?.visibility && (
                    <span className="text-[10px] text-[#617089]">· {(o.eligibility as Record<string, string>).visibility}</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-[#E6EDF5]">{o.title}</h3>
                {o.description && <p className="text-xs text-[#9BA7B8] line-clamp-2">{o.description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-[#617089]">
                  {o.district && <span>📍 {o.district}</span>}
                  {o.start_date && <span>📅 {new Date(o.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  {o.end_date && <span>→ {new Date(o.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </div>
              </div>
              <a href={`/viability?opportunity_id=${o.id}`}
                className="flex items-center gap-1 text-xs text-[#C6A66B] hover:underline flex-shrink-0">
                Assess <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
