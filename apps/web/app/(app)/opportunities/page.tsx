'use client';
import { useEffect, useState } from 'react';
import { listOpportunities, type OpportunityRow } from '@/lib/queries/opportunities';
import { isSupabaseConfigured } from '@/lib/env';
import { useOrg } from '@/lib/context/org-context';

const STATUS_COLORS: Record<string, string> = {
  open: '#2BB8A5',
  in_review: '#C6A66B',
  jv_active: '#9B6DFF',
  conditional: '#E8D9A8',
  accepted: '#2BB8A5',
  declined: '#ef4444',
  presentation_requested: '#C6A66B',
  jv_pending: '#9B6DFF',
};

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return null;
  const color = score >= 75 ? '#2BB8A5' : score >= 55 ? '#C6A66B' : score >= 40 ? '#E8D9A8' : '#ef4444';
  return (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
      {score}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#9BA7B8';
  return (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function OpportunitiesPage() {
  const { orgId } = useOrg();
  const [opps, setOpps] = useState<OpportunityRow[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [showPitchForm, setShowPitchForm] = useState(false);
  const [pitchForm, setPitchForm] = useState({ title: '', opportunity_type: 'guest_experience', description: '', district: '' });
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchResult, setPitchResult] = useState<string>('');

  useEffect(() => {
    listOpportunities(orgId ?? undefined).then(({ rows, source }) => {
      setOpps(rows);
      setSource(source);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orgId]);

  async function submitPitch(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setPitchResult('Demo mode — connect Supabase to submit real pitches.');
      return;
    }
    setPitchLoading(true);
    try {
      const res = await fetch('/api/opportunities/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pitchForm, foc: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setPitchResult(`Pitch submitted. Viability score: ${data.viability?.score ?? '—'}`);
        setShowPitchForm(false);
        listOpportunities(orgId ?? undefined).then(({ rows, source }) => { setOpps(rows); setSource(source); });
      } else {
        setPitchResult(data.error ?? 'Submission failed.');
      }
    } catch {
      setPitchResult('Network error — please retry.');
    }
    setPitchLoading(false);
  }

  const demoBadge = source === 'demo' ? (
    <span style={{ background: '#1e1e2e', border: '1px solid #374151', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#6b7280', letterSpacing: 1 }}>
      ⬛ DEMO DATA
    </span>
  ) : (
    <span style={{ background: '#0d2b1e', border: '1px solid #2BB8A5', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#2BB8A5', letterSpacing: 1 }}>
      ● LIVE
    </span>
  );

  return (
    <div style={{ padding: '2rem', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#9BA7B8', marginBottom: 2 }}>PULSE OPPORTUNITIES</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Opportunity Exchange</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {demoBadge}
          <button
            onClick={() => setShowPitchForm(v => !v)}
            style={{ background: '#C6A66B', color: '#07090E', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            + Pitch Opportunity
          </button>
        </div>
      </div>

      <p style={{ color: '#9BA7B8', fontSize: 13, marginBottom: '1.5rem' }}>
        Any verified business can offer skills or services free of charge to a venue in return for a structured JV revenue share. No cost to pitch.
      </p>

      {pitchResult && (
        <div style={{ background: '#0d2b1e', border: '1px solid #2BB8A5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 13, color: '#2BB8A5' }}>
          {pitchResult}
        </div>
      )}

      {showPitchForm && (
        <form onSubmit={submitPitch} style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: '1rem', color: '#C6A66B' }}>New Opportunity Pitch</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: 11, color: '#9BA7B8', display: 'block', marginBottom: 4 }}>Title *</label>
              <input required value={pitchForm.title} onChange={e => setPitchForm(v => ({ ...v, title: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', background: '#07090E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#f1f5f9', padding: '0.5rem 0.75rem', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9BA7B8', display: 'block', marginBottom: 4 }}>Type *</label>
              <select value={pitchForm.opportunity_type} onChange={e => setPitchForm(v => ({ ...v, opportunity_type: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', background: '#07090E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#f1f5f9', padding: '0.5rem 0.75rem', fontSize: 13 }}>
                <option value="guest_experience">Guest Experience</option>
                <option value="seasonal_activation">Seasonal Activation</option>
                <option value="fb_programme">F&B Programme</option>
                <option value="adventure">Adventure</option>
                <option value="community_partnership">Community Partnership</option>
                <option value="event_activation">Event Activation</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 11, color: '#9BA7B8', display: 'block', marginBottom: 4 }}>Description</label>
            <textarea value={pitchForm.description} onChange={e => setPitchForm(v => ({ ...v, description: e.target.value }))} rows={3}
              style={{ width: '100%', boxSizing: 'border-box', background: '#07090E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#f1f5f9', padding: '0.5rem 0.75rem', fontSize: 13, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 11, color: '#9BA7B8', display: 'block', marginBottom: 4 }}>District</label>
            <input value={pitchForm.district} onChange={e => setPitchForm(v => ({ ...v, district: e.target.value }))} placeholder="e.g. Underberg"
              style={{ width: 220, background: '#07090E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#f1f5f9', padding: '0.5rem 0.75rem', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={pitchLoading}
              style={{ background: '#C6A66B', color: '#07090E', border: 'none', borderRadius: 6, padding: '0.5rem 1.25rem', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {pitchLoading ? 'Submitting…' : 'Submit Pitch'}
            </button>
            <button type="button" onClick={() => setShowPitchForm(false)}
              style={{ background: 'transparent', color: '#9BA7B8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '0.5rem 1rem', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#9BA7B8', fontSize: 13, padding: '2rem' }}>Loading opportunities…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {opps.map((opp: OpportunityRow & Record<string, unknown>) => (
            <div key={opp.id} style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#f1f5f9' }}>{opp.title}</div>
                {opp.description && <div style={{ fontSize: 12, color: '#9BA7B8', marginBottom: 6, lineHeight: 1.4 }}>{String(opp.description)}</div>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <StatusPill status={opp.status} />
                  {opp.district && <span style={{ fontSize: 11, color: '#617089' }}>{String(opp.district)}</span>}
                  {opp.opportunity_type && <span style={{ fontSize: 11, color: '#617089' }}>{String(opp.opportunity_type).replace(/_/g, ' ')}</span>}
                  {!!(opp as Record<string, unknown>).jvActive && <span style={{ fontSize: 10, color: '#9B6DFF', background: 'rgba(155,109,255,0.12)', border: '1px solid rgba(155,109,255,0.3)', borderRadius: 4, padding: '1px 6px' }}>JV ACTIVE</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flex: 'none', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <ScoreBadge score={(opp as Record<string, unknown>).score as number | undefined} />
                {!!(opp as Record<string, unknown>).foc && <span style={{ fontSize: 10, color: '#2BB8A5', letterSpacing: 1 }}>FOC PITCH</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
