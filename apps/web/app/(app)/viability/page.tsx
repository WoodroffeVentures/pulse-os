'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, AlertCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

type BusinessProfile = { id: string; business_name: string; verified_signals: Record<string, unknown>; verification_status: string; };
type Opportunity = { id: string; title: string; district: string | null; eligibility: Record<string, unknown>; };
type ViabilityAnalysis = {
  id: string;
  opportunity_id: string;
  business_profile_id: string;
  score: number;
  confidence: number;
  recommendation: string;
  evidence: unknown[];
  risks: unknown[];
  actions: unknown[];
  status: string;
  created_at: string;
};

type EvidenceItem = { label: string; weight: number; met: boolean; note: string; };
type RiskItem = { flag: string; severity: 'low' | 'medium' | 'high'; };

const RECOMMENDATIONS = ['Join', 'Join with Conditions', 'Hold', 'Not Suitable'] as const;

function computeViability(biz: BusinessProfile, opp: Opportunity): {
  score: number; confidence: number; recommendation: typeof RECOMMENDATIONS[number];
  evidence: EvidenceItem[]; risks: RiskItem[]; actions: string[];
  districtFit: boolean; audienceFit: boolean; operationalReadiness: string;
  readinessScore: number; missingEvidence: string[];
} {
  const signals = biz.verified_signals ?? {};
  const evidenceState = (signals.evidence_state as string) ?? 'Self-entered';
  const category = (signals.category as string) ?? '';
  const district = (signals.district as string) ?? '';
  const eligDistrict = (opp.district ?? '').toLowerCase();
  const eligCategories = ((opp.eligibility?.business_categories as string) ?? '').toLowerCase();

  const evidence: EvidenceItem[] = [
    {
      label: 'Business profile created',
      weight: 10,
      met: true,
      note: 'Profile exists in the system.',
    },
    {
      label: 'Category aligned with opportunity',
      weight: 20,
      met: !eligCategories || eligCategories.split(',').some(c => category.toLowerCase().includes(c.trim())),
      note: eligCategories ? `Opportunity requires: ${eligCategories}` : 'No category filter set.',
    },
    {
      label: 'District or region match',
      weight: 15,
      met: !eligDistrict || district.toLowerCase().includes(eligDistrict) || eligDistrict.includes(district.toLowerCase()),
      note: eligDistrict ? `Opportunity district: ${opp.district}` : 'No district filter set.',
    },
    {
      label: 'Contact details on file',
      weight: 10,
      met: !!(signals.phone || signals.email),
      note: signals.phone || signals.email ? 'Contact details present.' : 'Phone or email missing.',
    },
    {
      label: 'Website provided',
      weight: 10,
      met: !!(biz as any).website_url || !!(signals.website_url),
      note: (biz as any).website_url ? 'Website on record.' : 'No website provided.',
    },
    {
      label: 'Google Place ID linked',
      weight: 10,
      met: !!(biz as any).google_place_id,
      note: (biz as any).google_place_id ? 'Place ID present (place matched, not ownership verified).' : 'No Place ID — cannot perform place matching.',
    },
    {
      label: 'Evidence state above self-entered',
      weight: 15,
      met: !['Self-entered', 'Missing'].includes(evidenceState),
      note: `Current state: ${evidenceState}. Human review or verified signals raise confidence.`,
    },
    {
      label: 'Verification status: verified',
      weight: 10,
      met: biz.verification_status === 'verified',
      note: biz.verification_status === 'verified' ? 'Profile is verified.' : `Status: ${biz.verification_status}.`,
    },
  ];

  const maxScore = evidence.reduce((s, e) => s + e.weight, 0);
  const earnedScore = evidence.filter(e => e.met).reduce((s, e) => s + e.weight, 0);
  const score = Math.round((earnedScore / maxScore) * 100);

  // Confidence is low if evidence state is self-entered only
  const confidenceMultiplier = evidenceState === 'Self-entered' ? 0.45
    : evidenceState === 'Place matched' ? 0.60
    : evidenceState === 'Contact confirmed' ? 0.70
    : evidenceState === 'Evidence submitted' ? 0.78
    : evidenceState === 'Human reviewed' ? 0.90
    : evidenceState === 'Google ownership connected' ? 0.95
    : 0.40;

  const confidence = Math.round(confidenceMultiplier * 100);

  const districtFit = evidence[2].met;
  const audienceFit = evidence[1].met;
  const metCount = evidence.filter(e => e.met).length;
  const operationalReadiness = metCount >= 6 ? 'High' : metCount >= 4 ? 'Medium' : 'Low';
  const readinessScore = Math.round((metCount / evidence.length) * 100);

  const missingEvidence = evidence.filter(e => !e.met).map(e => e.label);

  const risks: RiskItem[] = [];
  if (evidenceState === 'Self-entered') risks.push({ flag: 'All evidence is self-entered — no third-party verification', severity: 'high' });
  if (!evidence[2].met) risks.push({ flag: 'District mismatch — opportunity may not apply to this business location', severity: 'medium' });
  if (!evidence[1].met) risks.push({ flag: 'Category mismatch — business may not qualify for this opportunity type', severity: 'high' });
  if (biz.verification_status !== 'verified') risks.push({ flag: 'Business profile is unverified', severity: 'medium' });
  if (!(biz as any).google_place_id) risks.push({ flag: 'No Google Place ID — place matching not possible', severity: 'low' });

  const recommendation: typeof RECOMMENDATIONS[number] =
    score >= 75 && risks.filter(r => r.severity === 'high').length === 0 ? 'Join'
    : score >= 55 ? 'Join with Conditions'
    : score >= 40 ? 'Hold'
    : 'Not Suitable';

  const actions: string[] = [];
  if (evidenceState === 'Self-entered') actions.push('Upload supporting evidence documents to improve confidence');
  if (!(biz as any).google_place_id) actions.push('Add Google Place ID for place matching');
  if (biz.verification_status !== 'verified') actions.push('Request human review to achieve verified status');
  if (!evidence[3].met) actions.push('Add phone or email contact details');
  if (!evidence[4].met) actions.push('Add website URL');

  return { score, confidence, recommendation, evidence, risks, actions, districtFit, audienceFit, operationalReadiness, readinessScore, missingEvidence };
}

