'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';

type Milestone = { id: string; title: string; target_date: string; completed: boolean; completed_at?: string; };
type AuditEntry = { at: string; action: string; };
type OutcomeRecord = { text: string; self_reported: boolean; recorded_at: string; };

type ParticipationRecord = {
  id: string;
  status: string;
  opportunity_id: string;
  business_profile_id: string;
  evidence: {
    decision?: string;
    conditions?: string;
    revenue_share_proposer?: number;
    milestones?: Milestone[];
    audit?: AuditEntry[];
    outcomes?: OutcomeRecord[];
    viability_score?: number;
  };
  created_at: string;
  updated_at: string;
};

type BusinessProfile = { id: string; business_name: string; };
type Opportunity = { id: string; title: string; };

function RecordOutcomeModal({ record, onClose, onSaved }: {
  record: ParticipationRecord;
  onClose: () => void;
  onSaved: (updated: ParticipationRecord) => void;
}) {
  const supabase = createClient();
  const [text, setText] = useState('');
  const [selfReported, setSelfReported] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!text.trim()) { setError('Outcome description is required.'); return; }
    setSaving(true); setError(null);
    const now = new Date().toISOString();
    const existing: OutcomeRecord[] = record.evidence?.outcomes ?? [];
    const newOutcome: OutcomeRecord = { text, self_reported: selfReported, recorded_at: now };
    const updatedAudit: AuditEntry[] = [...(record.evidence?.audit ?? []), {
      at: now,
      action: `Outcome recorded (${selfReported ? 'self-reported' : 'evidence-confirmed'}): ${text.slice(0, 60)}`,
    }];
    const updatedEvidence = { ...record.evidence, outcomes: [...existing, newOutcome], audit: updatedAudit };

    const { data, error: err } = await supabase
      .from('participation_records')
      .update({ evidence: updatedEvidence, updated_at: now })
      .eq('id', record.id)
      .select().single();

    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved(data as ParticipationRecord);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-[#08111f] border border-white/10 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-[#E6EDF5]">Record Outcome</h2>
          <button onClick={onClose} className="text-[#617089] hover:text-[#E6EDF5]"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Outcome Description</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
              className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] placeholder:text-[#374151] focus:outline-none focus:border-[#C6A66B]/40 resize-none"
              placeholder="Describe what was achieved…" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-2">Evidence Type</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-xs text-[#9BA7B8] cursor-pointer">
                <input type="radio" checked={selfReported} onChange={() => setSelfReported(true)} className="accent-[#C6A66B]" />
                Self-reported
              </label>
              <label className="flex items-center gap-2 text-xs text-[#9BA7B8] cursor-pointer">
                <input type="radio" checked={!selfReported} onChange={() => setSelfReported(false)} className="accent-[#C6A66B]" />
                Evidence-confirmed
              </label>
            </div>
            {selfReported && (
              <p className="text-[10px] text-amber-400 mt-1">
                Self-reported outcomes are recorded as stated. Upload supporting evidence to confirm.
              </p>
            )}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-[#9BA7B8] border border-white/10 rounded hover:bg-[#08111f]">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 text-xs text-[#020912] bg-[#C6A66B] rounded hover:bg-[#C6A66B]/90 disabled:opacity-50">
            {saving ? 'Saving…' : 'Record Outcome'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OutcomesPage() {
  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [records, setRecords] = useState<ParticipationRecord[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [fetching, setFetching] = useState(false);
  const [recordingOutcome, setRecordingOutcome] = useState<ParticipationRecord | null>(null);

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

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  const completedMilestones = records.flatMap(r => (r.evidence?.milestones ?? []).filter(m => m.completed));
  const totalMilestones = records.flatMap(r => r.evidence?.milestones ?? []);
  const totalOutcomes = records.flatMap(r => r.evidence?.outcomes ?? []);

  return (
    <div className="space-y-6">
      {recordingOutcome && (
        <RecordOutcomeModal
          record={recordingOutcome}
          onClose={() => setRecordingOutcome(null)}
          onSaved={updated => {
            setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
            setRecordingOutcome(null);
          }}
        />
      )}

      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Outcomes</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">
          Milestones and confirmed outcomes from participation records
        </p>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Milestones Complete</div>
            <div className="text-2xl font-mono font-semibold text-emerald-400">{completedMilestones.length}<span className="text-sm text-[#617089] ml-1">/ {totalMilestones.length}</span></div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Outcomes Recorded</div>
            <div className="text-2xl font-mono font-semibold text-[#C6A66B]">{totalOutcomes.length}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Evidence-Confirmed</div>
            <div className="text-2xl font-mono font-semibold text-purple-400">{totalOutcomes.filter(o => !o.self_reported).length}</div>
          </div>
        </div>
      )}

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && records.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl border border-dashed border-white/10">
          <TrendingUp className="w-8 h-8 text-[#374151]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No participation records yet</p>
            <p className="text-xs text-[#617089] mt-1">Record participation decisions first, then capture outcomes here</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {records.map(r => {
          const biz = businesses.find(b => b.id === r.business_profile_id);
          const opp = opportunities.find(o => o.id === r.opportunity_id);
          const milestones: Milestone[] = r.evidence?.milestones ?? [];
          const outcomes: OutcomeRecord[] = r.evidence?.outcomes ?? [];
          if (milestones.length === 0 && outcomes.length === 0) return null;

          return (
            <div key={r.id} className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {opp && <p className="text-sm font-semibold text-[#E6EDF5]">{opp.title}</p>}
                  {biz && <p className="text-xs text-[#9BA7B8]">{biz.business_name}</p>}
                </div>
                <button onClick={() => setRecordingOutcome(r)}
                  className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-2 py-1 hover:bg-[#C6A66B]/10 flex-shrink-0">
                  + Outcome
                </button>
              </div>

              {milestones.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-[#617089]">Milestones</div>
                  {milestones.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      {m.completed
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        : <Clock className="w-3.5 h-3.5 text-[#374151] flex-shrink-0" />
                      }
                      <span className={m.completed ? 'text-[#617089] line-through' : 'text-[#9BA7B8]'}>{m.title}</span>
                      {m.completed && m.completed_at && (
                        <span className="text-[10px] text-emerald-400 ml-auto">{new Date(m.completed_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                      )}
                      {!m.completed && m.target_date && (
                        <span className="text-[10px] text-[#374151] ml-auto">Target: {new Date(m.target_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {outcomes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-[#617089]">Recorded Outcomes</div>
                  {outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 rounded border border-white/5 bg-black/20">
                      {o.self_reported
                        ? <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      }
                      <div className="flex-1">
                        <p className="text-[#E6EDF5]">{o.text}</p>
                        <p className="text-[10px] text-[#617089] mt-0.5">
                          {o.self_reported ? 'Self-reported' : 'Evidence-confirmed'} · {new Date(o.recorded_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {records.length > 0 && (
        <div className="text-[10px] text-[#374151] text-center tracking-widest py-2">
          VERIFIED OUTCOMES CREATE THE DATASET FOR FUTURE RECOMMENDATION IMPROVEMENTS · NO ECONOMIC VALUES FABRICATED
        </div>
      )}
    </div>
  );
}
