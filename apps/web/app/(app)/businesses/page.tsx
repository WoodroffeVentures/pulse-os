'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Network, Plus, X, Globe, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type BusinessProfile = {
  id: string;
  business_name: string;
  google_place_id: string | null;
  website_url: string | null;
  verification_status: string;
  consistency_score: number | null;
  created_at: string;
};

const VERIFICATION_STYLES: Record<string, string> = {
  verified:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  unverified: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  rejected:   'text-red-400 bg-red-400/10 border-red-400/20',
};

function CreateBusinessModal({ orgId, onClose, onCreated }: { orgId: string; onClose: () => void; onCreated: (b: BusinessProfile) => void }) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ business_name: '', website_url: '', google_place_id: '' });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.business_name.trim()) { setError('Business name is required.'); return; }
    setSaving(true); setError(null);
    const { data, error: err } = await supabase
      .from('business_profiles')
      .insert({ ...form, organization_id: orgId, verification_status: 'unverified' })
      .select().single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated(data as BusinessProfile);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-16 px-4">
      <div className="w-full max-w-lg bg-[#08111f] border border-white/10 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[#E6EDF5]">Add Business Profile</h2>
          <button onClick={onClose} className="text-[#617089] hover:text-[#E6EDF5]"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Business Name *</label>
            <input value={form.business_name} onChange={e => set('business_name', e.target.value)}
              className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
              placeholder="e.g. Farmstead Hospitality" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Website</label>
            <input value={form.website_url} onChange={e => set('website_url', e.target.value)}
              className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
              placeholder="https://" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Google Place ID</label>
            <input value={form.google_place_id} onChange={e => set('google_place_id', e.target.value)}
              className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40"
              placeholder="ChIJ… (optional — used for verification signals)" />
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
        <CreateBusinessModal orgId={orgId} onClose={() => setShowCreate(false)} onCreated={b => setBusinesses(prev => [...prev, b])} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">Business Profiles</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">
            {businesses.length} profile{businesses.length !== 1 ? 's' : ''} · verified signals power opportunity matching
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
            <p className="text-xs text-[#617089] mt-1">Add your business to participate in opportunities</p>
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
        {businesses.map(b => (
          <div key={b.id} className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#E6EDF5]">{b.business_name}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${VERIFICATION_STYLES[b.verification_status] ?? VERIFICATION_STYLES.unverified}`}>
                {b.verification_status}
              </span>
            </div>

            {b.website_url && (
              <div className="flex items-center gap-1.5 text-xs text-[#617089]">
                <Globe className="w-3 h-3" />
                <a href={b.website_url} target="_blank" rel="noreferrer" className="hover:text-[#C6A66B] truncate">
                  {b.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {b.consistency_score !== null && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.consistency_score}%`, background: b.consistency_score >= 75 ? '#2BB8A5' : b.consistency_score >= 50 ? '#C6A66B' : '#ef4444' }}
                  />
                </div>
                <span className="text-[10px] text-[#617089]">{b.consistency_score}% consistent</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[10px] text-[#617089] pt-1 border-t border-white/10">
              {b.verification_status === 'verified'
                ? <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified — eligible for opportunities</>
                : b.verification_status === 'rejected'
                ? <><AlertCircle className="w-3 h-3 text-red-400" /> Verification rejected</>
                : <><Clock className="w-3 h-3 text-amber-400" /> Unverified — add Google Place ID to verify</>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
