'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Building2, Plus, X, MapPin, Globe, Phone, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

type Property = {
  id: string;
  name: string;
  property_type: string;
  status: string;
  city: string | null;
  province: string | null;
  address: string | null;
  description: string | null;
  website_url: string | null;
  phone: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  created_at: string;
};

const PROPERTY_TYPES = [
  'Self-catering cottage', 'Self-catering studio', 'Guesthouse', 'Lodge',
  'Boutique hotel', 'Farm stay', 'Glamping', 'B&B', 'Backpackers', 'Other',
];

const STATUS_STYLES: Record<string, string> = {
  active:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  draft:    'text-amber-400 bg-amber-400/10 border-amber-400/20',
  inactive: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

function CreatePropertyModal({
  orgId,
  onClose,
  onCreated,
}: {
  orgId: string;
  onClose: () => void;
  onCreated: (p: Property) => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    property_type: 'Self-catering cottage',
    address: '',
    city: '',
    province: '',
    country: 'South Africa',
    website_url: '',
    phone: '',
    email: '',
    description: '',
    google_place_id: '',
    check_in_time: '14:00',
    check_out_time: '10:00',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function save(publish = false) {
    if (!form.name.trim()) { setError('Property name is required.'); return; }
    setSaving(true); setError(null);
    const payload = {
      ...form,
      organization_id: orgId,
      status: publish ? 'active' : 'draft',
    };
    const { data, error: err } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated(data as Property);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-10 px-4">
      <div className="w-full max-w-2xl bg-[#08111f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[#E6EDF5]">Add Property</h2>
          <button onClick={onClose} className="text-[#9BA7B8] hover:text-[#E6EDF5]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Property Name *</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Woody's Self Catering Cottage"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Type</label>
              <select
                value={form.property_type}
                onChange={e => set('property_type', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40"
              >
                {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">City / Town</label>
              <input
                value={form.city}
                onChange={e => set('city', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Underberg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Street Address</label>
              <input
                value={form.address}
                onChange={e => set('address', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="Physical address"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Province</label>
              <input
                value={form.province}
                onChange={e => set('province', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. KwaZulu-Natal"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="+27 …"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Email</label>
              <input
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="bookings@…"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Website</label>
              <input
                value={form.website_url}
                onChange={e => set('website_url', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Check-in Time</label>
              <input
                type="time"
                value={form.check_in_time}
                onChange={e => set('check_in_time', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Check-out Time</label>
              <input
                type="time"
                value={form.check_out_time}
                onChange={e => set('check_out_time', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Google Place ID</label>
              <input
                value={form.google_place_id}
                onChange={e => set('google_place_id', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="ChIJ… (optional)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
                placeholder="Describe the property…"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
          <p className="text-[10px] text-[#9BA7B8]">Save as Draft to complete details later. Publish when ready.</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#9BA7B8] border border-white/10 rounded hover:bg-[#08111f]"
            >
              Cancel
            </button>
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded hover:bg-[#C6A66B]/10 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-[#020912] bg-[#C6A66B] rounded hover:bg-[#C6A66B]/90 disabled:opacity-50"
            >
              {saving ? 'Publishing…' : 'Publish Active'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const { orgId, orgName, loading } = useOrg();
  const supabase = createClient();
  const [properties, setProperties] = useState<Property[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('organization_id', oid)
      .order('name');
    setProperties(data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => {
    if (orgId) load(orgId);
  }, [orgId, load]);

  if (loading) return <div className="p-6 text-[#9BA7B8] text-sm">Loading…</div>;

  if (!orgId) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Building2 className="w-10 h-10 text-[#9BA7B8]" />
      <p className="text-sm text-[#9BA7B8]">No organisation found.</p>
      <Link href="/settings" className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">
        Go to Settings
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {showCreate && (
        <CreatePropertyModal
          orgId={orgId}
          onClose={() => setShowCreate(false)}
          onCreated={p => setProperties(prev => [...prev, p])}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">{orgName ?? 'Properties'}</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">
            {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} · production database
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#C6A66B]/90"
        >
          <Plus className="w-3.5 h-3.5" /> Add Property
        </button>
      </div>

      {fetching && <div className="text-[#9BA7B8] text-sm">Loading properties…</div>}

      {!fetching && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-4 rounded-xl border border-dashed border-white/10">
          <Building2 className="w-8 h-8 text-[#9BA7B8]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No properties yet</p>
            <p className="text-xs text-[#9BA7B8] mt-1">Add your first property to get started</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 border border-[#C6A66B]/30 text-[#C6A66B] text-xs rounded hover:bg-[#C6A66B]/10"
          >
            <Plus className="w-3.5 h-3.5" /> Add Property
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {properties.map(p => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#E6EDF5]">{p.name}</h3>
                <p className="text-xs text-[#9BA7B8] mt-0.5">{p.property_type}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${STATUS_STYLES[p.status] ?? STATUS_STYLES.draft}`}>
                {p.status}
              </span>
            </div>

            <div className="space-y-1">
              {(p.city || p.province) && (
                <div className="flex items-center gap-1.5 text-xs text-[#9BA7B8]">
                  <MapPin className="w-3 h-3" />
                  {[p.city, p.province].filter(Boolean).join(', ')}
                </div>
              )}
              {p.website_url && (
                <div className="flex items-center gap-1.5 text-xs text-[#9BA7B8]">
                  <Globe className="w-3 h-3" />
                  <a href={p.website_url} target="_blank" rel="noreferrer" className="hover:text-[#C6A66B] truncate">
                    {p.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {p.phone && (
                <div className="flex items-center gap-1.5 text-xs text-[#9BA7B8]">
                  <Phone className="w-3 h-3" />{p.phone}
                </div>
              )}
              {(p.check_in_time || p.check_out_time) && (
                <div className="flex items-center gap-1.5 text-xs text-[#9BA7B8]">
                  <Clock className="w-3 h-3" />
                  {p.check_in_time && `In ${p.check_in_time}`}
                  {p.check_in_time && p.check_out_time && ' · '}
                  {p.check_out_time && `Out ${p.check_out_time}`}
                </div>
              )}
            </div>

            {p.description && (
              <p className="text-xs text-[#9BA7B8] line-clamp-2">{p.description}</p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] text-[#9BA7B8]">
                {p.status === 'active'
                  ? <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live</>
                  : <><Clock className="w-3 h-3 text-amber-400" /> Draft — complete and publish</>
                }
              </div>
              <Link
                href={`/properties/${p.id}`}
                className="flex items-center gap-1 text-xs text-[#C6A66B] hover:underline"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
