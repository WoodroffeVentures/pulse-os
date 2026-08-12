'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft, Target, Zap, Handshake, TrendingUp, FileText,
  CheckCircle2, Circle, AlertCircle, Clock, ChevronRight,
  Edit2, Save, X
} from 'lucide-react';

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
};

type ViabilityAnalysis = {
  id: string;
  score: number;
  confidence: number;
  recommendation: string;
  evidence: { label: string; weight: number; met: boolean; note: string }[];
  risks: { flag: string; severity: string }[];
  actions: string[];
  status: string;
  created_at: string;
  business_profiles?: { business_name: string };
};

type ParticipationRecord = {
  id: string;
  status: string;
  evidence: {
    decision?: string;
    proposed_role?: string;
    conditions?: string;
    milestones?: { id: string; title: string; target_date: string; completed: boolean }[];
    audit?: { at: string; action: string }[];
  };
  created_at: string;
  business_profiles?: { business_name: string };
};

type Outcome = {
  id: string;
  metric_name: string;
  metric_value: string | null;
  evidence_state: string;
  notes: string | null;
  created_at: string;
};

const TABS = [
  { key: 'brief',        label: 'Brief',        icon: FileText },
  { key: 'scoring',      label: 'Fit & Scoring', icon: Zap },
  { key: 'participants', label: 'Participants',  icon: Handshake },
  { key: 'activation',  label: 'Activation',    icon: Target },
  { key: 'outcomes',    label: 'Outcomes',      icon: TrendingUp },
  { key: 'evidence',    label: 'Evidence',      icon: CheckCircle2 },
] as const;

type TabKey = typeof TABS[number]['key'];

const STATUS_STYLES: Record<string, string> = {
  draft:        'text-[#617089] bg-white/5 border-white/10',
  under_review: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  open:         'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  active:       'text-[#9B6DFF] bg-[#9B6DFF]/10 border-[#9B6DFF]/20',
  completed:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled:    'text-red-400 bg-red-400/10 border-red-400/20',
};

const URGENCY_STYLES: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high:     'text-amber-400 bg-amber-400/10 border-amber-400/20',
  normal:   'text-[#617089] bg-white/5 border-white/10',
  low:      'text-[#374151] bg-white/5 border-white/5',
};

