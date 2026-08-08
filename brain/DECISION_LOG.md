# DECISION LOG
*Every significant decision, dated, with rationale. No decision is invisible.*

---

## Format
```
DATE: YYYY-MM-DD
DECISION: [What was decided]
CONTEXT: [Why this came up]
RATIONALE: [Why this decision was made]
ALTERNATIVES CONSIDERED: [What else was on the table]
IMPLICATIONS: [What this means for the platform]
PHASE: [Which phase this affects]
STATUS: [Active / Superseded / Under Review]
```

---

## DEC-001 — Use Supabase over Firebase
**Date:** 2026-05-16  
**Decision:** Use Supabase (PostgreSQL) as the production backend instead of Firebase (Firestore).  
**Context:** Wholey AI OS (sibling project) uses Firebase. PULSE OS initially considered Firebase for consistency.  
**Rationale:** PULSE OS requires relational joins for participation graph logic, multi-tenant RLS, complex reporting, opportunity matching, and destination intelligence aggregation. PostgreSQL's relational model is architecturally essential for the long-term platform. Firestore's document model would create significant technical debt at Phase 4–6.  
**Alternatives:** Firebase Firestore (rejected — schema constraints at scale), PlanetScale (rejected — cost, complexity), self-hosted PostgreSQL (rejected — ops overhead).  
**Implications:** All tenant isolation via RLS policies. Schema-first development. Supabase Edge Functions for AI gateway and iCal sync. Supabase Auth for identity.  
**Phase:** All phases.  
**Status:** Active.

---

## DEC-002 — HTML Prototype as UX Blueprint Strategy
**Date:** 2026-05-16  
**Decision:** Build a comprehensive single-file HTML prototype as the UX specification before production Next.js development.  
**Context:** The platform vision was ambitious. Stakeholder alignment and visual clarity were needed before committing to production architecture.  
**Rationale:** A single-file HTML prototype allows rapid full-platform UX iteration without backend dependency. It serves as the visual specification for Next.js development and as a demo tool. It can run offline for field demos.  
**Alternatives:** Build directly in Next.js (slower iteration, higher coupling), use Figma (not interactive enough), use Framer (tool dependency).  
**Implications:** Two parallel tracks: HTML prototype (UX spec) and Next.js app (production). Must converge. HTML prototype must not become the production system.  
**Phase:** Phase 1.  
**Status:** Active. HTML prototype is now `pulse-os-v2.html` at 5,767 lines, 27 pages.

---

## DEC-003 — Design System: Gold + Teal + Dark Navy
**Date:** 2026-05-16  
**Decision:** Adopt `#C6A66B` (gold), `#2BB8A5` (teal), `#020912` (dark navy) as the primary design system.  
**Context:** The platform needed a visual identity that communicated intelligence, trust, and premium quality without looking like a travel app.  
**Rationale:** Gold communicates premium, earned value, and brand identity. Teal communicates operational confirmation and active states. Dark navy communicates focus, depth, and authority. The combination is reminiscent of Bloomberg Terminal while feeling distinctive.  
**Alternatives:** Blue-only (too generic SaaS), green-primary (too casual), monochrome (too stark).  
**Implications:** Every interface element uses this system. No deviations without a logged decision.  
**Phase:** All phases.  
**Status:** Active.

---

## DEC-004 — Farmstead As Tenant #001, Not Product Definition
**Date:** 2026-05-18  
**Decision:** Explicitly reposition Farmstead Hospitality as Tenant #001 of a multi-tenant platform, not as the product definition.  
**Context:** Early development had Farmstead-specific data hardcoded throughout. Risk of the platform becoming a Farmstead tool rather than a network.  
**Rationale:** The platform's commercial value depends on multi-tenancy. Farmstead-specific constraints would create architectural debt that would limit expansion to hotel groups, tourism boards, and government deployments.  
**Alternatives:** Build Farmstead-specific and refactor later (rejected — tech debt compounds, vision narrows).  
**Implications:** All schemas multi-tenant. All hardcoded Farmstead data moves to seed data. Platform UI shows "Tenant #1" framing. Landing page leads with platform vision, not Farmstead content.  
**Phase:** All phases.  
**Status:** Active.

---

