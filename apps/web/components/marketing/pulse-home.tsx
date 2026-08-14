'use client';
import { useState } from 'react';

/* ─── Colour tokens ─── */
const C = {
  bg: '#020912',
  panel: '#08111F',
  text: '#E6EDF5',
  muted: '#9BA7B8',
  dim: '#617089',
  line: 'rgba(255,255,255,0.08)',
  gold: '#C6A66B',
  teal: '#2BB8A5',
  purple: '#9B6DFF',
};

/* ─── Capability badge ─── */
function CapBadge({ label, state }: { label: string; state: 'live' | 'manual' | 'planned' }) {
  const cfg = {
    live:    { bg: 'rgba(43,184,165,0.12)', color: '#2BB8A5', border: 'rgba(43,184,165,0.3)',  text: 'Live' },
    manual:  { bg: 'rgba(198,166,107,0.12)', color: '#C6A66B', border: 'rgba(198,166,107,0.3)', text: 'Manual Evidence Only' },
    planned: { bg: 'rgba(97,112,137,0.12)',  color: '#9BA7B8', border: 'rgba(97,112,137,0.3)',  text: 'Planned' },
  }[state];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
        {cfg.text}
      </span>
    </div>
  );
}

/* ─── Pilot interest form ─── */
function PilotForm() {
  const [form, setForm] = useState({ name: '', organisation: '', role: '', email: '', phone: '', interest_type: 'general', message: '' });
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.organisation.trim() || !form.email.trim()) {
      setState('error'); setErrMsg('Name, organisation and email are required.'); return;
    }
    setState('saving');
    try {
      const res = await fetch('/api/pilot-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setState('error'); setErrMsg(data.error ?? 'Submission failed.'); return; }
      setState('done');
    } catch {
      setState('error'); setErrMsg('Network error. Please try again.');
    }
  }

  if (state === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <p style={{ color: C.teal, fontWeight: 600, marginBottom: 8 }}>Expression of interest received</p>
        <p style={{ color: C.muted, fontSize: 14 }}>We will be in touch to discuss the controlled pilot.</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: C.bg, border: `1px solid ${C.line}`,
    borderRadius: 8, padding: '10px 14px',
    color: C.text, fontSize: 14, fontFamily: 'inherit',
    outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '.12em',
    color: C.muted, marginBottom: 6,
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {state === 'error' && (
        <div style={{ padding: '10px 14px', background: 'rgba(212,93,93,0.1)', border: '1px solid rgba(212,93,93,0.3)', borderRadius: 8, color: '#D45D5D', fontSize: 13 }}>
          {errMsg}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" required />
        </div>
        <div>
          <label style={labelStyle}>Organisation *</label>
          <input style={inputStyle} value={form.organisation} onChange={e => set('organisation', e.target.value)} placeholder="Your organisation" required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Role</label>
          <input style={inputStyle} value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. CEO, Manager" />
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+27 …" />
        </div>
        <div>
          <label style={labelStyle}>Interest Type</label>
          <select aria-label="Interest Type" style={{ ...inputStyle, cursor: 'pointer' }} value={form.interest_type} onChange={e => set('interest_type', e.target.value)}>
            <option value="general">General Interest</option>
            <option value="hospitality">Hospitality Operator</option>
            <option value="destination">Destination / Tourism Board</option>
            <option value="business">Business / SME</option>
            <option value="university">University / Research</option>
            <option value="investor">Investor / JV Partner</option>
            <option value="government">Government / Community</option>
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Message (optional)</label>
        <textarea style={{ ...inputStyle, resize: 'none', minHeight: 80 }} value={form.message} onChange={e => set('message', e.target.value)}
          placeholder="Tell us about your context and what you're hoping to achieve…" />
      </div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
        By submitting, you consent to PULSE OS storing your enquiry details for the purpose of responding to your pilot interest.
        Your data is not shared with third parties. This is not a subscription or binding commitment.
      </div>
      <button type="submit" disabled={state === 'saving'}
        style={{ padding: '13px 28px', background: `linear-gradient(135deg,#D4B87A,${C.gold})`, color: C.bg, border: 'none', borderRadius: 44, fontWeight: 700, fontSize: 15, cursor: state === 'saving' ? 'not-allowed' : 'pointer', opacity: state === 'saving' ? 0.7 : 1 }}>
        {state === 'saving' ? 'Submitting…' : 'Express Interest in the Pilot →'}
      </button>
    </form>
  );
}

/* ─── Workflow step ─── */
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${C.gold}22`, border: `1px solid ${C.gold}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13, color: C.gold }}>
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─── Audience card ─── */
function AudienceCard({ icon, who, points }: { icon: string; who: string; points: string[] }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '24px 28px' }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 12, fontSize: 15 }}>{who}</div>
      <ul style={{ margin: 0, padding: '0 0 0 16px', color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
        {points.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ children, style, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  return (
    <section id={id} style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px', ...style }}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: C.gold, fontWeight: 600, marginBottom: 16 }}>{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 32, fontWeight: 700, color: C.text, margin: '0 0 16px', lineHeight: 1.2 }}>{children}</h2>;
}

/* ════════════════════════════════════════════════════════════════ */
export function PulseHome() {
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: `${C.bg}e8`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, background: C.bg, borderRadius: '50%' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.15em', color: C.text }}>PULSE</div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: '.2em' }}>OPPORTUNITY OS</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="#pilot" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Request Pilot Access</a>
          <a href="/login" style={{ fontSize: 13, fontWeight: 600, padding: '7px 20px', background: `${C.gold}22`, color: C.gold, border: `1px solid ${C.gold}44`, borderRadius: 999, textDecoration: 'none' }}>
            Owner Login →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ paddingTop: 120, paddingBottom: 80, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: C.gold, fontWeight: 600, marginBottom: 24 }}>
          Controlled Pilot · Southern Drakensberg
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 24px', color: C.text }}>
          The Intelligence Layer Connecting Hospitality, Destinations and Opportunity
        </h1>
        <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.7, margin: '0 0 40px', maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          PULSE OS helps businesses, destinations and institutions identify which opportunities are worth participating in using verified evidence, explainable viability intelligence and measurable participation outcomes.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#pilot" style={{ padding: '13px 28px', background: `linear-gradient(135deg,#D4B87A,${C.gold})`, color: C.bg, border: 'none', borderRadius: 44, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
            Apply for Pilot Access →
          </a>
          <a href="#workflow" style={{ padding: '13px 28px', background: 'transparent', color: C.text, border: `1px solid ${C.line}`, borderRadius: 44, fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
            How It Works
          </a>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.line}` }} />

      {/* What PULSE OS Is */}
      <Section>
        <Eyebrow>What PULSE OS Is</Eyebrow>
        <H2>An Opportunity Intelligence Network</H2>
        <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.8, maxWidth: 680, marginBottom: 32 }}>
          PULSE OS is not a booking marketplace, an OTA, a business directory or a static dashboard.
          It is an intelligence platform whose core decision is:
        </p>
        <div style={{ background: C.panel, border: `1px solid ${C.gold}33`, borderLeft: `3px solid ${C.gold}`, borderRadius: '0 12px 12px 0', padding: '20px 28px', marginBottom: 32 }}>
          <p style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.6 }}>
            "Should this business or organisation participate in this opportunity, under what conditions, and what verified outcome followed?"
          </p>
        </div>
        <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.8, maxWidth: 680 }}>
          The proprietary long-term data asset is the <strong style={{ color: C.text }}>Verified Opportunity Participation Graph</strong>:
          a traceable relationship between an opportunity, a participating organisation, evidence, viability assessment, decision, milestones and measured outcomes.
        </p>
      </Section>

      <div style={{ borderTop: `1px solid ${C.line}` }} />

      {/* The Problem */}
      <Section style={{ background: `${C.panel}66` }}>
        <Eyebrow>The Problem</Eyebrow>
        <H2>Opportunities Are Missed or Wasted</H2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {[
            ['Unverified claims', 'Businesses self-report readiness. Destinations accept claims at face value. Evidence is weak or absent.'],
            ['Opaque decisions', 'Participation decisions are made without explainable scoring. No audit trail. No accountability.'],
            ['Unmeasured outcomes', 'Outcomes are rarely captured, rarely evidence-confirmed, and never traceable back to the original opportunity.'],
            ['Disconnected systems', 'Hospitality operations, business intelligence, opportunity management and outcomes live in separate tools — or nowhere.'],
          ].map(([title, desc]) => (
            <div key={title as string} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ borderTop: `1px solid ${C.line}` }} />

      {/* Workflow */}
      <Section id="workflow">
        <Eyebrow>How It Works</Eyebrow>
        <H2>The Opportunity → Outcome Workflow</H2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
          <Step n={1} title="Business Connect + Evidence" desc="A business creates a profile. Evidence is captured with provenance: self-entered, place-matched, contact-confirmed, evidence-submitted, human-reviewed. No claim is accepted as verified without a matching evidence state." />
          <Step n={2} title="Opportunity Engine" desc="A venue owner or destination partner creates an opportunity. Types include seasonal activations, district campaigns, hotel partnerships, JV proposals, university collaborations and investment programmes." />
          <Step n={3} title="Explainable Viability Assessment" desc="A deterministic rules engine scores business readiness against the opportunity. Every weight, input and evidence item is disclosed. If evidence is self-entered, confidence stays Low regardless of score. No AI model required." />
          <Step n={4} title="Participation Decision + JV Tracking" desc="A participant records their decision — Join, Join with Conditions, Hold or Not Suitable — with role, contribution, conditions and milestones. A lightweight JV tracking record captures the arrangement. No automated legal contracting." />
          <Step n={5} title="Outcomes + Verified Participation Graph" desc="Milestones are completed. Outcomes are recorded as Self-reported or Evidence-confirmed. The Participation Graph shows the full relationship chain derived from persisted database records. Verified outcomes create the dataset for future recommendation improvements." />
        </div>
      </Section>

      <div style={{ borderTop: `1px solid ${C.line}` }} />

      {/* Audience */}
      <Section>
        <Eyebrow>Who It Serves</Eyebrow>
        <H2>Five Participant Types</H2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          <AudienceCard icon="🏡" who="Hospitality Operators" points={['Manage properties, units, rates, reservations, housekeeping and maintenance', 'Connect operations to opportunity intelligence', 'Build an evidence-backed business profile']} />
          <AudienceCard icon="🗺️" who="Destinations & Tourism Boards" points={['Create and publish district opportunities', 'Match businesses with verified evidence to relevant activations', 'Track participation and measure outcomes by region']} />
          <AudienceCard icon="🎓" who="Universities & Research Partners" points={['Create research collaboration opportunities', 'Capture evidence-based participation agreements', 'Measure and report on community outcomes']} />
          <AudienceCard icon="💼" who="Investors & JV Partners" points={['Find evidence-backed participation candidates', 'Track conditions and milestones with an audit trail', 'Access outcome data as the verified dataset develops']} />
          <AudienceCard icon="🏛️" who="Communities & Government" points={['Create inclusive economic programme opportunities', 'Match local businesses to relevant support', 'Report on participation and evidence-confirmed outcomes']} />
        </div>
      </Section>

      <div style={{ borderTop: `1px solid ${C.line}` }} />

      {/* Capability Register */}
      <Section style={{ background: `${C.panel}66` }}>
        <Eyebrow>Capability Register</Eyebrow>
        <H2>What Is Live in This Pilot</H2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>
          This is an honest capability register. Live means the feature works end-to-end in production.
          Manual Evidence Only means the feature functions but relies on human-entered data.
          Planned means the feature is scoped but not yet built.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 32 }}>
          <div>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 16, fontSize: 15 }}>Platform</div>
            <CapBadge label="Multi-tenant authentication" state="live" />
            <CapBadge label="Org context and role management" state="live" />
            <CapBadge label="System status panel" state="live" />
            <CapBadge label="Reports: HTML/print exports" state="live" />
            <CapBadge label="Email invitations (external)" state="planned" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 16, fontSize: 15 }}>Hospitality OS</div>
            <CapBadge label="Property management" state="live" />
            <CapBadge label="Units and rate plans" state="live" />
            <CapBadge label="Reservations with overlap protection" state="live" />
            <CapBadge label="Housekeeping task management" state="live" />
            <CapBadge label="Maintenance issue tracking" state="live" />
            <CapBadge label="OTA / channel integration" state="planned" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 16, fontSize: 15 }}>PULSE Core</div>
            <CapBadge label="Business profiles + evidence states" state="live" />
            <CapBadge label="Opportunity creation and management" state="live" />
            <CapBadge label="Explainable viability engine (rules-based-v1)" state="live" />
            <CapBadge label="Participation and JV tracking" state="live" />
            <CapBadge label="Milestones and outcome recording" state="live" />
            <CapBadge label="Participation Graph (database-derived)" state="live" />
            <CapBadge label="Google ownership verification" state="manual" />
            <CapBadge label="External AI model enhancement" state="planned" />
          </div>
        </div>
      </Section>

      <div style={{ borderTop: `1px solid ${C.line}` }} />

      {/* Pilot Interest Form */}
      <Section id="pilot">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Eyebrow>Controlled Lighthouse Pilot</Eyebrow>
          <H2>Apply for Pilot Access</H2>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            The initial pilot is a controlled deployment with a small number of founding participants.
            We are not running a mass-market sign-up. Submit your interest below and we will be in touch
            to discuss whether PULSE OS is a fit for your context.
          </p>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '36px 40px' }}>
            <PilotForm />
          </div>
          <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            This form does not create an account or commit you to anything.
            Submissions are reviewed manually. No automated marketing follows.
          </p>
        </div>
      </Section>

      <div style={{ borderTop: `1px solid ${C.line}` }} />

      {/* Notices */}
      <Section style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Evidence & AI Disclaimer', 'Viability scores are produced by a deterministic rules engine (rules-based-v1). They are not financial advice. Scores reflect the quality of evidence provided — self-entered data produces a Low confidence band regardless of score. No economic outcomes, revenue forecasts or investment returns are guaranteed or implied. Verified outcomes create the governed dataset required to improve future recommendation logic.'],
            ['Privacy Notice', 'PULSE OS stores pilot interest submissions and platform data in a Supabase Postgres database under RLS-enforced tenant isolation. Data is not shared with third parties. Pilot participants control their own organisational data. Contact woodroffe.ventures@gmail.com for data enquiries.'],
            ['Acceptable Use', 'PULSE OS is a controlled pilot platform. Access is by invitation. Users must not upload personal guest data, fabricate evidence, or misrepresent their organisation\'s readiness.'],
            ['Legal Templates Notice', 'Participation and JV tracking records produced by PULSE OS are not legal agreements unless a signed executed agreement has been separately uploaded and verified. All notices on this page are templates subject to review by qualified legal counsel before reliance.'],
          ].map(([title, body]) => (
            <details key={title as string} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10 }}>
              <summary style={{ padding: '14px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: C.muted }}>{title}</summary>
              <div style={{ padding: '0 20px 16px', fontSize: 12, color: C.muted, lineHeight: 1.8 }}>{body}</div>
            </details>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 22, height: 22, background: C.gold, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: C.bg, borderRadius: '50%' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.15em', color: C.text }}>PULSE OS</span>
          <span style={{ fontSize: 11, color: C.muted, letterSpacing: '.12em' }}>OPPORTUNITY OS</span>
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px' }}>
          Farmstead Hospitality · Southern Drakensberg · Controlled Pilot · 2025–2026
        </p>
        <a href="/login" style={{ fontSize: 13, color: C.gold, textDecoration: 'none', fontWeight: 600 }}>
          Owner Login →
        </a>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 24 }}>
          © Woodroffe Ventures. All pilot data under RLS tenant isolation. No fabricated metrics.
        </p>
      </footer>

    </div>
  );
}
