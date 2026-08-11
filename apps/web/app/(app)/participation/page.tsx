'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Handshake } from 'lucide-react';

type ParticipationRecord = {
  id: string;
  status: string;
  opportunity_id: string;
  business_profile_id: string;
  evidence: Record<string, unknown>;
  updated_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  jv_active: '#9B6DFF', accepted: '#2BB8A5', conditional: '#C6A66B',
  in_review: '#E8D9A8', declined: '#ef4444', presentation_requested: '#C6A66B', identified: '#9BA7B8',
};

export default function ParticipationPage() {
  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [records, setRecords] = useState<ParticipationRecord[]>([]);
  const [fetching, setFetching] = useState(false);
  const [decisionTarget, setDecisionTarget] = useState<string | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const { data } = await supabase
      .from('participation_records')
      .select('*')
      .eq('organization_id', oid)
      .order('updated_at', { ascending: false });
    setRecords(data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  async function recordDecision(recordId: string, opportunityId: string, decision: string) {
    setDecisionLoading(true);
    await supabase
      .from('participation_records')
      .update({ status: decision, updated_at: new Date().toISOString() })
      .eq('id', recordId);
    setDecisionTarget(null);
    setDecisionLoading(false);
    if (orgId) load(orgId);
  }

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">Participation & JVs</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">
            Opportunity pitches and JV participations · production database
          </p>
        </div>
      </div>

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && records.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl border border-dashed border-white/10">
          <Handshake className="w-8 h-8 text-[#374151]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No participation records</p>
            <p className="text-xs text-[#617089] mt-1">Create opportunities and submit pitches to track participation here</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {records.map(r => {
          const color = STATUS_COLORS[r.status] ?? '#9BA7B8';
          const score = r.evidence?.viability_score as number | undefined;
          const isInbox = r.status === 'in_review' || r.status === 'identified';
          return (
            <div
              key={r.id}
              className="rounded-xl p-4"
              style={{ background: '#0B1220', border: `1px solid ${isInbox ? 'rgba(198,166,107,0.3)' : 'rgba(255,255,255,0.08)'}` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2 items-center">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide"
                      style={{ color, background: `${color}22`, borderColor: `${color}44` }}
                    >
                      {r.status.replace(/_/g, ' ')}
                    </span>
                    {score !== undefined && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded border"
                        style={{ color: score >= 75 ? '#2BB8A5' : score >= 55 ? '#C6A66B' : '#ef4444', background: (score >= 75 ? '#2BB8A5' : score >= 55 ? '#C6A66B' : '#ef4444') + '22', borderColor: (score >= 75 ? '#2BB8A5' : score >= 55 ? '#C6A66B' : '#ef4444') + '44' }}
                      >
                        {score}
                      </span>
                    )}
                    {!!r.evidence?.foc && <span className="text-[10px] text-emerald-400 tracking-widest">FOC</span>}
                  </div>
                  <p className="text-xs text-[#617089] font-mono">
                    Opp: {r.opportunity_id.slice(0, 8)}… · Biz: {r.business_profile_id.slice(0, 8)}…
                  </p>
                  {r.evidence?.conditions != null && (
                    <div className="text-xs text-[#C6A66B] bg-amber-400/5 border border-amber-400/20 rounded px-2 py-1">
                      Condition: {String(r.evidence.conditions)}
                    </div>
                  )}
                  {r.evidence?.decline_reason != null && (
                    <p className="text-xs text-red-400">{String(r.evidence.decline_reason)}</p>
                  )}
                </div>
                {isInbox && (
                  <div className="flex gap-2 flex-shrink-0">
                    {decisionTarget === r.id ? (
                      <>
                        {(['accepted', 'declined', 'conditional'] as const).map(d => (
                          <button
                            key={d}
                            disabled={decisionLoading}
                            onClick={() => recordDecision(r.id, r.opportunity_id, d)}
                            className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded disabled:opacity-50"
                            style={{
                              background: d === 'accepted' ? '#2BB8A5' : d === 'declined' ? '#ef4444' : '#C6A66B',
                              color: '#07090E',
                            }}
                          >
                            {d}
                          </button>
                        ))}
                        <button
                          onClick={() => setDecisionTarget(null)}
                          className="text-[10px] text-[#9BA7B8] border border-white/10 rounded px-2 py-1 hover:bg-white/5"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDecisionTarget(r.id)}
                        className="text-[11px] font-semibold px-3 py-1 rounded"
                        style={{ background: 'rgba(198,166,107,0.15)', color: '#C6A66B', border: '1px solid rgba(198,166,107,0.3)' }}
                      >
                        Decide
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
