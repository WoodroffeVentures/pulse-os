'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Handshake, Plus, X, CheckCircle2, Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

type Milestone = { id: string; title: string; target_date: string; completed: boolean; completed_at?: string; };
type AuditEntry = { at: string; action: string; by?: string; note?: string; };

type ParticipationRecord = {
  id: string;
  status: string;
  opportunity_id: string;
  business_profile_id: string;
  owner_user_id: string | null;
  evidence: {
    decision?: string;
    proposed_role?: string;
    proposed_contribution?: string;
    conditions?: string;
    revenue_share_proposer?: number;
    viability_score?: number;
    milestones?: Milestone[];
    audit?: AuditEntry[];
    self_reported?: boolean;
    note?: string;
  };
  created_at: string;
  updated_at: string;
};

type BusinessProfile = { id: string; business_name: string; };
type Opportunity = { id: string; title: string; };

const DECISIONS = ['Join', 'Join with Conditions', 'Hold', 'Not Suitable'] as const;

const DECISION_STYLES: Record<string, string> = {
  'Join':              'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Join with Conditions': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Hold':              'text-[#9BA7B8] bg-white/5 border-white/10',
  'Not Suitable':      'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_MAP: Record<string, string> = {
  'Join': 'accepted',
  'Join with Conditions': 'conditional',
  'Hold': 'in_review',
  'Not Suitable': 'declined',
};

function CreateParticipationModal({ orgId, opportunities, businesses, preOppId, preBizId, preScore, preRec, onClose, onCreated }: {
  orgId: string;
  opportunities: Opportunity[];
  businesses: BusinessProfile[];
  preOppId?: string;
  preBizId?: string;
  preScore?: number;
  preRec?: string;
  onClose: () => void;
  onCreated: (r: ParticipationRecord) => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    opportunity_id: preOppId ?? (opportunities[0]?.id ?? ''),
    business_profile_id: preBizId ?? (businesses[0]?.id ?? ''),
    decision: (preRec ?? 'Join with Conditions') as typeof DECISIONS[number],
    proposed_role: '',
    proposed_contribution: '',
    conditions: '',
    revenue_share: '',
  });
  const [milestones, setMilestones] = useState<{ title: string; target_date: string }[]>([]);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function addMilestone() { setMilestones(m => [...m, { title: '', target_date: '' }]); }
  function setMilestone(i: number, k: string, v: string) {
    setMilestones(m => m.map((ms, idx) => idx === i ? { ...ms, [k]: v } : ms));
  }
  function removeMilestone(i: number) { setMilestones(m => m.filter((_, idx) => idx !== i)); }

  async function save() {
    if (!form.opportunity_id || !form.business_profile_id) { setError('Opportunity and business are required.'); return; }
    setSaving(true); setError(null);

    const now = new Date().toISOString();
    const milestoneRecords: Milestone[] = milestones.map((m, i) => ({
      id: `ms-${Date.now()}-${i}`,
      title: m.title,
      target_date: m.target_date,
      completed: false,
    }));

    const audit: AuditEntry[] = [{ at: now, action: `Decision recorded: ${form.decision}` }];

    const evidence: ParticipationRecord['evidence'] = {
      decision: form.decision,
      proposed_role: form.proposed_role || undefined,
      proposed_contribution: form.proposed_contribution || undefined,
      conditions: form.conditions || undefined,
      revenue_share_proposer: form.revenue_share ? Number(form.revenue_share) : undefined,
      viability_score: preScore,
      milestones: milestoneRecords,
      audit,
    };

    const { data, error: err } = await supabase
      .from('participation_records')
      .insert({
        organization_id: orgId,
        opportunity_id: form.opportunity_id,
        business_profile_id: form.business_profile_id,
        status: STATUS_MAP[form.decision] ?? 'in_review',
        owner_user_id: null,
        evidence,
      })
      .select().single();

    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated(data as ParticipationRecord);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-6 px-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#08111f] border border-white/10 rounded-xl shadow-2xl mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[#E6EDF5]">Record Participation Decision</h2>
          <button onClick={onClose} className="text-[#9BA7B8] hover:text-[#E6EDF5]"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}

          <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-[10px] text-amber-500 leading-relaxed">
            This record tracks proposed participation and is not a signed legal JV agreement unless an executed agreement has been uploaded and verified.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Opportunity</label>
              <select value={form.opportunity_id} onChange={e => set('opportunity_id', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {opportunities.map(o => <option key={o.id} value={o.id}>{o.title.slice(0, 50)}{o.title.length > 50 ? '…' : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Business</label>
              <select value={form.business_profile_id} onChange={e => set('business_profile_id', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {businesses.map(b => <option key={b.id} value={b.id}>{b.business_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Decision</label>
              <select value={form.decision} onChange={e => set('decision', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                {DECISIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Revenue Share % (proposed)</label>
              <input type="number" min="0" max="100" value={form.revenue_share} onChange={e => set('revenue_share', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. 40" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Proposed Role</label>
              <input value={form.proposed_role} onChange={e => set('proposed_role', e.target.value)}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                placeholder="e.g. Experience provider, co-marketing partner" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Proposed Contribution</label>
              <textarea value={form.proposed_contribution} onChange={e => set('proposed_contribution', e.target.value)} rows={2}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
                placeholder="What the business will contribute…" />
            </div>

            {form.decision === 'Join with Conditions' && (
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-1">Conditions</label>
                <textarea value={form.conditions} onChange={e => set('conditions', e.target.value)} rows={2}
                  className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
                  placeholder="State the conditions that must be met…" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8]">Milestones</label>
              <button onClick={addMilestone} className="text-xs text-[#C6A66B] flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Add milestone
              </button>
            </div>
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={m.title} onChange={e => setMilestone(i, 'title', e.target.value)}
                  className="flex-1 bg-[#020912] border border-white/10 rounded px-3 py-1.5 text-xs text-[#E6EDF5] placeholder:text-[#9BA7B8] focus:outline-none focus:border-[#C6A66B]/40"
                  placeholder="Milestone title…" />
                <input type="date" value={m.target_date} onChange={e => setMilestone(i, 'target_date', e.target.value)}
                  className="bg-[#020912] border border-white/10 rounded px-2 py-1.5 text-xs text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40" />
                <button onClick={() => removeMilestone(i)} className="text-[#9BA7B8] hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-[#9BA7B8] border border-white/10 rounded hover:bg-[#08111f]">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 text-xs text-[#020912] bg-[#C6A66B] rounded hover:bg-[#C6A66B]/90 disabled:opacity-50">
            {saving ? 'Recording…' : 'Record Decision'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecordCard({ r, businesses, opportunities, onUpdate }: {
  r: ParticipationRecord;
  businesses: BusinessProfile[];
  opportunities: Opportunity[];
  onUpdate: (updated: ParticipationRecord) => void;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [updatingMs, setUpdatingMs] = useState<string | null>(null);

  const biz = businesses.find(b => b.id === r.business_profile_id);
  const opp = opportunities.find(o => o.id === r.opportunity_id);
  const decision = r.evidence?.decision ?? r.status;
  const milestones: Milestone[] = r.evidence?.milestones ?? [];
  const audit: AuditEntry[] = r.evidence?.audit ?? [];

  async function completeMilestone(msId: string) {
    setUpdatingMs(msId);
    const now = new Date().toISOString();
    const updatedMilestones = milestones.map(m =>
      m.id === msId ? { ...m, completed: true, completed_at: now } : m
    );
    const updatedAudit: AuditEntry[] = [...audit, { at: now, action: `Milestone completed: ${milestones.find(m => m.id === msId)?.title}` }];
    const updatedEvidence = { ...r.evidence, milestones: updatedMilestones, audit: updatedAudit };

    const { data, error } = await supabase
      .from('participation_records')
      .update({ evidence: updatedEvidence, updated_at: now })
      .eq('id', r.id)
      .select().single();

    setUpdatingMs(null);
    if (!error && data) onUpdate(data as ParticipationRecord);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {decision && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${DECISION_STYLES[decision] ?? 'text-[#9BA7B8] bg-white/5 border-white/10'}`}>
                {decision}
              </span>
            )}
          </div>
          {opp && <p className="text-sm font-semibold text-[#E6EDF5] truncate">{opp.title}</p>}
          {biz && <p className="text-xs text-[#9BA7B8]">{biz.business_name}</p>}
          {r.evidence?.conditions && (
            <div className="text-xs text-amber-400 bg-amber-400/5 border border-amber-400/20 rounded px-2 py-1">
              Condition: {r.evidence.conditions}
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-[#9BA7B8] hover:text-[#E6EDF5] flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-3 border-t border-white/10">
          {r.evidence?.proposed_role && (
            <div><div className="text-[10px] uppercase tracking-widest text-[#9BA7B8] mb-1">Role</div><p className="text-xs text-[#9BA7B8]">{r.evidence.proposed_role}</p></div>
          )}
          {r.evidence?.proposed_contribution && (
            <div><div className="text-[10px] uppercase tracking-widest text-[#9BA7B8] mb-1">Contribution</div><p className="text-xs text-[#9BA7B8]">{r.evidence.proposed_contribution}</p></div>
          )}
          {r.evidence?.revenue_share_proposer !== undefined && (
            <div className="text-xs text-emerald-400">Revenue share proposed: {r.evidence.revenue_share_proposer}%</div>
          )}
          {r.evidence?.viability_score !== undefined && (
            <div className="text-xs text-[#9BA7B8]">Viability score at decision: {r.evidence.viability_score}</div>
          )}

          {milestones.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-2">Milestones</div>
              <div className="space-y-2">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    {m.completed
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      : <button onClick={() => completeMilestone(m.id)} disabled={updatingMs === m.id}
                          className="w-4 h-4 rounded border border-white/20 hover:border-emerald-400 flex-shrink-0 transition-colors" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${m.completed ? 'text-[#9BA7B8] line-through' : 'text-[#E6EDF5]'}`}>{m.title}</p>
                      {m.target_date && <p className="text-[10px] text-[#9BA7B8]">{m.completed ? `Completed ${new Date(m.completed_at!).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}` : `Target: ${new Date(m.target_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {audit.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA7B8] mb-2">Audit Timeline</div>
              <div className="space-y-1.5">
                {audit.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px]">
                    <Clock className="w-3 h-3 text-[#9BA7B8] flex-shrink-0 mt-0.5" />
                    <span className="text-[#9BA7B8]">{new Date(a.at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[#9BA7B8]">{a.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] text-[#9BA7B8] font-mono">Record ID: {r.id.slice(0, 8)}…</div>
        </div>
      )}
    </div>
  );
}

function ParticipationInner() {
  const searchParams = useSearchParams();
  const preOppId = searchParams.get('opportunity_id') ?? undefined;
  const preBizId = searchParams.get('business_id') ?? undefined;
  const preScore = searchParams.get('score') ? Number(searchParams.get('score')) : undefined;
  const preRec = searchParams.get('recommendation') ?? undefined;

  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [records, setRecords] = useState<ParticipationRecord[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showCreate, setShowCreate] = useState(!!preOppId);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const [recRes, bizRes, oppRes] = await Promise.all([
      supabase.from('participation_records').select('*').eq('organization_id', oid).order('updated_at', { ascending: false }),
      supabase.from('business_profiles').select('id,business_name').eq('organization_id', oid),
      supabase.from('opportunities').select('id,title').eq('organization_id', oid),
    ]);
    setRecords(recRes.data ?? []);
    setBusinesses(bizRes.data ?? []);
    setOpportunities(oppRes.data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  if (loading) return <div className="p-6 text-[#9BA7B8] text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      {showCreate && orgId && businesses.length > 0 && opportunities.length > 0 && (
        <CreateParticipationModal
          orgId={orgId}
          opportunities={opportunities}
          businesses={businesses}
          preOppId={preOppId}
          preBizId={preBizId}
          preScore={preScore}
          preRec={preRec}
          onClose={() => setShowCreate(false)}
          onCreated={r => { setRecords(prev => [r, ...prev]); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">Participation & JVs</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">
            {records.length} record{records.length !== 1 ? 's' : ''} · with milestones and audit timeline
          </p>
        </div>
        {orgId && businesses.length > 0 && opportunities.length > 0 && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#C6A66B]/90">
            <Plus className="w-3.5 h-3.5" /> Record Decision
          </button>
        )}
      </div>

      {(businesses.length === 0 || opportunities.length === 0) && (
        <div className="rounded-xl border border-dashed border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-400 space-y-1">
          <p className="font-semibold">Prerequisites missing</p>
          {businesses.length === 0 && <p className="text-xs">→ <a href="/businesses" className="underline">Add a business profile</a></p>}
          {opportunities.length === 0 && <p className="text-xs">→ <a href="/opportunities" className="underline">Create an opportunity</a></p>}
        </div>
      )}

      {fetching && <div className="text-[#9BA7B8] text-sm">Loading…</div>}

      {!fetching && records.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl border border-dashed border-white/10">
          <Handshake className="w-8 h-8 text-[#9BA7B8]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No participation records</p>
            <p className="text-xs text-[#9BA7B8] mt-1">Run a viability assessment first, then record your decision here</p>
          </div>
          <a href="/viability" className="flex items-center gap-1 text-xs text-[#C6A66B] hover:underline">
            Go to Viability <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="space-y-3">
        {records.map(r => (
          <RecordCard
            key={r.id}
            r={r}
            businesses={businesses}
            opportunities={opportunities}
            onUpdate={updated => setRecords(prev => prev.map(p => p.id === updated.id ? updated : p))}
          />
        ))}
      </div>
    </div>
  );
}

export default function ParticipationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#9BA7B8] text-sm">Loading…</div>}>
      <ParticipationInner />
    </Suspense>
  );
}