const REC_STYLES: Record<string, string> = {
  'Join': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'Join with Conditions': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Hold': 'text-[#617089] bg-white/5 border-white/10',
  'Not Suitable': 'text-red-400 bg-red-400/10 border-red-400/30',
};

function ViabilityPageInner() {
  const searchParams = useSearchParams();
  const preselectedOppId = searchParams.get('opportunity_id');

  const { orgId, loading: orgLoading } = useOrg();
  const supabase = createClient();

  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [analyses, setAnalyses] = useState<ViabilityAnalysis[]>([]);
  const [fetching, setFetching] = useState(false);

  const [selectedBiz, setSelectedBiz] = useState('');
  const [selectedOpp, setSelectedOpp] = useState(preselectedOppId ?? '');
  const [result, setResult] = useState<ReturnType<typeof computeViability> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const [bizRes, oppRes, analysisRes] = await Promise.all([
      supabase.from('business_profiles').select('*').eq('organization_id', oid).order('business_name'),
      supabase.from('opportunities').select('*').eq('organization_id', oid).order('created_at', { ascending: false }),
      supabase.from('viability_analyses').select('*').eq('organization_id', oid).order('created_at', { ascending: false }),
    ]);
    setBusinesses(bizRes.data ?? []);
    setOpportunities(oppRes.data ?? []);
    setAnalyses(analysisRes.data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  function runAssessment() {
    const biz = businesses.find(b => b.id === selectedBiz);
    const opp = opportunities.find(o => o.id === selectedOpp);
    if (!biz || !opp) return;
    setResult(computeViability(biz, opp));
    setSaved(false);
    setSaveError(null);
  }

  async function saveAssessment() {
    if (!result || !orgId) return;
    setSaving(true); setSaveError(null);
    const { error } = await supabase.from('viability_analyses').insert({
      organization_id: orgId,
      opportunity_id: selectedOpp,
      business_profile_id: selectedBiz,
      score: result.score,
      confidence: result.confidence / 100,
      recommendation: result.recommendation,
      evidence: result.evidence,
      risks: result.risks,
      actions: result.actions,
      status: 'draft',
      ai_model: 'rules-based-v1',
    });
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    setSaved(true);
    load(orgId);
  }

  if (orgLoading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Viability Assessment</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">
          Rules-based, explainable assessment. No fabricated data. Confidence reflects evidence quality only.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#08111f] p-5 space-y-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Run New Assessment</div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Business Profile</label>
            {fetching ? <div className="text-xs text-[#617089]">Loading…</div> : businesses.length === 0 ? (
              <p className="text-xs text-amber-400">No business profiles yet — <a href="/businesses" className="underline">add one</a></p>
            ) : (
              <select value={selectedBiz} onChange={e => { setSelectedBiz(e.target.value); setResult(null); }}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                <option value="">Select business…</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.business_name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#617089] mb-1">Opportunity</label>
            {fetching ? <div className="text-xs text-[#617089]">Loading…</div> : opportunities.length === 0 ? (
              <p className="text-xs text-amber-400">No opportunities yet — <a href="/opportunities" className="underline">create one</a></p>
            ) : (
              <select value={selectedOpp} onChange={e => { setSelectedOpp(e.target.value); setResult(null); }}
                className="w-full bg-[#020912] border border-white/10 rounded px-3 py-2 text-sm text-[#E6EDF5] focus:outline-none focus:border-[#C6A66B]/40">
                <option value="">Select opportunity…</option>
                {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
              </select>
            )}
          </div>
        </div>

        <button
          onClick={runAssessment}
          disabled={!selectedBiz || !selectedOpp}
          className="px-4 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#C6A66B]/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Run Assessment
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Viability Score</div>
              <div className="text-3xl font-mono font-bold" style={{ color: result.score >= 75 ? '#2BB8A5' : result.score >= 55 ? '#C6A66B' : result.score >= 40 ? '#E8D9A8' : '#ef4444' }}>
                {result.score}
              </div>
              <div className="text-[10px] text-[#617089] mt-1">out of 100</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Confidence</div>
              <div className="text-3xl font-mono font-bold text-[#9BA7B8]">{result.confidence}%</div>
              <div className="text-[10px] text-[#617089] mt-1">evidence quality</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Readiness</div>
              <div className="text-3xl font-mono font-bold text-[#E6EDF5]">{result.readinessScore}%</div>
              <div className="text-[10px] text-[#617089] mt-1">{result.operationalReadiness}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Recommendation</div>
              <div className={`mt-1 text-xs font-bold px-2 py-1 rounded border inline-block ${REC_STYLES[result.recommendation]}`}>
                {result.recommendation}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Evidence Used</div>
              {result.evidence.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {e.met
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <span className={e.met ? 'text-[#E6EDF5]' : 'text-[#617089]'}>{e.label}</span>
                    <div className="text-[10px] text-[#374151] mt-0.5">{e.note} ({e.weight}pts)</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {result.risks.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Risk Flags</div>
                  {result.risks.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${r.severity === 'high' ? 'text-red-400' : r.severity === 'medium' ? 'text-amber-400' : 'text-[#617089]'}`} />
                      <span className="text-[#9BA7B8]">{r.flag}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.missingEvidence.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Missing Evidence</div>
                  {result.missingEvidence.map((m, i) => (
                    <div key={i} className="text-xs text-[#617089] flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-400" /> {m}
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-[#08111f] p-4 space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Next Best Actions</div>
                {result.actions.length === 0
                  ? <p className="text-xs text-emerald-400">All key evidence indicators are met.</p>
                  : result.actions.map((a, i) => (
                    <div key={i} className="text-xs text-[#9BA7B8] flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 text-[#C6A66B] flex-shrink-0 mt-0.5" /> {a}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#08111f] border border-white/10 flex-1">
              <div className={`text-xs font-bold px-2 py-0.5 rounded border ${REC_STYLES[result.recommendation]}`}>{result.recommendation}</div>
              <div className="flex gap-3 text-[10px] text-[#617089]">
                <span>District fit: {result.districtFit ? '✓' : '✗'}</span>
                <span>Audience fit: {result.audienceFit ? '✓' : '✗'}</span>
                <span>Confidence: {result.confidence}%</span>
              </div>
            </div>
            {!saved ? (
              <button onClick={saveAssessment} disabled={saving}
                className="px-4 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#C6A66B]/90 disabled:opacity-50 flex-shrink-0">
                {saving ? 'Saving…' : 'Save Assessment'}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </div>
            )}
            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
          </div>

          <div className="text-[10px] text-[#374151] text-center py-2 tracking-widest">
            RULES-BASED ASSESSMENT · NO FABRICATED DATA · CONFIDENCE REFLECTS EVIDENCE QUALITY ONLY · AI ASSISTS · HUMANS GOVERN
          </div>
        </div>
      )}

      {analyses.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">Previous Assessments</div>
          {analyses.map(a => (
            <div key={a.id} className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-3 flex items-center gap-4">
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${REC_STYLES[a.recommendation] ?? REC_STYLES['Hold']}`}>
                {a.recommendation}
              </div>
              <div className="flex-1 text-xs text-[#9BA7B8] font-mono truncate">
                Score {a.score} · Confidence {Math.round(a.confidence * 100)}%
              </div>
              <div className="text-[10px] text-[#617089]">
                {new Date(a.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <a href={`/participation?opportunity_id=${a.opportunity_id}&business_id=${a.business_profile_id}&score=${a.score}&recommendation=${encodeURIComponent(a.recommendation)}`}
                className="text-xs text-[#C6A66B] hover:underline flex items-center gap-1 flex-shrink-0">
                Record decision <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ViabilityPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#617089] text-sm">Loading…</div>}>
      <ViabilityPageInner />
    </Suspense>
  );
}
