'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ════════════════════════════════════════════════════════════════
   PULSE OS — Public Homepage (DEC-015)
   The Intelligence Layer Connecting Hospitality, Destinations and Opportunity.
   Seven executive intelligence lenses. Self-contained. No backend.
   ════════════════════════════════════════════════════════════════ */

type LensId =
  | 'network' | 'intelligence' | 'opportunities'
  | 'destinations' | 'platform' | 'farmstead' | 'impact';

const LENSES: { id: LensId; label: string; tag: string }[] = [
  { id: 'network', label: 'Network', tag: 'The Ecosystem' },
  { id: 'intelligence', label: 'Intelligence', tag: 'The Engine' },
  { id: 'opportunities', label: 'Opportunities', tag: 'The Commercial Moat' },
  { id: 'destinations', label: 'Destinations', tag: 'Destination OS' },
  { id: 'platform', label: 'Platform', tag: 'The Architecture' },
  { id: 'farmstead', label: 'Farmstead Live', tag: 'Proof · Tenant #001' },
  { id: 'impact', label: 'Economic Impact', tag: 'The Outcome' },
];

const APP = 'pulse-os-v2.html';

/* ── animated counter ── */
function Stat({ value, prefix = '', suffix = '', label, dec = 0 }: {
  value: number; prefix?: string; suffix?: string; label: string; dec?: number;
}) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let raf = 0; const dur = 1300; const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(value * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const shown = dec ? v.toFixed(dec) : Math.round(v).toLocaleString();
  return (
    <div className="ph-stat" ref={ref}>
      <div className="ph-stat-v">{prefix}{shown}{suffix}</div>
      <div className="ph-stat-k">{label}</div>
    </div>
  );
}

