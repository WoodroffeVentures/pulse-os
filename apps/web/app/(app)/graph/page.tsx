'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Map, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

type Milestone = { id: string; title: string; completed: boolean; completed_at?: string; };
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
    viability_score?: number;
    milestones?: Milestone[];
    outcomes?: OutcomeRecord[];
    audit?: { at: string; action: string }[];
  };
  created_at: string;
  updated_at: string;
};

type BusinessProfile = { id: string; business_name: string; verification_status: string; verified_signals: Record<string, unknown>; };
type Opportunity = { id: string; title: string; opportunity_type: string; status: string; district: string | null; };
type ViabilityAnalysis = { id: string; opportunity_id: string; business_profile_id: string; score: number; confidence: number; recommendation: string; created_at: string; };

const STATUS_COLOR: Record<string, string> = {
  accepted:    '#2BB8A5',
  jv_active:   '#9B6DFF',
  conditional: '#C6A66B',
  in_review:   '#E8D9A8',
  declined:    '#ef4444',
  identified:  '#617089',
};

const DECISION_COLORS: Record<string, string> = {
  'Join': '#2BB8A5',
  'Join with Conditions': '#C6A66B',
  'Hold': '#617089',
  'Not Suitable': '#ef4444',
};

function NodeBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-[#020912]">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color ?? '#617089' }} />
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#374151]">{label}</div>
        <div className="text-xs text-[#E6EDF5] font-medium truncate max-w-[160px]">{value}</div>
      </div>
    </div>
  );
}

function RelationshipRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 px-2">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[9px] uppercase tracking-widest text-[#374151]">{label}</span>
      <ArrowRight className="w-3 h-3 text-[#374151]" />
    </div>
  );
}

