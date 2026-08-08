'use client';

import { useState } from 'react';
import {
  drakensbergOrg,
  boardMetrics,
  drakensbergOpportunities,
  drakensbergBusinesses,
  guestIntentPatterns,
  boardPresentationSteps,
  DEMO_LABEL,
} from '@/lib/drakensberg-demo';

const ACCENT = '#C6A66B';
const TEAL = '#2BB8A5';
const PURPLE = '#9B6DFF';
const DIM = '#5C6677';

function DemoBadge() {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border"
      style={{ background: 'rgba(198,166,107,.08)', borderColor: 'rgba(198,166,107,.25)', color: ACCENT }}>
      ⬛ DEMO DATA
    </div>
  );
}

function MetricCard({ label, value, sub, color = '#E6EDF5' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: '#0A1118', borderColor: '#1a2030' }}>
      <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: DIM }}>{label}</div>
      <div className="text-2xl font-light" style={{ color, fontFamily: 'Georgia, serif' }}>{value}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: DIM }}>{sub}</div>}
    </div>
  );
}

function StepCard({ step, active, onClick }: { step: typeof boardPresentationSteps[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border p-4 transition-all"
      style={{
        background: active ? 'rgba(198,166,107,.06)' : '#0A1118',
        borderColor: active ? 'rgba(198,166,107,.35)' : '#1a2030',
        outline: 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: active ? ACCENT : '#1a2030', color: active ? '#07090E' : DIM }}>
          {step.step}
        </div>
        <div className="text-sm font-medium" style={{ color: active ? '#E6EDF5' : '#9AA4B2' }}>{step.title}</div>
      </div>
      {active && (
        <div className="ml-9">
          <p className="text-xs leading-relaxed mb-3" style={{ color: '#9AA4B2' }}>{step.summary}</p>
          <div className="rounded-lg p-3" style={{ background: 'rgba(198,166,107,.05)', border: '1px solid rgba(198,166,107,.15)' }}>
            <div className="text-xs font-semibold" style={{ color: ACCENT }}>{step.metric}</div>
            <div className="text-[10px] mt-1 tracking-widest uppercase" style={{ color: DIM }}>{step.metricLabel}</div>
          </div>
        </div>
      )}
    </button>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? TEAL : score >= 55 ? ACCENT : score >= 40 ? PURPLE : '#e85c5c';
  return <span className="font-mono text-xs font-semibold" style={{ color }}>{score}</span>;
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    open: { label: 'Open', bg: 'rgba(43,184,165,.1)', color: TEAL },
    in_review: { label: 'In Review', bg: 'rgba(198,166,107,.1)', color: ACCENT },
    jv_active: { label: 'JV Active', bg: 'rgba(43,184,165,.12)', color: TEAL },
    accepted: { label: 'Accepted', bg: 'rgba(43,184,165,.1)', color: TEAL },
    conditional: { label: 'Conditional', bg: 'rgba(155,109,255,.1)', color: PURPLE },
    declined: { label: 'Declined', bg: 'rgba(232,100,100,.08)', color: '#e85c5c' },
    verified: { label: 'Verified', bg: 'rgba(43,184,165,.1)', color: TEAL },
    pending: { label: 'Pending', bg: 'rgba(198,166,107,.08)', color: ACCENT },
    needs_review: { label: 'Needs Review', bg: 'rgba(155,109,255,.1)', color: PURPLE },
    unverified: { label: 'Unverified', bg: 'rgba(255,255,255,.04)', color: DIM },
  };
  const c = cfg[status] ?? { label: status, bg: 'rgba(255,255,255,.04)', color: DIM };
  return (
    <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}>{c.label}</span>
  );
}

type Tab = 'overview' | 'opportunities' | 'businesses' | 'discovery' | 'presentation';

