'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Network, Plus, X, Globe, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

type BusinessProfile = {
  id: string;
  business_name: string;
  google_place_id: string | null;
  website_url: string | null;
  verification_status: string;
  consistency_score: number | null;
  verified_signals: Record<string, unknown>;
  created_at: string;
};

const EVIDENCE_STATES = [
  'Self-entered',
  'Place matched',
  'Contact confirmed',
  'Evidence submitted',
  'Human reviewed',
  'Google ownership connected',
  'Missing',
  'Disputed',
] as const;

const BUSINESS_CATEGORIES = [
  'Accommodation', 'Food & Beverage', 'Adventure & Outdoor', 'Wellness & Spa',
  'Arts & Culture', 'Retail', 'Transport', 'Events & Entertainment',
  'Agriculture', 'Eco & Conservation', 'Community Services', 'Other',
];

const VERIFICATION_STYLES: Record<string, string> = {
  verified:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  unverified: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  rejected:   'text-red-400 bg-red-400/10 border-red-400/20',
};

function CreateBusinessModal({ orgId, onClose, onCreated }: {
  orgId: string;
  onClose: () => void;
  onCreated: (b: BusinessProfile) => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: '',
    category: 'Accommodation',
    district: '',
    province: 'KwaZulu-Natal',
    website_url: '',
    phone: '',
    email: '',
    google_place_id: '',
    google_maps_url: '',
    evidence_state: 'Self-entered' as typeof EVIDENCE_STATES[number],
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.business_name.trim()) { setError('Business name is required.'); return; }
    setSaving(true); setError(null);

    const verified_signals = {
      category: form.category,
      district: form.district,
      province: form.province,
      phone: form.phone,
      email: form.email,
      google_maps_url: form.google_maps_url,
      evidence_state: form.evidence_state,
      google_integration: 'Manual Evidence Only',
    };

    const { data, error: err } = await supabase
      .from('business_profiles')
      .insert({
        business_name: form.business_name,
        organization_id: orgId,
        google_place_id: form.google_place_id || null,
        website_url: form.website_url || null,
        verification_status: 'unverified',
        verified_signals,
      })
      .select().single();

    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated(data as BusinessProfile);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-10 px-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#08111f] border border-white/10 rounded-xl shadow-2xl mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[#E6EDF5]">Add Business Profile</h2>
          <button onClick={onClose} className="text-[#617089] hover:text-[#E6EDF5]"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}

          <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-xs text-amber-400">
            Google integration: Manual Evidence Only — a public Place ID or listing does not constitute verified ownership.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Business Name *</label>
              <input value={form.business_name} onChange={e => set('business_name', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Farmstead Hospitality" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {BUSINESS_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Evidence State</label>
              <select value={form.evidence_state} onChange={e => set('evidence_state', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {EVIDENCE_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">District / Area</label>
              <input value={form.district} onChange={e => set('district', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Underberg" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Province</label>
              <input value={form.province} onChange={e => set('province', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="KwaZulu-Natal" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="+27 …" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Email</label>
              <input value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="hello@…" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Website</label>
              <input value={form.website_url} onChange={e => set('website_url', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="https://" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Google Maps URL</label>
              <input value={form.google_maps_url} onChange={e => set('google_maps_url', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="https://maps.google.com/…" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Google Place ID</label>
              <input value={form.google_place_id} onChange={e => set('google_place_id', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="ChIJ… (optional — used for place matching, not ownership proof)" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-[#9BA7B8] border border-white/10 rounded hover:bg-[#08111f]">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 text-xs text-[#020912] bg-[#C6A66B] rounded hover:bg-[#C6A66B]/90 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ b }: { b: BusinessProfile }) {
  const [expanded, setExpanded] = useState(false);
  const signals = b.verified_signals ?? {};
  const evidenceState = (signals.evidence_state as string) ?? 'Self-entered';

  return (
    <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#E6EDF5]">{b.business_name}</h3>
          {signals.category != null && <p className="text-xs text-[#9BA7B8] mt-0.5">{signals.category as string}</p>}
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest flex-shrink-0 ${VERIFICATION_STYLES[b.verification_status] ?? VERIFICATION_STYLES.unverified}`}>
          {b.verification_status}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px]">
          {evidenceState === 'Human reviewed' || evidenceState === 'Google ownership connected'
            ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            : evidenceState === 'Disputed' || evidenceState === 'Missing'
            ? <AlertCircle className="w-3 h-3 text-red-400" />
            : <Clock className="w-3 h-3 text-amber-400" />
          }
          <span className="text-[#9BA7B8]">Evidence: {evidenceState}</span>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-[#617089] hover:text-[#E6EDF5] flex items-center gap-1 text-[10px]">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Less' : 'Details'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          {signals.district != null && <div className="text-xs text-[#617089]">📍 {signals.district as string}{signals.province != null ? `, ${signals.province as string}` : ''}</div>}
          {b.website_url && <div className="text-xs text-[#617089]"><Globe className="w-3 h-3 inline mr-1" /><a href={b.website_url} target="_blank" rel="noreferrer" className="hover:text-[#C6A66B]">{b.website_url.replace(/^https?:\/\//, '')}</a></div>}
          {signals.phone != null && <div className="text-xs text-[#617089]">📞 {signals.phone as string}</div>}
          {signals.email != null && <div className="text-xs text-[#617089]">✉ {signals.email as string}</div>}
          {signals.google_maps_url != null && <div className="text-xs text-[#617089]"><a href={signals.google_maps_url as string} target="_blank" rel="noreferrer" className="text-[#C6A66B] hover:underline">Google Maps →</a></div>}
          {b.google_place_id && <div className="text-[10px] text-[#374151] font-mono">Place ID: {b.google_place_id}</div>}
          <div className="mt-2 p-2 rounded bg-amber-400/5 border border-amber-400/10 text-[10px] text-amber-500">
            Google integration: Manual Evidence Only
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessesPage() {
  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const { data } = await supabase.from('business_profiles').select('*').eq('organization_id', oid).order('business_name');
    setBusinesses(data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      {showCreate && orgId && (
        <CreateBusinessModal orgId={orgId} onClose={() => setShowCreate(false)} onCreated={b => { setBusinesses(prev => [...prev, b]); }} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">Business Profiles</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">
            {businesses.length} profile{businesses.length !== 1 ? 's' : ''} · evidence states power viability scoring
          </p>
        </div>
        {orgId && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#C6A66B]/90">
            <Plus className="w-3.5 h-3.5" /> Add Business
          </button>
        )}
      </div>

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && businesses.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-4 rounded-xl border border-dashed border-white/10">
          <Network className="w-8 h-8 text-[#374151]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No business profiles yet</p>
            <p className="text-xs text-[#617089] mt-1">Add your business to participate in opportunities and receive viability assessments</p>
          </div>
          {orgId && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 py-2 border border-[#C6A66B]/30 text-[#C6A66B] text-xs rounded hover:bg-[#C6A66B]/10">
              <Plus className="w-3.5 h-3.5" /> Add Business
            </button>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {businesses.map(b => <BusinessCard key={b.id} b={b} />)}
      </div>
    </div>
  );
}
