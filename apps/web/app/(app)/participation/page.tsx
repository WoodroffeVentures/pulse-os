'use client';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';

type ParticipationRecord = {
  id: string;
  status: string;
  opportunity_id: string;
  business_profile_id: string;
  evidence: Record<string, unknown>;
  updated_at: string;
};

const DEMO_RECORDS: ParticipationRecord[] = [
  { id: 'p-001', status: 'jv_active', opportunity_id: 'opp-003', business_profile_id: 'd-biz-001', evidence: { viability_score: 74, foc: true, revenue_share_proposer: 40 }, updated_at: '2026-08-01T10:00:00Z' },
  { id: 'p-002', status: 'accepted', opportunity_id: 'opp-005', business_profile_id: 'd-biz-005', evidence: { viability_score: 79, foc: true, revenue_share_proposer: 50 }, updated_at: '2026-08-03T14:00:00Z' },
  { id: 'p-003', status: 'conditional', opportunity_id: 'opp-004', business_profile_id: 'd-biz-004', evidence: { viability_score: 51, foc: true, conditions: 'Guide certification renewal required within 30 days.' }, updated_at: '2026-07-28T09:00:00Z' },
  { id: 'p-004', status: 'in_review', opportunity_id: 'opp-002', business_profile_id: 'd-biz-002', evidence: { viability_score: 88, foc: true, revenue_share_proposer: 40 }, updated_at: '2026-08-06T11:00:00Z' },
  { id: 'p-005', status: 'declined', opportunity_id: 'opp-006', business_profile_id: 'd-biz-006', evidence: { viability_score: 38, foc: true, decline_reason: 'Insufficient evidence — profile not verified.' }, updated_at: '2026-07-20T16:00:00Z' },
];

const STATUS_COLORS: Record<string, string> = {
  jv_active: '#9B6DFF', accepted: '#2BB8A5', conditional: '#C6A66B',
  in_review: '#E8D9A8', declined: '#ef4444', presentation_requested: '#C6A66B', identified: '#9BA7B8',
};

export default function ParticipationPage() {
  const [records, setRecords] = useState<ParticipationRecord[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [decisionTarget, setDecisionTarget] = useState<string | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRecords(DEMO_RECORDS);
      setSource('demo');
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase.from('participation_records').select('*').order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) { setRecords(data); setSource('live'); }
        setLoading(false);
      });
  }, []);

  async function recordDecision(pitchId: string, opportunityId: string, decision: string) {
    if (!isSupabaseConfigured()) { alert('Demo mode — connect Supabase to record real decisions.'); return; }
    setDecisionLoading(true);
    await fetch(`/api/opportunities/${opportunityId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    setDecisionTarget(null);
    setDecisionLoading(false);
    const supabase = createClient();
    const { data } = await supabase.from('participation_records').select('*').order('updated_at', { ascending: false });
    if (data) setRecords(data);
  }

  const demoBadge = source === 'demo'
    ? <span style={{ background: '#1e1e2e', border: '1px solid #374151', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#6b7280' }}>⬛ DEMO DATA</span>
    : <span style={{ background: '#0d2b1e', border: '1px solid #2BB8A5', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#2BB8A5' }}>● LIVE</span>;

  return (
    <div style={{ padding: '2rem', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#9BA7B8', marginBottom: 2 }}>PULSE OPPORTUNITIES</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Venue Inbox</h1>
        </div>
        <div style={{ marginLeft: 'auto' }}>{demoBadge}</div>
      </div>
      <p style={{ color: '#9BA7B8', fontSize: 13, marginBottom: '1.5rem' }}>
        Incoming opportunity pitches from verified businesses. Accept, decline, set conditions or request a presentation. Every decision is audited.
      </p>
      {loading ? (
        <div style={{ color: '#9BA7B8', fontSize: 13, padding: '2rem' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {records.map(r => {
            const color = STATUS_COLORS[r.status] ?? '#9BA7B8';
            const score = r.evidence?.viability_score as number | undefined;
            const isInbox = r.status === 'in_review' || r.status === 'identified';
            return (
              <div key={r.id} style={{ background: '#0B1220', border: `1px solid ${isInbox ? 'rgba(198,166,107,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                      <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                      {score !== undefined && (
                        <span style={{ background: (score >= 75 ? '#2BB8A5' : score >= 55 ? '#C6A66B' : '#ef4444') + '22', color: score >= 75 ? '#2BB8A5' : score >= 55 ? '#C6A66B' : '#ef4444', borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 700, border: `1px solid ${(score >= 75 ? '#2BB8A5' : score >= 55 ? '#C6A66B' : '#ef4444')}44` }}>
                          {score}
                        </span>
                      )}
                      {!!r.evidence?.foc && <span style={{ fontSize: 10, color: '#2BB8A5', letterSpacing: 1 }}>FOC</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#9BA7B8' }}>Pitch ID: {r.id} · Opp: {r.opportunity_id}</div>
                    {!!r.evidence?.conditions && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#C6A66B', background: 'rgba(198,166,107,0.08)', border: '1px solid rgba(198,166,107,0.2)', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
                        Condition: {String(r.evidence.conditions)}
                      </div>
                    )}
                    {!!r.evidence?.decline_reason && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>{String(r.evidence.decline_reason)}</div>
                    )}
                  </div>
                  {isInbox && (
                    <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
                      {decisionTarget === r.id ? (
                        <>
                          {(['accepted', 'declined', 'conditional', 'request_presentation'] as const).map(d => (
                            <button key={d} disabled={decisionLoading} onClick={() => recordDecision(r.id, r.opportunity_id, d)}
                              style={{ background: d === 'accepted' ? '#2BB8A5' : d === 'declined' ? '#ef4444' : d === 'conditional' ? '#C6A66B' : '#9B6DFF', color: '#07090E', border: 'none', borderRadius: 5, padding: '0.35rem 0.75rem', fontSize: 10, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {d.replace(/_/g, ' ')}
                            </button>
                          ))}
                          <button onClick={() => setDecisionTarget(null)} style={{ background: 'transparent', color: '#9BA7B8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '0.35rem 0.6rem', fontSize: 10, cursor: 'pointer' }}>✕</button>
                        </>
                      ) : (
                        <button onClick={() => setDecisionTarget(r.id)} style={{ background: 'rgba(198,166,107,0.15)', color: '#C6A66B', border: '1px solid rgba(198,166,107,0.3)', borderRadius: 5, padding: '0.35rem 0.85rem', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
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
      )}
    </div>
  );
}