export default function BoardDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeStep, setActiveStep] = useState(0);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Command Overview' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'businesses', label: 'Business Profiles' },
    { id: 'discovery', label: 'Guest Intent' },
    { id: 'presentation', label: '▶ Board Presentation' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#07090E', color: '#F4EFE6', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50"
        style={{ background: 'rgba(7,9,14,.95)', borderColor: '#1a2030', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#07090E' }} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-widest uppercase" style={{ letterSpacing: '0.18em' }}>
              PULSE <span style={{ color: ACCENT }}>OS</span>
            </div>
            <div className="text-[10px] tracking-widest uppercase" style={{ color: DIM }}>
              {drakensbergOrg.name}
            </div>
          </div>
        </div>
        <DemoBadge />
      </div>

      {/* Tab nav */}
      <div className="border-b px-6 flex gap-1 overflow-x-auto" style={{ borderColor: '#1a2030' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap border-b-2 transition-colors"
            style={{
              borderColor: activeTab === t.id ? ACCENT : 'transparent',
              color: activeTab === t.id ? ACCENT : DIM,
              background: 'transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs tracking-widest uppercase mb-1" style={{ color: DIM }}>Tourism Board Command Dashboard</div>
              <h1 className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif' }}>
                {drakensbergOrg.region}
              </h1>
              <div className="text-xs mt-1" style={{ color: DIM }}>
                Districts: {drakensbergOrg.districts.join(' · ')}
              </div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                label="Verified Profiles"
                value={`${boardMetrics.verifiedProfiles} / ${boardMetrics.totalProfiles}`}
                sub={`${boardMetrics.pendingVerification} pending · ${boardMetrics.needsReview} need review`}
                color={TEAL}
              />
              <MetricCard
                label="Active Opportunities"
                value={boardMetrics.activeOpportunities}
                sub={`${boardMetrics.openOpportunities} awaiting venue · ${boardMetrics.jvActive} JV active`}
                color={ACCENT}
              />
              <MetricCard
                label="Acceptance Rate"
                value={`${boardMetrics.acceptanceRate}%`}
                sub="Of scored opportunities"
                color={TEAL}
              />
              <MetricCard
                label="JV Revenue Tracked"
                value={`R ${boardMetrics.totalJvRevenue.toLocaleString()}`}
                sub="Demo · across 2 active JV accounts"
                color={ACCENT}
              />
              <MetricCard
                label="Avg Viability Score"
                value={`${boardMetrics.avgViabilityScore} / 100`}
                sub="Across all scored pitches"
              />
              <MetricCard
                label="SME Participants"
                value={boardMetrics.smeParticipants}
                sub="Small & micro enterprises"
                color={PURPLE}
              />
              <MetricCard
                label="Community Enterprises"
                value={boardMetrics.communityParticipants}
                sub="Including artisans and cooperatives"
                color={PURPLE}
              />
              <MetricCard
                label="Data Quality Score"
                value={`${boardMetrics.dataQualityScore}%`}
                sub="Evidence completeness across profiles"
                color={boardMetrics.dataQualityScore >= 75 ? TEAL : ACCENT}
              />
            </div>

            {/* Infrastructure constraint alert */}
            <div className="rounded-xl border p-4 flex gap-3 items-start"
              style={{ background: 'rgba(155,109,255,.04)', borderColor: 'rgba(155,109,255,.2)' }}>
              <div className="text-xs font-bold tracking-widest uppercase mt-0.5 flex-shrink-0" style={{ color: PURPLE }}>⚠ Constraint</div>
              <div>
                <div className="text-sm font-medium mb-1">Infrastructure Limitation Affecting Participation</div>
                <div className="text-xs" style={{ color: '#9AA4B2' }}>{boardMetrics.infrastructureConstraint}</div>
              </div>
              <div className="ml-auto flex-shrink-0"><StatusPill status="needs_review" /></div>
            </div>

            {/* Outcome evidence status */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1a2030' }}>
              <div className="px-4 py-3 border-b text-xs font-semibold tracking-widest uppercase" style={{ borderColor: '#1a2030', color: DIM }}>
                Outcome Evidence Status
              </div>
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-light mb-1" style={{ color: TEAL, fontFamily: 'Georgia, serif' }}>{boardMetrics.outcomeEvidenceComplete}</div>
                  <div className="text-xs" style={{ color: DIM }}>Outcome evidence complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light mb-1" style={{ color: ACCENT, fontFamily: 'Georgia, serif' }}>{boardMetrics.outcomeEvidencePending}</div>
                  <div className="text-xs" style={{ color: DIM }}>Outcome evidence pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light mb-1" style={{ color: PURPLE, fontFamily: 'Georgia, serif' }}>{boardMetrics.avgTimeToActivation}</div>
                  <div className="text-xs" style={{ color: DIM }}>Avg days pitch → JV open</div>
                </div>
              </div>
            </div>

            <p className="text-[10px] tracking-widest uppercase text-center" style={{ color: DIM }}>{DEMO_LABEL}</p>
          </div>
        )}

        {/* OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-light mb-1" style={{ fontFamily: 'Georgia, serif' }}>Opportunity Pipeline</h2>
              <p className="text-xs" style={{ color: DIM }}>All opportunities scored before venue review · demo data</p>
            </div>
            {drakensbergOpportunities.map(opp => (
              <div key={opp.id} className="rounded-xl border p-4" style={{ background: '#0A1118', borderColor: '#1a2030' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="text-xs tracking-widest uppercase mb-1" style={{ color: DIM }}>{opp.type.replace(/_/g, ' ')}</div>
                    <div className="text-base font-medium">{opp.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9AA4B2' }}>
                      Proposed by <span style={{ color: '#E6EDF5' }}>{opp.proposer}</span> · {opp.proposerBiz}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,.04)', color: DIM, fontFamily: 'monospace' }}>
                      Score: <ScoreBadge score={opp.score} />
                    </div>
                    <StatusPill status={opp.status} />
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: '#9AA4B2' }}>{opp.description}</p>
                <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: DIM }}>
                  <span>Target: <span style={{ color: '#E6EDF5' }}>{opp.targetVenue}</span></span>
                  <span>Split: <span style={{ color: '#E6EDF5' }}>{opp.revenueShare}</span></span>
                  <span>Upfront cost: <span style={{ color: TEAL }}>{opp.foc ? 'R 0 (FOC)' : 'Paid'}</span></span>
                  {opp.jvActive && <span style={{ color: TEAL }}>✓ JV account open</span>}
                </div>
              </div>
            ))}
            <p className="text-[10px] tracking-widest uppercase text-center pt-2" style={{ color: DIM }}>{DEMO_LABEL}</p>
          </div>
        )}

        {/* BUSINESSES */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-light mb-1" style={{ fontFamily: 'Georgia, serif' }}>Business Profiles</h2>
              <p className="text-xs" style={{ color: DIM }}>Verification states: verified / pending / needs_review / unverified · demo data</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {drakensbergBusinesses.map(biz => (
                <div key={biz.id} className="rounded-xl border p-4" style={{ background: '#0A1118', borderColor: '#1a2030' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-medium">{biz.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: DIM }}>{biz.owner} · {biz.district}</div>
                    </div>
                    <StatusPill status={biz.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs" style={{ color: DIM }}>Evidence score:</div>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${biz.evidenceScore}%`, background: biz.evidenceScore >= 75 ? TEAL : biz.evidenceScore >= 50 ? ACCENT : '#e85c5c' }} />
                    </div>
                    <div className="text-xs font-mono font-semibold" style={{ color: biz.evidenceScore >= 75 ? TEAL : biz.evidenceScore >= 50 ? ACCENT : '#e85c5c' }}>
                      {biz.evidenceScore}%
                    </div>
                  </div>
                  <div className="text-[10px] tracking-widest uppercase mt-2" style={{ color: DIM }}>
                    {biz.category.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] tracking-widest uppercase text-center pt-2" style={{ color: DIM }}>{DEMO_LABEL}</p>
          </div>
        )}

        {/* GUEST INTENT */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-light mb-1" style={{ fontFamily: 'Georgia, serif' }}>Guest Intent & Discovery Patterns</h2>
              <p className="text-xs" style={{ color: DIM }}>
                Aggregated intent signals — anonymised and privacy-respecting. Demo data · not real analytics.
              </p>
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1a2030' }}>
              <div className="px-4 py-3 border-b text-xs font-semibold tracking-widest uppercase" style={{ borderColor: '#1a2030', color: DIM }}>
                Top Intent Categories — Southern Drakensberg Region
              </div>
              <div className="p-4 space-y-4">
                {guestIntentPatterns.map(p => (
                  <div key={p.intent}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-sm font-medium">{p.intent}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-semibold" style={{ color: p.trend.startsWith('+') ? TEAL : '#e85c5c' }}>{p.trend}</div>
                        <div className="text-xs font-mono font-semibold" style={{ color: ACCENT }}>{p.share}%</div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,.05)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${p.share}%`, background: `linear-gradient(90deg, ${TEAL}, ${ACCENT})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: 'rgba(43,184,165,.04)', borderColor: 'rgba(43,184,165,.2)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: TEAL }}>Privacy Governance</div>
              <p className="text-xs leading-relaxed" style={{ color: '#9AA4B2' }}>
                Guest intent signals are aggregated at destination level. No individual guest is identified in tourism-board views.
                Individual profiles, if collected, are subject to guest consent and POPIA-aligned purpose limitation.
                Legal review required before production use.
              </p>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-center" style={{ color: DIM }}>{DEMO_LABEL}</p>
          </div>
        )}

        {/* BOARD PRESENTATION */}
        {activeTab === 'presentation' && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 flex items-center gap-3"
              style={{ background: 'rgba(198,166,107,.05)', borderColor: 'rgba(198,166,107,.2)' }}>
              <div className="text-xl">▶</div>
              <div>
                <div className="text-sm font-semibold" style={{ color: ACCENT }}>Board Presentation Mode</div>
                <div className="text-xs" style={{ color: DIM }}>
                  Seven-part guided story · {drakensbergOrg.name} · All data is labelled demo
                </div>
              </div>
              <div className="ml-auto"><DemoBadge /></div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-2">
                <div className="text-[10px] tracking-widest uppercase mb-3" style={{ color: DIM }}>Story Steps</div>
                {boardPresentationSteps.map((step, i) => (
                  <StepCard key={step.step} step={step} active={activeStep === i} onClick={() => setActiveStep(i)} />
                ))}
              </div>
              <div className="md:col-span-2">
                <div className="rounded-xl border p-6 h-full" style={{ background: '#0A1118', borderColor: '#1a2030' }}>
                  {(() => {
                    const step = boardPresentationSteps[activeStep];
                    return (
                      <div>
                        <div className="text-xs tracking-widest uppercase mb-2" style={{ color: ACCENT }}>
                          Step {step.step} of {boardPresentationSteps.length}
                        </div>
                        <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Georgia, serif' }}>{step.title}</h2>
                        <p className="text-sm leading-relaxed mb-6" style={{ color: '#9AA4B2', lineHeight: '1.8' }}>{step.summary}</p>
                        <div className="rounded-xl p-5" style={{ background: 'rgba(198,166,107,.05)', border: '1px solid rgba(198,166,107,.15)' }}>
                          <div className="text-base font-semibold mb-1" style={{ color: ACCENT }}>{step.metric}</div>
                          <div className="text-[10px] tracking-widest uppercase" style={{ color: DIM }}>{step.metricLabel}</div>
                        </div>
                        <div className="flex gap-2 mt-6">
                          {activeStep > 0 && (
                            <button onClick={() => setActiveStep(s => s - 1)}
                              className="px-4 py-2 text-xs rounded-lg border transition-colors"
                              style={{ borderColor: '#1a2030', color: DIM, background: 'transparent' }}>
                              ← Previous
                            </button>
                          )}
                          {activeStep < boardPresentationSteps.length - 1 && (
                            <button onClick={() => setActiveStep(s => s + 1)}
                              className="px-4 py-2 text-xs rounded-lg font-semibold transition-colors"
                              style={{ background: ACCENT, color: '#07090E' }}>
                              Next Step →
                            </button>
                          )}
                          {activeStep === boardPresentationSteps.length - 1 && (
                            <button onClick={() => setActiveStep(0)}
                              className="px-4 py-2 text-xs rounded-lg border transition-colors"
                              style={{ borderColor: 'rgba(198,166,107,.3)', color: ACCENT, background: 'transparent' }}>
                              ↺ Restart
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-center pt-2" style={{ color: DIM }}>{DEMO_LABEL}</p>
          </div>
        )}
      </div>
    </div>
  );
}