function GraphNode({ record, business, opportunity, viability }: {
  record: ParticipationRecord;
  business?: BusinessProfile;
  opportunity?: Opportunity;
  viability?: ViabilityAnalysis;
}) {
  const [expanded, setExpanded] = useState(false);
  const decision = record.evidence?.decision ?? record.status;
  const decisionColor = DECISION_COLORS[decision ?? ''] ?? STATUS_COLOR[record.status] ?? '#617089';
  const milestones: Milestone[] = record.evidence?.milestones ?? [];
  const outcomes: OutcomeRecord[] = record.evidence?.outcomes ?? [];
  const completedMs = milestones.filter(m => m.completed);

  return (
    <div className="rounded-xl border border-white/10 bg-[#08111f] overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background: decisionColor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest"
              style={{ color: decisionColor, background: `${decisionColor}18`, borderColor: `${decisionColor}44` }}
            >
              {decision ?? record.status}
            </span>
            {viability && <span className="text-[10px] text-[#617089]">Score {viability.score}</span>}
          </div>
          <p className="text-sm font-semibold text-[#E6EDF5] truncate">{opportunity?.title ?? `Opp ${record.opportunity_id.slice(0, 8)}…`}</p>
          <p className="text-xs text-[#9BA7B8]">{business?.business_name ?? `Biz ${record.business_profile_id.slice(0, 8)}…`}</p>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-[#617089]">
            {milestones.length > 0 && <span>{completedMs.length}/{milestones.length} milestones</span>}
            {outcomes.length > 0 && <span>{outcomes.length} outcome{outcomes.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#617089] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#617089] flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-white/10 px-4 py-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-2">Relationship Chain</div>

          <div className="space-y-1">
            {business && (
              <>
                <NodeBadge label="Business Profile" value={business.business_name} color={business.verification_status === 'verified' ? '#2BB8A5' : '#C6A66B'} />
                <RelationshipRow label="connects to" />
              </>
            )}
            {opportunity && (
              <>
                <NodeBadge label="Opportunity" value={opportunity.title} color="#9B6DFF" />
                {viability && <RelationshipRow label="assessed by" />}
              </>
            )}
            {viability && (
              <>
                <NodeBadge label="Viability Assessment" value={`Score ${viability.score} · ${viability.recommendation}`} color={viability.score >= 75 ? '#2BB8A5' : viability.score >= 55 ? '#C6A66B' : '#ef4444'} />
                <RelationshipRow label="decision" />
              </>
            )}
            <NodeBadge label="Participation Decision" value={decision ?? record.status} color={decisionColor} />

            {record.evidence?.conditions && (
              <div className="ml-4 text-[10px] text-amber-400 flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3" /> Condition: {record.evidence.conditions}
              </div>
            )}
          </div>

          {milestones.length > 0 && (
            <div>
              <RelationshipRow label="milestones" />
              <div className="space-y-1.5 ml-4">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    {m.completed
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      : <Clock className="w-3 h-3 text-[#374151] flex-shrink-0" />
                    }
                    <span className={m.completed ? 'text-[#617089]' : 'text-[#9BA7B8]'}>{m.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outcomes.length > 0 && (
            <div>
              <RelationshipRow label="outcomes" />
              <div className="space-y-1.5 ml-4">
                {outcomes.map((o, i) => (
                  <div key={i} className="text-xs text-[#9BA7B8] flex items-start gap-1.5">
                    <span className={o.self_reported ? 'text-amber-400' : 'text-emerald-400'}>{o.self_reported ? '~' : '✓'}</span>
                    <span>{o.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center gap-4 text-[10px] text-[#374151]">
            <span>ID: {record.id.slice(0, 8)}…</span>
            <span>Created: {new Date(record.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          <div className="flex gap-2">
            <a href={`/participation`} className="text-xs text-[#C6A66B] hover:underline flex items-center gap-1">
              Participation record <ArrowRight className="w-3 h-3" />
            </a>
            <a href={`/outcomes`} className="text-xs text-[#617089] hover:underline flex items-center gap-1">
              Outcomes <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GraphPage() {
  const { orgId, orgName, loading } = useOrg();
  const supabase = createClient();
  const [records, setRecords] = useState<ParticipationRecord[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [analyses, setAnalyses] = useState<ViabilityAnalysis[]>([]);
  const [fetching, setFetching] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const [recRes, bizRes, oppRes, vaRes] = await Promise.all([
      supabase.from('participation_records').select('*').eq('organization_id', oid).order('created_at', { ascending: false }),
      supabase.from('business_profiles').select('*').eq('organization_id', oid),
      supabase.from('opportunities').select('*').eq('organization_id', oid),
      supabase.from('viability_analyses').select('*').eq('organization_id', oid),
    ]);
    setRecords(recRes.data ?? []);
    setBusinesses(bizRes.data ?? []);
    setOpportunities(oppRes.data ?? []);
    setAnalyses(vaRes.data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  const byDecision = records.reduce<Record<string, number>>((acc, r) => {
    const k = r.evidence?.decision ?? r.status;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Participation Graph</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">
          Database-derived relationships: Business → Opportunity → Assessment → Decision → Milestones → Outcomes
        </p>
      </div>

      {records.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(byDecision).map(([decision, count]) => (
            <div key={decision} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#08111f] px-3 py-2">
              <div className="w-2 h-2 rounded-full" style={{ background: DECISION_COLORS[decision] ?? STATUS_COLOR[decision] ?? '#617089' }} />
              <span className="text-[10px] uppercase tracking-widest text-[#617089]">{decision.replace(/_/g, ' ')}</span>
              <span className="text-sm font-mono font-semibold text-[#E6EDF5]">{count}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#08111f] px-3 py-2">
            <span className="text-[10px] uppercase tracking-widest text-[#617089]">Assessments</span>
            <span className="text-sm font-mono font-semibold text-[#E6EDF5]">{analyses.length}</span>
          </div>
        </div>
      )}

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && records.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 rounded-xl border border-dashed border-white/10">
          <Map className="w-10 h-10 text-[#374151]" />
          <div className="text-center space-y-1">
            <p className="text-sm text-[#9BA7B8]">No participation records yet</p>
            <p className="text-xs text-[#617089]">The graph is generated from real database relationships.</p>
            <p className="text-xs text-[#617089]">Start by creating a business profile, an opportunity, a viability assessment, and a participation decision.</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <a href="/businesses" className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">Add Business</a>
            <a href="/opportunities" className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">Create Opportunity</a>
            <a href="/viability" className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">Run Assessment</a>
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-[#617089] px-1">
            {records.length} participation record{records.length !== 1 ? 's' : ''} — click any row to expand the full relationship chain
          </div>
          {records.map(r => (
            <GraphNode
              key={r.id}
              record={r}
              business={businesses.find(b => b.id === r.business_profile_id)}
              opportunity={opportunities.find(o => o.id === r.opportunity_id)}
              viability={analyses.find(a => a.opportunity_id === r.opportunity_id && a.business_profile_id === r.business_profile_id)}
            />
          ))}
        </div>
      )}

      {records.length > 0 && (
        <div className="text-[10px] text-[#374151] text-center tracking-widest py-2">
          ALL NODES DERIVED FROM {orgName?.toUpperCase() ?? 'YOUR'} PRODUCTION DATABASE · VERIFIED OUTCOMES IMPROVE FUTURE RECOMMENDATIONS
        </div>
      )}
    </div>
  );
}