## DEC-005 — AI Provider Abstraction and Invisibility
**Date:** 2026-05-18  
**Decision:** All AI providers are abstracted behind the PULSE brand. Users never see Claude, Gemini, GPT, or DeepSeek.  
**Context:** Multiple AI providers were evaluated for different tasks. Provider-specific branding would create user confusion and lock-in risk.  
**Rationale:** PULSE is the product, not the AI model. Provider invisibility protects against model deprecation, allows cost optimization through routing, and builds brand trust. Users trust PULSE — not the underlying model.  
**Alternatives:** OpenAI-branded outputs (rejected — vendor dependency), multi-brand display (rejected — confusing, undermines platform identity).  
**Implications:** AI gateway abstraction layer required. All outputs branded as PULSE Insight / PULSE Recommendation / etc. Cost routing by task type. Hybrid model approach.  
**Phase:** All phases.  
**Status:** Active.

---

## DEC-006 — Trust Intelligence as Active Phase
**Date:** 2026-05-20  
**Decision:** Elevate Trust Intelligence from Phase 4 concept to Phase 2 Active.  
**Context:** The original roadmap had Trust Intelligence as part of Local Ecosystem (Phase 4). Review of competitive landscape showed that trust validation is a prerequisite for Discovery to be commercially differentiable.  
**Rationale:** Any platform can show a list of local restaurants. Only PULSE shows trust-scored, evidence-validated local businesses. Trust Intelligence is the moat that separates Discovery from a directory. Activating it in Phase 2 means the moat begins building from the first local business added.  
**Alternatives:** Keep in Phase 4 (rejected — weakens the moat at critical early stages), build as optional feature (rejected — misses the architectural opportunity).  
**Implications:** Trust scoring algorithm must be built as a real Edge Function, not just a UI concept. Score inputs defined in PRODUCT_DOCTRINE.md. Status lifecycle defined.  
**Phase:** Phase 2.  
**Status:** Active.

---

## DEC-007 — AI Getaway Engine As Primary Consumer Surface
**Date:** 2026-05-22  
**Decision:** The AI Getaway Engine becomes the platform's primary public-facing consumer acquisition surface.  
**Context:** Needed a compelling reason for guests to engage with PULSE directly, not just through Airbnb or Booking.com.  
**Rationale:** Current OTA platforms show listings. PULSE shows intelligence — a personalised, trust-verified, experience-rich escape built for the specific guest. This creates a direct relationship with the guest, builds the participation graph, and enables future direct booking conversion.  
**Alternatives:** Standard property search (rejected — no differentiation from Airbnb), blog/content strategy (rejected — too slow, no engagement loop).  
**Implications:** Getaway Engine is a first-class product surface. It requires: property data, trust-scored vendors, events data, itinerary generation. It feeds into the participation graph with every search and click.  
**Phase:** Phase 1–2 (consumer surface), Phase 6 (opportunity matching integration).  
**Status:** Active. UI implemented in HTML prototype. Production implementation pending.

---

## DEC-008 — HTML Prototype Parallel Development Issue
**Date:** 2026-05-25  
**Decision:** Acknowledge and resolve the architectural drift caused by parallel Claude + ChatGPT development sessions.  
**Context:** Some development sessions used ChatGPT to add pages to the HTML prototype. This resulted in: changed design system (ChatGPT shifted gold to primary accent, Claude had used blue), inconsistent component naming, two types.ts files (lib/types.ts and lib/types/index.ts).  
**Rationale:** The drift was identified and resolved in subsequent Claude sessions. Gold was adopted as the brand primary, blue retained for operational data states. Two types files co-exist (requires consolidation — logged in TECHNICAL_DEBT.md).  
**Alternatives:** N/A — post-hoc resolution.  
**Implications:** All future development uses Claude only. ChatGPT is not to be used for PULSE OS development. Brain protocol established to prevent context loss between sessions.  
**Phase:** All phases.  
**Status:** Active. Technical debt tracked.

---