function label(s: string) { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

function ScoreBar({ score, max = 100, color = '#C6A66B' }: { score: number; max?: number; color?: string }) {
  return (
    <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${(score / max) * 100}%`, background: color }} />
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const tier = confidence >= 0.7 ? 'High' : confidence >= 0.45 ? 'Medium' : 'Low';
  const color = confidence >= 0.7 ? 'text-emerald-400' : confidence >= 0.45 ? 'text-amber-400' : 'text-red-400';
  return <span className={`text-[10px] font-semibold ${color}`}>{tier} confidence ({Math.round(confidence * 100)}%)</span>;
}

export default function OpportunityWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orgId, loading: orgLoading } = useOrg();
  const supabase = createClient();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [viability, setViability] = useState<ViabilityAnalysis[]>([]);
  const [participation, setParticipation] = useState<ParticipationRecord[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [tab, setTab] = useState<TabKey>('brief');
  const [loading, setLoading] = useState(true);
  const [editDecision, setEditDecision] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);

  const load = useCallback(async (oid: string) => {
    const [oppRes, vaRes, partRes, outcomeRes] = await Promise.all([
      supabase.from('opportunities').select('*').eq('id', id).eq('organization_id', oid).single(),
      supabase.from('viability_analyses').select('*, business_profiles(business_name)').eq('opportunity_id', id).eq('organization_id', oid).order('created_at', { ascending: false }),
      supabase.from('participation_records').select('*, business_profiles(business_name)').eq('opportunity_id', id).eq('organization_id', oid).order('created_at', { ascending: false }),
      supabase.from('outcomes').select('*').eq('organization_id', oid).order('created_at', { ascending: false }).limit(20),
    ]);
    if (oppRes.data) setOpp(oppRes.data as Opportunity);
    setViability((vaRes.data ?? []) as ViabilityAnalysis[]);
    setParticipation((partRes.data ?? []) as ParticipationRecord[]);
    // outcomes may not have opportunity_id FK — show all org outcomes for now
    setOutcomes((outcomeRes.data ?? []) as Outcome[]);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  async function saveDecision() {
    if (!opp || !editDecision.trim()) return;
    setSavingDecision(true);
    await supabase.from('opportunities').update({ next_decision: editDecision }).eq('id', opp.id);
    setOpp(prev => prev ? { ...prev, next_decision: editDecision } : prev);
    setSavingDecision(false);
    setEditDecision('');
  }

  if (orgLoading || loading) return <div className="p-6 text-[#617089] text-sm">Loading workspace…</div>;
  if (!opp) return <div className="p-6 text-red-400 text-sm">Opportunity not found or access denied.</div>;

  const statusKey = opp.status.toLowerCase().replace(' ', '_');
  const urgencyKey = (opp.urgency ?? 'normal').toLowerCase();

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="pb-4 border-b border-white/10 space-y-3">
        <button onClick={() => router.push('/opportunities')} className="flex items-center gap-1.5 text-xs text-[#617089] hover:text-[#C6A66B] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Opportunity Radar
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${STATUS_STYLES[statusKey] ?? STATUS_STYLES.draft}`}>
                {label(opp.status)}
              </span>
              {opp.urgency && opp.urgency !== 'normal' && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${URGENCY_STYLES[urgencyKey] ?? ''}`}>
                  {label(opp.urgency)} urgency
                </span>
              )}
              <span className="text-[10px] text-[#617089] uppercase tracking-widest">{opp.opportunity_type}</span>
            </div>
            <h1 className="text-lg font-semibold text-[#E6EDF5] leading-snug">{opp.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#617089]">
              {opp.district && <span>📍 {opp.district}{opp.province ? `, ${opp.province}` : ''}</span>}
              {opp.start_date && <span>📅 {new Date(opp.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              {opp.end_date && <span>→ {new Date(opp.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
          </div>

          {/* Readiness pill */}
          {opp.readiness_score !== null && (
            <div className="flex-shrink-0 text-right">
              <div className="text-xs text-[#617089] mb-0.5">Readiness</div>
              <div className="text-2xl font-bold text-[#C6A66B]">{Math.round(opp.readiness_score)}</div>
              <ScoreBar score={opp.readiness_score} />
            </div>
          )}
        </div>

        {/* Next decision */}
        <div className="flex items-center gap-2">
          {editDecision !== '' ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={editDecision}
                onChange={e => setEditDecision(e.target.value)}
                className="flex-1 bg-[#020912] border border-[#C6A66B]/30 rounded px-2 py-1 text-xs text-[#E6EDF5] focus:outline-none"
                placeholder="e.g. Approve for activation, Invite second business, Review evidence"
              />
              <button onClick={saveDecision} disabled={savingDecision} className="flex items-center gap-1 px-2 py-1 bg-[#C6A66B] text-[#020912] rounded text-xs font-semibold">
                <Save className="w-3 h-3" /> {savingDecision ? '…' : 'Save'}
              </button>
              <button onClick={() => setEditDecision('')} className="text-[#617089] hover:text-[#E6EDF5]"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-[#9BA7B8]">
                {opp.next_decision ? <>Decision required: <strong className="text-amber-400">{opp.next_decision}</strong></> : <span className="text-[#617089]">No decision recorded</span>}
              </span>
              <button onClick={() => setEditDecision(opp.next_decision ?? '')} className="ml-1 text-[10px] text-[#617089] hover:text-[#C6A66B] flex items-center gap-0.5">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-white/10 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#C6A66B] text-[#C6A66B]'
                : 'border-transparent text-[#617089] hover:text-[#9BA7B8]'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.key === 'participants' && participation.length > 0 && (
              <span className="ml-0.5 bg-white/10 text-[#9BA7B8] text-[9px] px-1.5 rounded-full">{participation.length}</span>
            )}
            {t.key === 'scoring' && viability.length > 0 && (
              <span className="ml-0.5 bg-white/10 text-[#9BA7B8] text-[9px] px-1.5 rounded-full">{viability.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-6 space-y-4">

        {/* BRIEF */}
        {tab === 'brief' && (
          <div className="space-y-4">
            {opp.description && (
              <div className="bg-[#08111f] border border-white/10 rounded-lg p-4 space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Description</div>
                <p className="text-sm text-[#9BA7B8] leading-relaxed">{opp.description}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries({
                'Target Audience':             opp.eligibility?.target_audience,
                'Business Categories':         opp.eligibility?.business_categories,
                'Activation Goal':             opp.eligibility?.activation_goal,
                'Participation Requirements':  opp.eligibility?.participation_requirements,
                'Expected Outputs':            opp.eligibility?.expected_outputs,
                'Outcome Measures':            opp.eligibility?.outcome_measures,
                'Visibility':                  opp.eligibility?.visibility,
              }).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="bg-[#08111f] border border-white/10 rounded-lg p-3 space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">{k}</div>
                  <div className="text-sm text-[#9BA7B8]">{v as string}</div>
                </div>
              ))}
            </div>
            {(opp.eligibility?.evidence_requirements as unknown as string[])?.length > 0 && (
              <div className="bg-[#08111f] border border-white/10 rounded-lg p-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-2">Evidence Requirements</div>
                <ul className="space-y-1">
                  {(opp.eligibility?.evidence_requirements as unknown as string[]).map((r, i) => (
                    <li key={i} className="text-xs text-[#9BA7B8] flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-[#374151] mt-0.5 flex-shrink-0" />{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-[9px] text-[#374151] tracking-widest pt-2">
              CREATED {new Date(opp.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })} · EVIDENCE DECIDES · HUMANS GOVERN
            </div>
          </div>
        )}

        {/* FIT & SCORING */}
        {tab === 'scoring' && (
          <div className="space-y-4">
            <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-3 text-xs text-amber-400">
              Opportunity readiness (how strong is this opportunity) is separate from business viability (how ready is a specific business to participate). Scores shown are business-to-opportunity viability assessments.
            </div>
            {viability.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 rounded-xl border border-dashed border-white/10">
                <Zap className="w-8 h-8 text-[#374151]" />
                <p className="text-sm text-[#9BA7B8]">No viability assessments yet</p>
                <a href={`/viability?opportunity_id=${opp.id}`} className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">
                  Run Viability Assessment →
                </a>
              </div>
            ) : (
              viability.map(va => (
                <div key={va.id} className="bg-[#08111f] border border-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-[#E6EDF5]">
                        {(va as any).business_profiles?.business_name ?? 'Unknown business'}
                      </div>
                      <div className="text-[10px] text-[#617089] mt-0.5">
                        {new Date(va.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#C6A66B]">{Math.round(va.score)}</div>
                      <ConfidenceBadge confidence={va.confidence} />
                    </div>
                  </div>
                  <ScoreBar score={va.score} />
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${
                      va.recommendation === 'Join' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                      : va.recommendation === 'Join with Conditions' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                      : va.recommendation === 'Hold' ? 'text-[#617089] bg-white/5 border-white/10'
                      : 'text-red-400 bg-red-400/10 border-red-400/20'
                    }`}>
                      {va.recommendation}
                    </span>
                  </div>
                  {Array.isArray(va.evidence) && va.evidence.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Evidence factors</div>
                      {va.evidence.map((e: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {e.met ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-[#374151] flex-shrink-0" />}
                          <span className={e.met ? 'text-[#9BA7B8]' : 'text-[#617089]'}>{e.label}</span>
                          <span className="ml-auto text-[10px] text-[#374151]">{e.weight}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {Array.isArray(va.actions) && va.actions.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Next actions</div>
                      {va.actions.map((a: any, i: number) => (
                        <div key={i} className="text-xs text-[#9BA7B8] flex items-start gap-1.5">
                          <ChevronRight className="w-3 h-3 text-[#374151] mt-0.5 flex-shrink-0" />{a}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PARTICIPANTS */}
        {tab === 'participants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#617089]">{participation.length} participation record{participation.length !== 1 ? 's' : ''}</p>
              <a href={`/participation?opportunity_id=${opp.id}`} className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">
                + Record Decision →
              </a>
            </div>
            {participation.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 rounded-xl border border-dashed border-white/10">
                <Handshake className="w-8 h-8 text-[#374151]" />
                <p className="text-sm text-[#9BA7B8]">No participation decisions yet</p>
              </div>
            ) : (
              participation.map(pr => (
                <div key={pr.id} className="bg-[#08111f] border border-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#E6EDF5]">
                      {(pr as any).business_profiles?.business_name ?? 'Unknown business'}
                    </div>
                    {pr.evidence?.decision && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${
                        pr.evidence.decision === 'Join' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        : pr.evidence.decision === 'Join with Conditions' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                        : pr.evidence.decision === 'Hold' ? 'text-[#617089] bg-white/5 border-white/10'
                        : 'text-red-400 bg-red-400/10 border-red-400/20'
                      }`}>
                        {pr.evidence.decision}
                      </span>
                    )}
                  </div>
                  {pr.evidence?.proposed_role && <div className="text-xs text-[#9BA7B8]">Role: {pr.evidence.proposed_role}</div>}
                  {pr.evidence?.conditions && <div className="text-xs text-amber-400/80">Conditions: {pr.evidence.conditions}</div>}
                  {Array.isArray(pr.evidence?.milestones) && pr.evidence.milestones.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Milestones</div>
                      {pr.evidence.milestones.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-2 text-xs">
                          {m.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 text-[#374151] flex-shrink-0" />}
                          <span className={m.completed ? 'text-[#617089] line-through' : 'text-[#9BA7B8]'}>{m.title}</span>
                          {m.target_date && <span className="ml-auto text-[10px] text-[#374151]">{new Date(m.target_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ACTIVATION */}
        {tab === 'activation' && (
          <div className="space-y-4">
            <div className="bg-[#08111f] border border-white/10 rounded-lg p-4 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Activation State</div>
              <div className="text-xs text-[#9BA7B8]">
                Activation tracks who is doing what, by when. Each participation record contributes milestones and conditions.
                Use the Participation &amp; JVs page to manage individual records and milestone completion.
              </div>
              <a href={`/participation?opportunity_id=${opp.id}`} className="inline-flex items-center gap-1 text-xs text-[#C6A66B] hover:underline">
                Open Participation &amp; JVs <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            {/* Aggregate milestones across all participation records */}
            {participation.flatMap(pr => (pr.evidence?.milestones ?? []).map((m: any) => ({
              ...m,
              business: (pr as any).business_profiles?.business_name,
            }))).length > 0 ? (
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">All milestones</div>
                {participation.flatMap(pr => (pr.evidence?.milestones ?? []).map((m: any) => ({
                  ...m,
                  business: (pr as any).business_profiles?.business_name,
                }))).map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-[#08111f] border border-white/10 rounded-lg px-4 py-2.5">
                    {m.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Clock className="w-4 h-4 text-[#374151] flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#E6EDF5]">{m.title}</div>
                      {m.business && <div className="text-[10px] text-[#617089]">{m.business}</div>}
                    </div>
                    {m.target_date && <span className="text-[10px] text-[#617089]">{new Date(m.target_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[#617089]">No milestones recorded yet.</div>
            )}
          </div>
        )}

        {/* OUTCOMES */}
        {tab === 'outcomes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#617089]">Outcomes linked to this organisation's records</p>
              <a href="/outcomes" className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">
                + Record Outcome →
              </a>
            </div>
            {outcomes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 rounded-xl border border-dashed border-white/10">
                <TrendingUp className="w-8 h-8 text-[#374151]" />
                <p className="text-sm text-[#9BA7B8]">No outcomes recorded yet</p>
                <p className="text-xs text-[#617089]">Record an outcome after milestones are completed</p>
              </div>
            ) : (
              outcomes.map(o => (
                <div key={o.id} className="bg-[#08111f] border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#E6EDF5]">{o.metric_name}</div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${
                      o.evidence_state === 'confirmed' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    }`}>{o.evidence_state ?? 'self-reported'}</span>
                  </div>
                  {o.metric_value && <div className="text-sm text-[#C6A66B] font-semibold">{o.metric_value}</div>}
                  {o.notes && <div className="text-xs text-[#9BA7B8]">{o.notes}</div>}
                  <div className="text-[10px] text-[#374151]">{new Date(o.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EVIDENCE */}
        {tab === 'evidence' && (
          <div className="space-y-4">
            <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-3 text-xs text-amber-400">
              Evidence state controls confidence. Self-entered evidence produces Low confidence. Human review or verified ownership raises it.
            </div>

            {/* Viability evidence items aggregated */}
            {viability.length > 0 ? (
              viability.map(va => (
                <div key={va.id} className="bg-[#08111f] border border-white/10 rounded-lg p-4 space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">
                    Assessment evidence — {(va as any).business_profiles?.business_name ?? 'Business'}
                  </div>
                  {Array.isArray(va.evidence) && va.evidence.map((e: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      {e.met ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-[#374151] mt-0.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className={e.met ? 'text-[#9BA7B8]' : 'text-[#617089]'}>{e.label}</div>
                        {e.note && <div className="text-[10px] text-[#374151] mt-0.5">{e.note}</div>}
                      </div>
                      <span className="text-[10px] text-[#374151] flex-shrink-0">{e.weight}%</span>
                    </div>
                  ))}
                  <ConfidenceBadge confidence={va.confidence} />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#617089]">
                Run a viability assessment to generate an evidence ledger.
                <div className="mt-3">
                  <a href={`/viability?opportunity_id=${opp.id}`} className="text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">
                    Run Viability Assessment →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