/* ── brand mark (institutional SVG approximation of the PULSE logo) ── */
function Mark({ size = 64 }: { size?: number }) {
  return (
    <svg className="ph-mark" width={size} height={size} viewBox="0 0 100 100" aria-label="PULSE OS">
      <defs>
        <linearGradient id="phGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0DEA6" /><stop offset="1" stopColor="#B0894B" />
        </linearGradient>
      </defs>
      {/* tri-tone ring */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="#2BB8A5" strokeWidth="3"
        strokeDasharray="92 184" strokeLinecap="round" transform="rotate(-130 50 50)" opacity="0.9" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#phGold)" strokeWidth="3"
        strokeDasharray="120 156" strokeLinecap="round" transform="rotate(-20 50 50)" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#9B6DFF" strokeWidth="3"
        strokeDasharray="60 216" strokeLinecap="round" transform="rotate(110 50 50)" opacity="0.9" />
      {/* P + pulse glyph */}
      <path d="M37 28 H54 a13 13 0 0 1 0 26 H44 V72 H37 Z" fill="none" stroke="url(#phGold)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M44 44 h6 l3 -9 5 18 4 -11 h6" fill="none" stroke="url(#phGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ════════════════ NETWORK CANVAS ════════════════ */
function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0, t0 = performance.now();
    const LABELS = ['Hotels', 'Guest Houses', 'Restaurants', 'Experiences', 'Activities', 'Events',
      'Guides', 'Transport', 'Local Business', 'Communities', 'Tourism Boards', 'Economic Agencies',
      'Google Profiles', 'Guests', 'Partners', 'Suppliers'];
    type N = { x: number; y: number; r: number; core: boolean; label: string; ph: number; bx: number; by: number };
    let nodes: N[] = [], edges: number[][] = [], pulses: { e: number[]; t: number; sp: number }[] = [];
    let safe = { x: 0, y: 0, rx: 0, ry: 0 };
    const inSafe = (x: number, y: number) => {
      const dx = (x - safe.x) / (safe.rx || 1), dy = (y - safe.y) / (safe.ry || 1);
      return dx * dx + dy * dy < 1;
    };
    const spawn = () => {
      const e = edges[(Math.random() * edges.length) | 0];
      return { e, t: Math.random(), sp: 0.0014 + Math.random() * 0.002 };
    };
    const layout = () => {
      const cx = W / 2, cy = H / 2;
      safe = { x: cx, y: cy, rx: Math.min(W * 0.22, 150), ry: Math.min(H * 0.20, 130) };
      const sx = W * (W < 700 ? 0.42 : 0.46), sy = H * 0.42;
      nodes = [{ x: cx, y: cy, r: 8, core: true, label: '', ph: 0, bx: cx, by: cy }];
      for (let i = 0; i < LABELS.length; i++) {
        const a = (i / LABELS.length) * Math.PI * 2 - Math.PI / 2;
        const ring = 0.74 + (i % 3) * 0.12;
        const x = cx + Math.cos(a) * sx * ring, y = cy + Math.sin(a) * sy * ring;
        nodes.push({ x, y, r: W < 700 ? 2.4 : 3.4, core: false, label: LABELS[i], ph: Math.random() * 6.28, bx: x, by: y });
      }
      edges = [];
      for (let n = 1; n < nodes.length; n++) { edges.push([0, n]); edges.push([n, 1 + (n % (nodes.length - 1))]); }
      pulses = []; for (let p = 0; p < 12; p++) pulses.push(spawn());
    };
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      layout();
    };
    const draw = (now: number) => {
      const dt = now - t0; t0 = now;
      ctx.clearRect(0, 0, W, H);
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i]; n.ph += 0.0005 * dt;
        n.x = n.bx + Math.cos(n.ph) * 5; n.y = n.by + Math.sin(n.ph * 0.9) * 5;
      }
      for (const e of edges) {
        const A = nodes[e[0]], B = nodes[e[1]];
        const g = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
        g.addColorStop(0, 'rgba(176,141,87,0.14)'); g.addColorStop(1, 'rgba(155,109,255,0.05)');
        ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      for (let p = 0; p < pulses.length; p++) {
        const pu = pulses[p]; pu.t += pu.sp * dt;
        if (pu.t >= 1) { pulses[p] = spawn(); continue; }
        const A = nodes[pu.e[0]], B = nodes[pu.e[1]];
        const x = A.x + (B.x - A.x) * pu.t, y = A.y + (B.y - A.y) * pu.t;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.28);
        ctx.fillStyle = 'rgba(43,184,165,0.9)'; ctx.shadowColor = 'rgba(43,184,165,0.9)'; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
      }
      for (const no of nodes) {
        if (no.core) {
          const pr = 8 + Math.sin(now * 0.002) * 1.6;
          ctx.beginPath(); ctx.arc(no.x, no.y, pr + 12, 0, 6.28); ctx.fillStyle = 'rgba(232,217,168,0.06)'; ctx.fill();
          ctx.beginPath(); ctx.arc(no.x, no.y, pr, 0, 6.28);
          ctx.fillStyle = 'rgba(232,217,168,0.95)'; ctx.shadowColor = 'rgba(232,217,168,0.8)'; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0;
        } else {
          const dim = inSafe(no.x, no.y);
          ctx.beginPath(); ctx.arc(no.x, no.y, no.r, 0, 6.28);
          ctx.fillStyle = dim ? 'rgba(230,237,245,0.25)' : 'rgba(230,237,245,0.82)';
          ctx.shadowColor = 'rgba(176,141,87,0.7)'; ctx.shadowBlur = dim ? 0 : 9; ctx.fill(); ctx.shadowBlur = 0;
          if (W > 760 && !dim) {
            const lx = no.x + (no.x < W / 2 ? -11 : 11);
            if (!inSafe(lx, no.y)) {
              ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = 'rgba(154,164,178,0.72)';
              ctx.textAlign = no.x < W / 2 ? 'right' : 'left'; ctx.textBaseline = 'middle';
              ctx.fillText(no.label, lx, no.y);
            }
          }
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    if (reduce) draw(performance.now()); else raf = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="ph-net-canvas" aria-hidden="true" />;
}

/* ════════════════ LENS CONTENT ════════════════ */
function LensContent({ lens }: { lens: LensId }) {
  if (lens === 'network') {
    return (
      <div className="ph-net">
        <NetworkCanvas />
        <div className="ph-net-mask" />
        <div className="ph-net-copy">
          <div className="ph-eyebrow">The Ecosystem</div>
          <h3>Everything in a destination is connected.<br />PULSE is what connects it.</h3>
          <p>Hotels, guest houses, restaurants, experiences, guides, transport, local businesses,
            communities, tourism boards and economic agencies — a living economic graph, with
            verified participation at its centre.</p>
        </div>
      </div>
    );
  }
  if (lens === 'intelligence') {
    const signals = ['Reviews', 'Maps Visibility', 'Website Strength', 'Social Reach', 'Guest Sentiment',
      'Business Readiness', 'Demand Signals', 'Event Signals', 'Seasonality', 'Opportunity Signals'];
    const pipe = ['Signal', 'Analysis', 'Recommendation', 'Outcome'];
    return (
      <div className="ph-grid-2">
        <div>
          <div className="ph-eyebrow">The Engine</div>
          <h3>Raw signals become governed intelligence.</h3>
          <p className="ph-lede">PULSE ingests fragmented signals from across the ecosystem and turns
            them into evidence-led recommendations — every one traceable, confidence-scored and
            approval-gated. AI assists. Humans govern. Evidence decides.</p>
          <div className="ph-pipe">
            {pipe.map((s, i) => (
              <span key={s} className="ph-pipe-step">
                <span className="ph-pipe-node">{s}</span>
                {i < pipe.length - 1 && <span className="ph-pipe-arr">→</span>}
              </span>
            ))}
          </div>
        </div>
        <div className="ph-signals">
          {signals.map((s) => <span key={s} className="ph-signal"><span className="ph-sig-dot" />{s}</span>)}
        </div>
      </div>
    );
  }
  if (lens === 'opportunities') {
    const cards = [
      { type: 'Tourism Package · JV', title: 'Sani Pass winter escape bundle', by: 'Verified tour operator → 3 properties', score: 92, roi: '+R6,400 / booking', verdict: 'High Potential', status: 'Matched', sc: 'st-matched' },
      { type: 'JV · Property Activation', title: 'Glamping on underused farm land', by: 'Property owner → operator + capital', score: 87, roi: 'R780k / yr', verdict: 'Validate Readiness', status: 'Open for Partners', sc: 'st-open' },
      { type: 'Destination Campaign', title: 'Regional shoulder-season activation', by: 'Tourism board → SMEs + 12 properties', score: 78, roi: 'R22k+ gap nights', verdict: 'Needs Partners', status: 'Under Review', sc: 'st-review' },
    ];
    return (
      <div>
        <div className="ph-eyebrow">The Commercial Moat</div>
        <h3>Should this business participate in this opportunity?</h3>
        <p className="ph-lede ph-center">An executive opportunity command centre — events, seasonal demand,
          partnerships, campaigns and JVs, each scored for viability, ROI, trust, readiness and recommended
          participants. Every output is draft-first, with a full evidence trail.</p>
        <div className="ph-opx">
          {cards.map((c) => (
            <div key={c.title} className="ph-opx-card">
              <div className="ph-opx-head">
                <div>
                  <div className="ph-opx-type">{c.type}</div>
                  <div className="ph-opx-title">{c.title}</div>
                  <div className="ph-opx-by">{c.by}</div>
                </div>
                <div className="ph-opx-score"><div className="sv">{c.score}</div><div className="sl">Score</div></div>
              </div>
              <div className="ph-opx-meta">
                <div><span className="k">Expected ROI</span><span className="v">{c.roi}</span></div>
                <div><span className="k">Verdict</span><span className="v">{c.verdict}</span></div>
              </div>
              <div className="ph-opx-foot"><span className={`ph-opx-status ${c.sc}`}>{c.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (lens === 'destinations') {
    const panels = [
      { k: 'Visitor Nights (30d)', v: '2,847', s: '↑ 12% vs prior', c: 'gold' },
      { k: 'Avg Spend / Visitor', v: 'R1,240', s: '73% beyond the room', c: '' },
      { k: 'Destination NPS', v: '+47', s: 'strong promoters', c: 'teal' },
      { k: 'Verified Trust Coverage', v: '31%', s: '23 vendors pending', c: '' },
      { k: 'Opportunity Clusters', v: '6', s: 'Sani · Winter · Trails', c: 'gold' },
      { k: 'Economic Participation', v: '184', s: 'livelihoods · 30d', c: 'purple' },
    ];
    return (
      <div>
        <div className="ph-eyebrow">Destination Operating System</div>
        <h3>What a tourism board has never been able to see.</h3>
        <p className="ph-lede ph-center">Regions, districts and tourism corridors as a living command surface —
          visitor movement, search demand, business participation and activation performance in one place.
          <span className="ph-tag-inline">Phase 5 Preview · illustrative</span></p>
        <div className="ph-cmd">
          {panels.map((p) => (
            <div key={p.k} className="ph-cmd-panel">
              <div className="ph-cmd-k">{p.k}</div>
              <div className={`ph-cmd-v ${p.c}`}>{p.v}</div>
              <div className="ph-cmd-s">{p.s}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (lens === 'platform') {
    const cols: { h: string; items: string[] }[] = [
      { h: 'Intelligence Engines', items: ['Opportunity Engine', 'Verification Engine', 'Viability Engine', 'Participation Graph', 'Review Intelligence', 'Growth Intelligence'] },
      { h: 'Command & Reporting', items: ['Executive Command Centre', 'Destination Intelligence', 'Economic Intelligence', 'Stakeholder Intelligence', 'Reporting Layer', 'AI Agents'] },
      { h: 'Integrations', items: ['Google Business Profile', 'QuickBooks', 'WhatsApp', 'Booking Platforms', 'Review Platforms', 'Social Platforms'] },
    ];
    return (
      <div>
        <div className="ph-eyebrow">The Architecture</div>
        <h3>This is much larger than hospitality.</h3>
        <p className="ph-lede ph-center">An operating layer, not an app — engines, command surfaces, a
          participation graph and an integration fabric that compound as participants join.</p>
        <div className="ph-platform">
          {cols.map((col) => (
            <div key={col.h} className="ph-plat-col">
              <div className="ph-plat-h">{col.h}</div>
              {col.items.map((it) => <div key={it} className="ph-plat-item"><span className="ph-plat-dot" />{it}</div>)}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (lens === 'farmstead') {
    const props = ["Woody's Cottage", 'Swallows Nest Studio', 'Jackals Rest', 'Meadows Cottage'];
    const live = [
      { k: 'Property Readiness', v: '92%', href: `${APP}#page-properties` },
      { k: 'Review Intelligence', v: '4.8★', href: `${APP}#page-reviews` },
      { k: 'Trust-Scored Vendors', v: '91', href: `${APP}#page-trust` },
      { k: 'Revenue Gap Found', v: 'R4,500', href: `${APP}#page-revenue` },
    ];
    return (
      <div>
        <div className="ph-eyebrow">Proof · Tenant #001 · Live</div>
        <h3>Not a concept. Running today.</h3>
        <p className="ph-lede ph-center">Farmstead Hospitality — four properties on JoyWood Farm — is the first
          live production deployment. {props.join(' · ')}.</p>
        <div className="ph-farm">
          {live.map((l) => (
            <a key={l.k} className="ph-farm-card" href={l.href}>
              <div className="ph-farm-v">{l.v}</div>
              <div className="ph-farm-k">{l.k}</div>
              <div className="ph-farm-go">Open live →</div>
            </a>
          ))}
        </div>
        <div className="ph-center" style={{ marginTop: 28 }}>
          <a className="ph-btn ph-btn-gold" href={`${APP}#page-morning`}>Enter Farmstead Live →</a>
        </div>
      </div>
    );
  }
  // impact
  const impact = [
    { v: 9, suffix: '', label: 'Opportunities Activated' },
    { v: 184, suffix: '', label: 'Local Businesses Supported' },
    { v: 312000, prefix: 'R', label: 'Revenue Generated' },
    { v: 1240000, prefix: 'R', label: 'Guest Spend Influenced' },
    { v: 47, suffix: '', label: 'Jobs Supported' },
    { v: 2100000, prefix: 'R', label: 'Economic Value Created' },
  ];
  return (
    <div>
      <div className="ph-eyebrow">The Outcome</div>
      <h3>From one stay to an economic participation graph.</h3>
      <p className="ph-lede ph-center">The story for investors, tourism boards, municipalities and governments:
        verified signals translated into measurable economic outcomes across a destination.</p>
      <div className="ph-impact">
        {impact.map((m) => (
          <Stat key={m.label} value={m.v} prefix={m.prefix} suffix={m.suffix} label={m.label} />
        ))}
      </div>
      <p className="ph-lede ph-center" style={{ marginTop: 30, color: '#5C6677', fontSize: 13 }}>
        Illustrative pilot figures from the Farmstead live environment and modelled district impact.
      </p>
    </div>
  );
}

/* ════════════════ PAGE ════════════════ */
export function PulseHome() {
  const [lens, setLens] = useState<LensId>('network');
  const active = LENSES.find((l) => l.id === lens)!;
  const go = useCallback((id: LensId) => setLens(id), []);

  return (
    <div className="ph-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className="ph-nav">
        <div className="ph-brand"><Mark size={30} /><span className="ph-word">PULSE OS</span></div>
        <div className="ph-nav-links">
          {LENSES.slice(0, 6).map((l) => (
            <button key={l.id} className={`ph-navlink ${lens === l.id ? 'on' : ''}`} onClick={() => go(l.id)}>{l.label}</button>
          ))}
        </div>
        <a className="ph-btn ph-btn-gold ph-btn-sm" href={`${APP}#page-trial`}>Request Access</a>
      </nav>

      {/* HERO */}
      <header className="ph-hero">
        <div className="ph-hero-glow" />
        <Mark size={92} />
        <div className="ph-eyebrow" style={{ marginTop: 22 }}>Hospitality · Destinations · Opportunity</div>
        <h1 className="ph-h1">The Intelligence Layer Connecting<br /><span className="ph-h1-accent">Hospitality, Destinations &amp; Opportunity.</span></h1>
        <p className="ph-hero-sub">Transforming verified signals into measurable economic outcomes.</p>
        <div className="ph-hero-ctas">
          <button className="ph-btn ph-btn-gold" onClick={() => go('opportunities')}>Explore the Opportunity Engine</button>
          <button className="ph-btn ph-btn-line" onClick={() => go('network')}>See the Network</button>
        </div>
        <div className="ph-metrics">
          <Stat value={1240} label="Verified Businesses" />
          <Stat value={386} label="Opportunities Identified" />
          <Stat value={73} suffix="%" label="Participation Rate" />
          <Stat value={2.1} prefix="R" suffix="M" dec={1} label="Economic Value Activated" />
          <Stat value={6} label="Destinations Covered" />
          <Stat value={94} suffix="%" label="Confidence Score" />
          <Stat value={1820} label="Next-Best Actions" />
        </div>
      </header>

      {/* LENS SWITCHER */}
      <section className="ph-lenses-wrap" id="lenses">
        <div className="ph-lenses">
          {LENSES.map((l, i) => (
            <button key={l.id} className={`ph-lens ${lens === l.id ? 'on' : ''}`} onClick={() => go(l.id)}>
              <span className="ph-lens-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="ph-lens-l">{l.label}</span>
              <span className="ph-lens-t">{l.tag}</span>
            </button>
          ))}
        </div>
      </section>

      {/* LENS CONTENT */}
      <section className="ph-stage">
        <div className="ph-stage-head">
          <span className="ph-stage-tag">{active.tag}</span>
          <span className="ph-stage-name">{active.label} Intelligence</span>
        </div>
        <div className="ph-stage-body" key={lens}>
          <LensContent lens={lens} />
        </div>
      </section>

      {/* CTA */}
      <section className="ph-final">
        <h2 className="ph-final-h">Run Better. Discover More. Grow Together.</h2>
        <p className="ph-final-sub">A new operating layer for destinations, experiences and opportunity —
          proven live, built to scale from one property to entire economies.</p>
        <div className="ph-hero-ctas">
          <a className="ph-btn ph-btn-gold" href={`${APP}#page-trial`}>Request Access</a>
          <a className="ph-btn ph-btn-line" href={`${APP}#page-morning`}>Enter Farmstead Live</a>
        </div>
        <div className="ph-doctrine">AI ASSISTS · HUMANS GOVERN · EVIDENCE DECIDES · TRUST IS EARNED</div>
      </section>
    </div>
  );
}

/* ════════════════ SCOPED CSS ════════════════ */
const CSS = `
.ph-root{--bg:#020912;--surface:#08111f;--surface2:#0c1728;--line:rgba(255,255,255,0.09);
  --gold:#C6A66B;--gold-l:#E8D9A8;--teal:#2BB8A5;--purple:#9B6DFF;--text:#E6EDF5;--muted:#9AA4B2;--dim:#5C6677;
  background:var(--bg);color:var(--text);min-height:100vh;
  font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;}
.ph-root *{box-sizing:border-box;}
.ph-mark{display:block;}
.ph-eyebrow{font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);font-weight:600;}
.ph-btn{display:inline-flex;align-items:center;gap:9px;border-radius:44px;font-weight:600;letter-spacing:.03em;
  cursor:pointer;font-size:15px;padding:15px 30px;border:1px solid transparent;text-decoration:none;transition:transform .2s,box-shadow .2s,border-color .2s,color .2s;font-family:inherit;}
.ph-btn-sm{padding:9px 18px;font-size:13px;}
.ph-btn-gold{background:linear-gradient(135deg,var(--gold-l),var(--gold));color:#020912;}
.ph-btn-gold:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(232,217,168,.32);}
.ph-btn-line{background:transparent;color:var(--text);border-color:var(--line);}
.ph-btn-line:hover{border-color:var(--gold);color:var(--gold);transform:translateY(-2px);}

/* nav */
.ph-nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;
  padding:14px clamp(18px,5vw,56px);background:rgba(2,9,18,.78);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);}
.ph-brand{display:flex;align-items:center;gap:11px;}
.ph-word{font-weight:700;letter-spacing:.2em;font-size:15px;}
.ph-nav-links{display:flex;gap:6px;}
.ph-navlink{background:none;border:none;color:var(--muted);font-size:13px;letter-spacing:.03em;cursor:pointer;
  padding:7px 12px;border-radius:8px;font-family:inherit;transition:color .2s,background .2s;}
.ph-navlink:hover{color:var(--text);}
.ph-navlink.on{color:var(--gold);background:rgba(198,166,107,.1);}
@media(max-width:900px){.ph-nav-links{display:none;}}

/* hero */
.ph-hero{position:relative;text-align:center;padding:clamp(60px,11vh,120px) 24px 60px;display:flex;flex-direction:column;align-items:center;overflow:hidden;}
.ph-hero-glow{position:absolute;top:-10%;left:50%;width:900px;height:700px;max-width:140vw;transform:translateX(-50%);
  background:radial-gradient(45% 50% at 50% 30%,rgba(198,166,107,.12),transparent 60%),
  radial-gradient(40% 45% at 30% 50%,rgba(43,184,165,.10),transparent 60%),
  radial-gradient(40% 45% at 70% 55%,rgba(155,109,255,.10),transparent 60%);pointer-events:none;}
.ph-hero>*{position:relative;z-index:2;}
.ph-h1{font-size:clamp(30px,5.2vw,62px);font-weight:300;letter-spacing:-.02em;line-height:1.08;margin:22px 0 0;max-width:1000px;}
.ph-h1-accent{background:linear-gradient(135deg,var(--gold-l),var(--gold));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-weight:500;}
.ph-hero-sub{font-size:clamp(15px,2vw,20px);color:var(--muted);margin:24px 0 36px;max-width:640px;font-weight:300;}
.ph-hero-ctas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;}
.ph-metrics{display:grid;grid-template-columns:repeat(7,1fr);gap:14px;margin-top:56px;width:100%;max-width:1200px;
  border-top:1px solid var(--line);padding-top:34px;}
.ph-stat-v{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:clamp(18px,2vw,26px);color:var(--gold-l);font-weight:600;}
.ph-stat-k{font-size:10.5px;letter-spacing:.08em;color:var(--muted);margin-top:6px;line-height:1.35;}
@media(max-width:900px){.ph-metrics{grid-template-columns:repeat(2,1fr);gap:20px 14px;}}

/* lens switcher */
.ph-lenses-wrap{padding:0 clamp(18px,5vw,56px);}
.ph-lenses{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;max-width:1280px;margin:0 auto;}
.ph-lens{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px 14px;
  cursor:pointer;font-family:inherit;color:var(--text);transition:transform .25s,border-color .25s,background .25s,box-shadow .25s;display:flex;flex-direction:column;gap:5px;}
.ph-lens:hover{transform:translateY(-3px);border-color:rgba(198,166,107,.4);}
.ph-lens.on{background:linear-gradient(160deg,rgba(198,166,107,.14),rgba(8,17,31,.9));border-color:rgba(232,217,168,.5);box-shadow:0 16px 44px rgba(0,0,0,.4);}
.ph-lens-n{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim);}
.ph-lens.on .ph-lens-n{color:var(--gold);}
.ph-lens-l{font-size:14.5px;font-weight:600;}
.ph-lens-t{font-size:10.5px;color:var(--muted);letter-spacing:.04em;}
@media(max-width:1000px){.ph-lenses{grid-template-columns:repeat(3,1fr);}}
@media(max-width:620px){.ph-lenses{grid-template-columns:repeat(2,1fr);}}

/* stage */
.ph-stage{max-width:1280px;margin:34px auto 0;padding:0 clamp(18px,5vw,56px) 40px;}
.ph-stage-head{display:flex;align-items:center;gap:14px;padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:34px;}
.ph-stage-tag{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);}
.ph-stage-name{font-size:13px;letter-spacing:.06em;color:var(--muted);}
.ph-stage-body{min-height:420px;animation:phFade .5s ease;}
@keyframes phFade{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
.ph-stage-body h3{font-family:Inter,sans-serif;font-size:clamp(24px,3.4vw,40px);font-weight:300;letter-spacing:-.01em;line-height:1.14;margin:12px 0 0;}
.ph-lede{font-size:15px;color:var(--muted);line-height:1.7;max-width:640px;margin-top:18px;font-weight:300;}
.ph-center{margin-left:auto;margin-right:auto;text-align:center;}
.ph-tag-inline{display:inline-block;margin-left:8px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--purple);border:1px solid rgba(155,109,255,.3);border-radius:12px;padding:2px 9px;vertical-align:middle;}

/* network */
.ph-net{position:relative;height:520px;border:1px solid var(--line);border-radius:20px;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%,rgba(11,18,32,.7),var(--bg));}
.ph-net-canvas{position:absolute;inset:0;width:100%;height:100%;}
.ph-net-mask{position:absolute;inset:0;background:radial-gradient(ellipse 48% 44% at 50% 48%,rgba(2,9,18,.92),rgba(2,9,18,.7) 45%,transparent 72%);pointer-events:none;}
.ph-net-copy{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;pointer-events:none;}
.ph-net-copy h3{font-size:clamp(22px,3vw,36px);}
.ph-net-copy p{font-size:14px;color:var(--muted);max-width:520px;margin-top:16px;font-weight:300;}

/* intelligence */
.ph-grid-2{display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:center;}
@media(max-width:880px){.ph-grid-2{grid-template-columns:1fr;gap:32px;}}
.ph-pipe{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:30px;}
.ph-pipe-step{display:flex;align-items:center;gap:8px;}
.ph-pipe-node{font-size:13px;border:1px solid var(--line);border-radius:30px;padding:9px 16px;background:var(--surface);color:var(--text);}
.ph-pipe-arr{color:var(--gold);}
.ph-signals{display:flex;flex-wrap:wrap;gap:10px;}
.ph-signal{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--muted);border:1px solid var(--line);border-radius:12px;padding:11px 15px;background:var(--surface);}
.ph-sig-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal);}

/* opportunities */
.ph-opx{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px;}
@media(max-width:900px){.ph-opx{grid-template-columns:1fr;}}
.ph-opx-card{border:1px solid var(--line);border-radius:16px;background:linear-gradient(160deg,rgba(14,22,38,.85),rgba(11,18,32,.85));overflow:hidden;transition:transform .3s,border-color .3s;}
.ph-opx-card:hover{transform:translateY(-4px);border-color:rgba(232,217,168,.4);}
.ph-opx-head{display:flex;justify-content:space-between;gap:12px;padding:18px 18px 14px;}
.ph-opx-type{font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--gold);margin-bottom:7px;}
.ph-opx-title{font-size:17px;font-weight:500;line-height:1.25;}
.ph-opx-by{font-size:11.5px;color:var(--dim);margin-top:6px;}
.ph-opx-score{text-align:center;border:1px solid var(--line);border-radius:11px;padding:8px 10px;height:max-content;}
.ph-opx-score .sv{font-family:'JetBrains Mono',monospace;font-size:18px;color:var(--gold-l);}
.ph-opx-score .sl{font-size:8px;letter-spacing:.1em;color:var(--dim);text-transform:uppercase;margin-top:2px;}
.ph-opx-meta{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border-top:1px solid var(--line);}
.ph-opx-meta>div{background:rgba(2,9,18,.5);padding:11px 16px;display:flex;flex-direction:column;gap:3px;}
.ph-opx-meta .k{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
.ph-opx-meta .v{font-size:13px;font-weight:500;}
.ph-opx-foot{padding:13px 18px;border-top:1px solid var(--line);}
.ph-opx-status{font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:4px 11px;border-radius:12px;}
.st-open{color:var(--teal);border:1px solid rgba(43,184,165,.35);background:rgba(43,184,165,.08);}
.st-review{color:var(--gold);border:1px solid rgba(232,217,168,.3);background:rgba(232,217,168,.06);}
.st-matched{color:#93c5fd;border:1px solid rgba(59,130,246,.3);background:rgba(59,130,246,.08);}

/* destinations command */
.ph-cmd{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:18px;overflow:hidden;margin-top:40px;}
@media(max-width:760px){.ph-cmd{grid-template-columns:1fr 1fr;}}
.ph-cmd-panel{background:rgba(11,18,32,.55);padding:22px;}
.ph-cmd-k{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;}
.ph-cmd-v{font-family:'JetBrains Mono',monospace;font-size:30px;line-height:1;}
.ph-cmd-v.gold{color:var(--gold-l);}.ph-cmd-v.teal{color:var(--teal);}.ph-cmd-v.purple{color:var(--purple);}
.ph-cmd-s{font-size:11.5px;color:var(--muted);margin-top:8px;}

/* platform */
.ph-platform{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px;}
@media(max-width:880px){.ph-platform{grid-template-columns:1fr;}}
.ph-plat-col{border:1px solid var(--line);border-radius:16px;background:var(--surface);padding:22px;}
.ph-plat-h{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:16px;}
.ph-plat-item{display:flex;align-items:center;gap:11px;font-size:13.5px;color:var(--text);padding:8px 0;border-top:1px solid rgba(255,255,255,.05);}
.ph-plat-item:first-of-type{border-top:none;}
.ph-plat-dot{width:6px;height:6px;border-radius:50%;background:var(--brass,var(--gold));flex-shrink:0;}

/* farmstead */
.ph-farm{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:40px;}
@media(max-width:760px){.ph-farm{grid-template-columns:1fr 1fr;}}
.ph-farm-card{border:1px solid var(--line);border-radius:16px;background:var(--surface);padding:22px;text-decoration:none;color:var(--text);transition:transform .3s,border-color .3s;}
.ph-farm-card:hover{transform:translateY(-4px);border-color:rgba(43,184,165,.4);}
.ph-farm-v{font-family:'JetBrains Mono',monospace;font-size:30px;color:var(--gold-l);}
.ph-farm-k{font-size:13px;color:var(--text);margin-top:8px;font-weight:500;}
.ph-farm-go{font-size:11.5px;color:var(--teal);margin-top:12px;}

/* impact */
.ph-impact{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:42px;}
@media(max-width:760px){.ph-impact{grid-template-columns:1fr 1fr;}}
.ph-impact .ph-stat{border:1px solid var(--line);border-radius:16px;background:linear-gradient(160deg,rgba(14,22,38,.7),rgba(11,18,32,.7));padding:24px;}
.ph-impact .ph-stat-v{font-size:clamp(24px,3vw,34px);}
.ph-impact .ph-stat-k{font-size:12px;margin-top:9px;}

/* final */
.ph-final{text-align:center;padding:clamp(70px,12vh,130px) 24px;border-top:1px solid var(--line);margin-top:30px;
  background:radial-gradient(60% 80% at 50% 0%,rgba(198,166,107,.06),transparent);}
.ph-final-h{font-family:Inter,sans-serif;font-size:clamp(30px,5vw,58px);font-weight:300;letter-spacing:-.02em;margin:0 0 20px;}
.ph-final-sub{font-size:16px;color:var(--muted);max-width:620px;margin:0 auto 36px;font-weight:300;}
.ph-doctrine{margin-top:44px;font-size:11px;letter-spacing:.2em;color:var(--dim);}
`;