## DEC-009 — Brain Directory Initialization
**Date:** 2026-05-31  
**Decision:** Create `/brain` directory as the platform's living memory and source of truth.  
**Context:** Development had proceeded without persistent strategic documentation. Context was being lost between sessions. The Strategic Filter was not being applied. Decisions were not being logged. Architecture was drifting.  
**Rationale:** A platform of this ambition requires institutional memory. The Brain ensures every session builds on what came before, every decision is traceable, and the vision remains coherent across time.  
**Alternatives:** README-only documentation (insufficient — no strategic layer), Notion/external wiki (dependency, not accessible to the AI architect during sessions).  
**Implications:** Every future session starts by reading the Brain. Every significant decision is logged here before implementation.  
**Phase:** All phases.  
**Status:** Active.

---

## DEC-010 — Cinematic Motion Layer on Landing Page
**Date:** 2026-05-31
**Decision:** Add a GPU-composited cinematic animation layer to the `#page-landing` surface in `pulse-os-v2.html`: drifting particle/orb parallax, radial golden glow, logo breathing, staggered word/line reveals, idle CTA pulse + shimmer, scroll-triggered section reveals via IntersectionObserver, sticky frosted nav, and count-up.
**Context:** Landing page is the platform's primary acquisition surface (DEC-007). It was visually correct but static. A first-time operator or guest should feel the platform is "alive and intelligent" within the first 3 seconds.
**Rationale:** The landing page sells the platform's positioning before any feature is seen. Motion communicates premium quality and intelligence. This strengthens the acquisition layer of the moat without adding any new module — pure enhancement of an existing surface (PULSE Evolution Rule).
**Alternatives:** GSAP library (rejected — adds CDN dependency; pure CSS + vanilla JS is sufficient and lighter), video background (rejected — bandwidth cost, SA load-shedding/connectivity context favours CSS gradients), Lottie (rejected — dependency + asset weight).
**Implications:** All motion uses transform/opacity only (GPU-composited). All non-essential motion gated behind `@media (prefers-reduced-motion: no-preference)`. Durations exposed as CSS custom properties (`--duration-fast/base/slow`) for global tuning. No layout shift on load. No external dependencies. Animations re-trigger when navigating back to landing via a `go()` wrapper.
**Phase:** Phase 1 (acquisition surface).
**Status:** Active.

---

## DEC-011 — Cinematic Scrollytelling Landing Page (Full Rebuild)
**Date:** 2026-05-31
**Decision:** Replace the conventional `#page-landing` surface with a premium, documentary-style scrollytelling experience that unfolds the platform story across 9 emotional acts (Recognition → Relief → Curiosity → Trust → Ambition → Vision → Conviction). Make the landing a full-viewport immersive canvas (`position:fixed;inset:0;overflow-y:auto`) that escapes the operational app chrome.
**Context:** The landing page is the platform's belief-creation surface. A conventional SaaS layout undersells a category-defining intelligence network. Separately, a critical structural defect was found: `#page-landing` is a direct child of `#main` (overflow:hidden), so it could not scroll at all — content below the fold was clipped and unreachable. Scrollytelling is impossible without scroll.
**Rationale:** (1) The landing must create conviction, not list features — this requires cinematic narrative progression, not a feature grid. (2) The full-screen immersive treatment removes the operational sidebar from the marketing experience (a real prospect should not see "Housekeeping / Tasks" nav). (3) Making the landing its own scroll container fixes the latent clipping defect (strict improvement, no regression — the page previously could not scroll at all). Operational pages inside `#content` are untouched.
**Alternatives:** Keep conventional layout + just add motion (rejected — DEC-010 already did this; the brief explicitly demands a category-defining documentary experience). Move all platform pages into `#content` (deferred — larger structural change; logged in TECHNICAL_DEBT as TD-009 for a future proper fix; the full-screen approach achieves the goal now with less risk).
**Implications:** Landing nav links rewired to real prototype pages (page-morning, page-getaway, page-properties, page-trial). New scoped CSS/JS engine (`pl-` prefix) replaces the DEC-010 `ls-` experiment. Scroll-driven IntersectionObserver acts, an SVG "invisible network" graph reveal, floating disconnected signals, and the AI Getaway / Trust / Operator / Destination / Future moments. All motion GPU-composited, prefers-reduced-motion respected.
**Phase:** Phase 1 (acquisition surface).
**Status:** Active. Supersedes the visual layout of DEC-010 on the landing surface (DEC-010 motion principles retained).

---

## DEC-012 — Standalone Cinematic Brand Website + Opportunity-Led Positioning
**Date:** 2026-05-31
**Decision:** Build a separate, world-class scrolltelling marketing website (`pulse-experience.html`) led by the positioning **"Every Destination Has Hidden Opportunity."** This is the public brand experience — distinct from the in-app landing surface (`#page-landing` in `pulse-os-v2.html`, DEC-011) and the operational platform.
**Context:** The brief calls for a $500k-grade cinematic experience (Apple × Aman × Palantir) to create belief, not explain features. It also shifts the lead message from operations ("Run Better…") to opportunity ("Every Destination Has Hidden Opportunity").
**Rationale:** (1) Opportunity-led positioning aligns more closely with the North Star and the strategic moat (Verified Participation Graph / Opportunity Intelligence) than the operations-led message — it sells the category, not the tool. (2) A cinematic marketing site and an operational app must not share chrome or codebase concerns; separating them keeps each pure (consistent with DISC-009). (3) Standalone file = zero regression risk to the operational prototype.
**Architecture intent:** In production, the brand site lives at the root domain (e.g. pulseos.africa) and the app at /app or app.pulseos.africa. The brand site's CTAs ("Explore The Network", "Join The Movement", "Start Free Trial") route into the app / trial flow.
**Tech:** GSAP + ScrollTrigger + Lenis (smooth scroll) via CDN for cinematic scrolltelling; canvas for the Network masterpiece (Ch4) and the global finale — chosen over full Three.js for reliability, performance, and SA-connectivity resilience (Three.js noted as a future enhancement path). Curated stable editorial photography (Unsplash CDN) graded to a navy/champagne duotone so it reads editorial, not stock. Progressive enhancement: content visible if JS/CDN fails. prefers-reduced-motion fully respected.
**Design system extension:** Adds editorial luxury layer to the existing palette — rich black `#07090E`, deep navy `#0B1220`, muted brass `#B08D57`, champagne gold `#E8D9A8`, warm white `#F4EFE6`, glass surfaces. Display serif (Cormorant Garamond) + Inter. Stays within the gold/navy brand established in DEC-003.
**Phase:** Phase 1 (acquisition / brand).
**Status:** Active. Does not supersede DEC-011 (the in-app landing remains the app's front door); DEC-012 is the public brand site above it.

---

## DEC-013 — Category-Creation Evolution of the Brand Site (7 New Chapters)
**Date:** 2026-05-31
**Decision:** Evolve `pulse-experience.html` by weaving SEVEN new chapters into the existing scroll narrative (no existing chapter removed): Verified Discovery (trust formula), **Ask PULSE** (intelligence interface — the centrepiece), **Farmstead Live** (proof bridge into the real app), Every Destination Has Hidden Opportunity, **Destination Command** (tourism-board scale), Why Now, and The Roadmap Journey (7 intelligence layers).
**Context:** Gap analysis (`LANDING_PAGE_GAP_ANALYSIS.md`) found the brand site builds belief but (1) never names/demonstrates the Verified Participation Intelligence moat, (2) lacks the Ask-PULSE intelligence-infrastructure proof, (3) has no proof bridge to the live app, and (4) caps perceived market at "accommodation operators" with no destination-authority moment — preventing belief from the institutional audiences (tourism board / municipality / investor / government).
**Rationale:** These additions convert the site from "cinematic hospitality story" to "category-defining intelligence-network experience" and deliver the missing Vision+Proof = Conviction arc. Each strengthens the moat (Trust, Participation Graph) or expands perceived market (Destination Command, Roadmap), per the gap analysis ranking.
**Architecture:** Farmstead Live is a *bridge*, not a duplicate — it links into the real operational pages of `pulse-os-v2.html` (honours "no duplicate modules"). Destination Command is honestly framed as Phase 5 Preview (Constitution Art. IX: visibility ≠ validation). Ask PULSE outputs are pre-composed, evidence-styled, branded "PULSE Insight/Opportunity" (AI invisible) with no backend.
**Implications:** Reuses existing design system + GSAP/Lenis/canvas engine + `.reveal-init`/`[data-count]` patterns — no new dependencies. Nav extended with Ask PULSE + Farmstead Live + Destinations anchors.
**Phase:** Phase 1 (brand/acquisition); surfaces Phase 2–7 vision.
**Status:** Active. Evolves DEC-012; does not supersede it.

---

## DEC-014 — Reposition to Platform Scale + Add Opportunity/JV Layer + Fix Network Overlap
**Date:** 2026-05-31
**Decision:** Evolve `pulse-experience.html`: (1) fix the network-section label/copy overlap properly (centre readability mask + elliptical node redistribution + text-safe label exclusion + mobile dots-only); (2) add the **Opportunity Exchange / JV Network** pillar (object model, types, JV workflow, opportunity scoring, example opportunities) — the commercial moat; (3) add **Platform Network** (future partner layer — network effects); (4) add a multi-audience **Built For** section (tourism boards, property owners, local businesses, investors); (5) enrich **Ask PULSE** outputs with suggested participants + JV model + next action; (6) restructure nav to category IA. Farmstead remains the separate live proof environment (`pulse-os-v2.html`), bridged not duplicated.
**Context:** Gap analysis (`LANDING_PAGE_AND_PLATFORM_GAP_ANALYSIS.md`) found the site still reads too hospitality-specific, lacks the Opportunity/JV marketplace (the moat), under-addresses tourism boards/owners/investors, and has a real visual bug (network labels overlap copy).
**Rationale:** The Opportunity Exchange is what makes PULSE "economic participation infrastructure" rather than "operations + discovery" — it is the clearest commercial-moat and investor story. Multi-audience framing + Platform Network make the platform legible to institutional buyers. The network fix is non-negotiable visual integrity.
**Implications:** Reuses design system + motion engine; no new deps. Opportunity outputs draft-first; AI invisible. Destination/Opportunity framed honestly (preview where not yet live, per Constitution Art. IX).
**Phase:** Phase 1 (brand) surfacing Phase 4–6 (Local Ecosystem / Destination / Opportunity Intelligence).
**Status:** Active. Evolves DEC-012/013.

---

## DEC-015 — Production Next.js Homepage: Seven Intelligence Lenses
**Date:** 2026-05-31
**Decision:** Build the new public-facing homepage as a production Next.js page at root `/` (`apps/web/app/page.tsx` → renders `components/marketing/pulse-home.tsx`). The operational app remains reachable at `/dashboard` and the `(app)` routes. The homepage is organised around SEVEN executive intelligence lenses the visitor rotates between: Network · Intelligence · Opportunities · Destinations · Platform · Farmstead Live · Economic Impact.
**Context:** The brand brief escalated: PULSE must read as "The Intelligence Layer Connecting Hospitality, Destinations and Opportunity" (Bloomberg/Palantir/LinkedIn-economic-graph register), not a hospitality tool. A new brand identity was provided (gold P + pulse-wave mark, teal/gold/purple ecosystem ring). The deliverable is explicitly a Next.js page, not another HTML prototype.
**Rationale:** Root `/` as the brand homepage matches the architecture doctrine (DISC-010: brand at root, app behind it). Seven lenses let one page communicate the full platform without feeling like a feature list — each lens is an "intelligence view," not a page. The 7th lens (Economic Impact) carries the investor / tourism-board / government story (opportunities activated, revenue, jobs, economic value) — directly consistent with the North Star's opportunity-participation-intelligence doctrine.
**Implications:** Self-contained client component — no Supabase/backend dependency, so it builds and renders standalone (counters + canvas network via React refs). Reuses the design tokens (#020912/#C6A66B/#2BB8A5, adds purple #9B6DFF). Old root redirect-to-dashboard removed; `/dashboard` still direct-accessible. Brand mark rendered as institutional SVG (approximates the provided logo; exact 3D asset can replace it later). AI invisible; opportunity outputs evidence-styled.
**Phase:** Phase 1 (brand/acquisition) surfacing Phase 4–7 (Local Ecosystem / Destination / Opportunity / Sovereign Economic Intelligence).
**Status:** Active. This is the production counterpart to the `pulse-experience.html` prototype (DEC-012/013/014); the prototype remains the rapid-iteration UX spec.

---

## DEC-016 — Ratify the Master Constitution as Supreme Source of Truth
**Date:** 2026-05-31
**Decision:** Adopt the founder's "Master Constitution, Product Doctrine & Build Directive" as the supreme governing document. Rewrote `/brain/CONSTITUTION.md` to encode it (identity = "the world's first Opportunity Intelligence Network"; the Signal→…→Opportunity model; Verified Participation Intelligence as the moat; the eleven domains; the three-layer experience architecture; the Six-Question Build Gate; the Final Test). Created `/brain/PULSE_DOMAINS.md` mapping all 11 domains to current build status. Prior operating articles retained as Art. I–XI.
**Context:** The directive explicitly supersedes all previous prompts and demands ratification before any further code: "If future prompts conflict with this document, this document wins."
**Rationale:** This is a governance act, not a feature. Encoding it makes every future decision evaluable against one canonical law and prevents drift back toward "hospitality software." It reframes scope from hospitality-Phase-1 to an 11-domain opportunity intelligence network while preserving the non-negotiable operating safeguards (AI invisibility, trust earned, no autonomous public actions, privacy, sovereignty, evolve-not-replace).
**Reconciliation:** Adds two doctrine clauses — *Participation Creates Value* and *Opportunity Creates Growth*. Confirms Trust scores are internal-only (sharpens DEC-006). Confirms PULSE SOVEREIGN is vision-only (never scoped). No prior decision is reversed; all remain valid under the new frame.
**Implications:** All future work passes the Six-Question Gate. The Participation Graph (Domain 8), live Trust scoring (Domain 4), and wiring production HOST to Supabase (Domain 1) are the highest-leverage next builds — they convert the visualised graph into a real, compounding one.
**Phase:** Foundational / all phases.
**Status:** Active. SUPREME — supersedes conflicting guidance in all other Brain files.

---

## DEC-017 — PULSE Opportunities Master Scrolltelling Chapter (Domain 5 centrepiece)
**Date:** 2026-05-31
**Decision:** Build `pulse-opportunities.html` — a standalone cinematic scrolltelling chapter of the PULSE Experience (Layer 1) presenting PULSE Opportunities as the strategic centre of the platform. 12 sections + final CTA, per the founder directive, governed by the new `/brain/PULSE_OPPORTUNITIES_DOCTRINE.md` (extracted from the original Opportunity/Viability/Participation/Google concepts). Entrances wired from the brand site, the homepage Opportunities lens, and the app opportunity page.
**Context:** The Constitution names PULSE OPPORTUNITIES the most important intelligence layer (Domain 5). The existing surfaces under-tell it. The directive mandated: review original opportunity files → extract intent → write doctrine → then build.
**Rationale:** Passes the Six-Question Gate on all six dimensions. The Viability Engine section reflects the real original engine logic (base 50 + weighted evidence signals → Participate/Conditional/Do-Not-Participate, confidence by signal count, Google-profile-verification risk, human-approval gate) — making the centrepiece feel real, not decorative. Standalone page (not bloating the 108KB brand site) matches "standalone scrolltelling chapter" and keeps the Experience modular.
**Implications:** Reuses the Experience design system + GSAP/Lenis/canvas; no new deps; progressive enhancement + reduced-motion preserved. Farmstead appears only at section 11 (proof, never first). AI invisible; outputs draft-first.
**Phase:** Phase 1 (Experience) surfacing Phase 5/6 (Destination/Opportunity Intelligence). Production engines remain roadmap (NEXT_ACTIONS unchanged — graph-first).
**Status:** Active.

---

## DEC-018 — PULSE Travel & Discovery Master Scrolltelling Chapter (Domains 2+3)
**Date:** 2026-05-31
**Decision:** Build `pulse-travel-discovery.html` — a standalone immersive scrolltelling chapter presenting PULSE Travel & Discovery as the bridge between the guest and the Opportunity Network. 14 sections + final CTA per the founder directive, governed by `/brain/PULSE_TRAVEL_DISCOVERY_DOCTRINE.md`. Entrances wired from the brand site, the app discovery page, and (alongside) the Opportunities chapter.
**Context:** Constitution Domains 2 (TRAVEL) + 3 (DISCOVERY). The directive: discovery is not searching, it is intelligent participation. Original concepts existed thinly (Google Places mock route, 10-category Local Discovery taxonomy, AI Getaway, Trust formula) but were never told as the category story.
**Rationale:** Reframes travel from "find products" to "discover the right opportunity," and explicitly bridges Discovery → Participation → Opportunity → Impact (connecting to DEC-017). Two interactive proofs — AI Travel Intelligence (style→personalised opportunities) and the Local Discovery category map — plus a canvas Discovery Graph, make the thesis felt. Reuses the real taxonomy and place-object from the original Google Places route so the demo and production stay aligned (per DISC-018).
**Implications:** Reuses Experience design system + GSAP/Lenis/canvas; no new deps; reduced-motion + progressive enhancement preserved. Verified-only surfaces to guests; AI invisible; Farmstead appears as pilot proof at S12 (not first).
**Phase:** Phase 1 (Experience) surfacing Phase 2/3/4 (Trust / Growth / Local Ecosystem).
**Status:** Active. Sibling to DEC-017 (Opportunities chapter).

---

## DEC-019 — Multi-File Build Directive: Gap Analysis + PULSE Destination (Domain 7)
**Date:** 2026-05-31
**Decision:** Honour the Claude Code Build Directive via its mandatory gate (`PULSE_GAP_ANALYSIS.md`) and deliver the highest-value missing file first: `pulse-destination.html` — a 10-chapter sovereign-grade destination intelligence experience for tourism boards, municipalities, governments, DMOs and investors, with a UAE/Gulf investor lens, plus the directive's global ⌘K search layer (debuted here, reusable across files).
**Context:** The directive specifies 5 deliverables. Inventory shows three already exist at depth (`pulse-experience.html` = the landing; `pulse-opportunities.html`; `pulse-travel-discovery.html` = the referenced 525-line file). Two are genuinely missing: destination + host. The Constitution (SUPREME) forbids duplication, so a literal `pulse-os-landing.html` would duplicate the existing landing.
**Rationale:** Destination is the most-emphasised, entirely-absent audience (sovereign/tourism-board/investor) — it most strengthens investor + tourism-board confidence (gap analysis §4–5). The UAE lens is the "every destination" framing applied to the investor's region; Farmstead remains the SA proof. Reconciliation (gap analysis §7): evolve `pulse-experience.html` as the landing, alias not duplicate.
**Implications:** Reuses exact design system + GSAP/Lenis/canvas; grain + progress + global ⌘K; AI invisible; demo honestly labelled (PULSE SOVEREIGN = vision mode); human-approval framing; UAE AED metrics in preview cards clearly marked Intelligence Demo. Remaining directive items (host, ⌘K everywhere, Farmstead P1–4, travel enhancements, stale-file archive) sequenced for next increments per gap analysis §SEQUENCED BUILD PLAN.
**Phase:** Phase 1 (Experience) surfacing Phase 5/7 (Destination / Sovereign Intelligence — vision only).
**Status:** Active.

---

## DEC-020 — PULSE HOST file (Domain 1, global hospitality OS, UAE investor lens)
**Date:** 2026-05-31
**Decision:** Build `pulse-host.html` per the directive (File 2) and gap-analysis sequence item C — the global hospitality operating system positioned for UAE hotel groups, resorts, developers and investors. 8 intelligence modules, cinematic command-dashboard hero, Legacy-PMS-vs-PULSE contrast frame, scale tiers (Starter/Portfolio/Enterprise/Sovereign), UAE/Gulf investor section, global ⌘K search.
**Context:** Farmstead is the SA proof of HOST; this file shows HOST at global scale for the investor audience (AED, Palm Jumeirah / Liwa / Downtown property archetypes). Positioned as "what hospitality should become," with Farmstead as the live proof beneath it.
**Rationale:** Reuses the design system + motion engine + ⌘K layer (DISC-021). Visual richness prioritised (readiness rings, channel bars, sparklines, glass dashboard) since this is the CEO/board-facing surface. AI invisible (PULSE Insights/Recommendation). Demo metrics honestly framed.
**Implications:** Wired from the brand site Meet-PULSE / platform context. Remaining sequence (D ⌘K everywhere, E Farmstead P1–4, F travel enhancements, G landing alias, H archive) unchanged.
**Phase:** Phase 1 (Experience) representing Domain 1 at scale.
**Status:** Active.
