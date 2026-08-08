# DISCOVERIES
*Insights, patterns, and learnings found during development. Updated: 2026-05-31.*

---

## DISC-001 — The Morning Brief is the Retention Hook
**Date:** 2026-05-20  
**Discovery:** During UX design, the Morning Brief emerged as the highest-value daily touchpoint. If Nadia opens PULSE first every morning instead of WhatsApp, the platform has won Phase 1 adoption.  
**Implication:** The Morning Brief must be perfect before anything else. It must be faster to load than WhatsApp, more informative than a group message, and immediately actionable.  
**Action taken:** Morning Brief page made the default landing page in the HTML prototype. Personalized greeting with gold accent creates emotional engagement.

---

## DISC-002 — Staff Adoption is the Data Source
**Date:** 2026-05-20  
**Discovery:** Without staff adoption of the Task Hub, the readiness scores are wrong, the maintenance log is empty, and the operational intelligence layer has no data to learn from.  
**Implication:** Staff Hub mobile experience must be frictionless. Checklists must be printable for staff who don't have smartphones. The system must work for Thandi even if she only has a basic Android phone.  
**Action taken:** Staff Hub page made mobile-optimised. Printable checklists added with `@media print` styles.

---

## DISC-003 — Reviews are the Richest Signal Source Available Now
**Date:** 2026-05-22  
**Discovery:** In Phase 1, before the participation graph has data, guest reviews contain more intelligence than any other source. They mention maintenance issues (hot water), staff quality, specific features (fireplace), and location attributes.  
**Implication:** The Review Intelligence layer should be implemented as early as possible. AI keyword extraction from reviews (mentions of hot water, WiFi, fireplace, etc.) creates an automatic task generation pipeline that requires zero additional data entry.  
**Action taken:** Review Intelligence Command Center includes keyword detection → task creation workflow in the HTML prototype.

---

## DISC-004 — The Trust Layer Changes the Product Category
**Date:** 2026-05-20  
**Discovery:** Adding Trust Intelligence to Local Discovery fundamentally changes what PULSE is. Without Trust scoring, PULSE has a directory. With Trust scoring, PULSE has a verification network.  
**Implication:** Trust Intelligence was originally planned for Phase 4 but was elevated to Phase 2 Active. The sooner it is implemented, the sooner the emerging moat starts building.  
**Action taken:** Phase governance updated. Trust Intelligence elevated to Phase 2. MOAT_MAP.md updated.

---

## DISC-005 — The AI Getaway Engine is an Acquisition Moat, Not Just a Feature
**Date:** 2026-05-22  
**Discovery:** Every competitor shows a list of properties. The AI Getaway Engine shows an intelligence-curated escape with trust-verified experiences. This fundamentally changes the guest's relationship with the platform — they encounter intelligence before they encounter listings.  
**Implication:** The AI Getaway Engine is not a feature to be built after the operations layer. It is a parallel acquisition surface that needs to exist from early Phase 2.  
**Action taken:** AI Getaway Engine elevated to primary consumer surface in the HTML prototype. Demo implemented with personalized escape generation.

---

## DISC-006 — Parallel Development Creates Architectural Drift
**Date:** 2026-05-25  
**Discovery:** Using multiple AI assistants (Claude + ChatGPT) to build different parts of the HTML prototype caused: design system inconsistencies (gold vs blue as primary), naming inconsistencies (different CSS class names), and duplicate type definitions.  
**Implication:** All development must run through a single AI architect (Claude) with Brain context. The Brain protocol established in this session is the solution.  
**Action taken:** Brain directory initialized. DEC-008 logged. All future development to use Claude only.

---

## DISC-007 — Farmstead's Operational Challenges Are Universal
**Date:** 2026-05-20  
**Discovery:** Every problem Farmstead has — WhatsApp coordination, paper checklists, forgotten maintenance issues, inconsistent review responses — is shared by every small hospitality operator in South Africa and globally.  
**Implication:** PULSE doesn't need to find product-market fit beyond Farmstead. The fit is pre-validated. The challenge is execution quality and sales.  
**Action taken:** Farmstead specifics remain in the HTML prototype as illustrative content. Production architecture is multi-tenant from the start.

---

## DISC-008 — The Landing Page Could Never Scroll (Latent Structural Defect)
**Date:** 2026-05-31
**Discovery:** While building the cinematic landing experience, browser inspection revealed `#page-landing` (and all 6 sibling "platform" pages: getaway, trial, trust, channels, opportunity, destination) are direct children of `#main`, which has `overflow:hidden`. They were appended *outside* the scrollable `#content` wrapper. Result: every one of these pages was clipped at the viewport fold with no way to scroll — content below the first screen was unreachable.
**Why it mattered:** The previous landing page "looked correct" only because its hero filled the viewport. The How-It-Works, Pillars, and Social Proof sections below it were silently inaccessible. Scrollytelling is impossible without a scroll container.
**Implication:** Resolved surgically by making `#page-landing.active` a full-viewport own-scroll container (`position:fixed;inset:0;overflow-y:auto`). This both enables scrollytelling and fixes the clipping. The same clip still affects getaway/trial/trust/channels/opportunity/destination — logged as TD-009 for a proper structural fix (relocating those pages inside `#content`).
**Lesson:** When appending pages to an existing shell, verify they land inside the scroll container — not as siblings of it. Append markers (`<!-- /content -->`) can sit outside the closing tag they appear to precede.

---

## DISC-009 — Scrollytelling Demands an Immersive Surface, Not an Embedded One
**Date:** 2026-05-31
**Discovery:** The landing page was rendering *inside* the operational app shell — with the PULSE sidebar (Morning Brief / Housekeeping / Tasks) visible alongside the marketing hero. For a category-defining "documentary" landing experience, the operational chrome destroys the illusion.
**Implication:** The landing page now takes over the full viewport (`position:fixed;inset:0;z-index:300`) when active, with its own sticky marketing nav. Its nav links route back into the operational app (Sign In → Morning Brief, Platform → Morning Brief, Getaway → AI Getaway), so the two worlds connect cleanly without bleeding into each other.
**Lesson:** Marketing surfaces and operational surfaces should not share chrome. The landing is the front door; the app is the building behind it.

---

## DISC-010 — The Brand Site and the App Are Two Different Products
**Date:** 2026-05-31
**Discovery:** Building the cinematic marketing site (`pulse-experience.html`) crystallised that PULSE has two distinct front-end products with opposite jobs: the **brand site** exists to create belief (cinematic, emotional, opportunity-led, photographic, GSAP/Lenis), and the **operational app** exists to create daily utility (dense, calm, evidence-led, Bloomberg-like). They should never share a codebase or chrome.
**Implication:** Architecture going to production: brand site at root domain, app at /app or app subdomain. The brand site's every CTA funnels into the app's trial/getaway flows. This mirrors how Stripe, Linear and Palantir separate their marketing surface from their product surface.
**Lesson:** Opportunity-led positioning ("Every Destination Has Hidden Opportunity") sells the *category*; operations-led positioning ("Run Better…") sells the *tool*. The brand site leads with category; the app leads with tool. Both are correct — for their respective audiences.

---

## DISC-011 — Cinematic Reliability in a Load-Shedding Market
**Date:** 2026-05-31
**Discovery:** A "$500k cinematic experience" normally implies heavy video and Three.js. For the South African market (intermittent connectivity, load-shedding, mobile-first), that is a liability. Chose canvas-based network/globe visualisations over Three.js, graded editorial photography over multi-megabyte drone video, and full progressive enhancement (content visible if GSAP/Lenis/canvas all fail).
**Evidence it works:** Headless smoke test with no libraries and no canvas support → zero errors, hero content visible. The experience degrades gracefully to a still, readable, on-brand page.
**Lesson:** Premium ≠ heavy. The most luxurious experience is the one that always loads. Reliability is itself a luxury signal in this market.

---

## DISC-012 — Vision + Proof = Conviction (the Farmstead Live hinge)
**Date:** 2026-05-31
**Discovery:** The brand site built belief but had no proof beat — institutional audiences (tourism board, investor, government) had nothing to trust. Adding "Farmstead Live" as a *bridge* (not a duplicate) — cards that link directly into the real operational app — converts vision into trust without rebuilding anything. The two narratives (The Future / Farmstead Live) now operate simultaneously, exactly as the brief required.
**Lesson:** A category-creation site needs both halves: Narrative A makes you *believe* it should exist; Narrative B proves it *already works*. Bridge to real proof — never mock it, never duplicate it.

## DISC-013 — "Ask PULSE" Is the Strongest Category Signal
**Date:** 2026-05-31
**Discovery:** Of all additions, the Ask PULSE intelligence interface most powerfully reframes PULSE from software to infrastructure. Letting a visitor query the network ("What opportunities exist around Sani Pass?") and receive an evidence-styled, branded "PULSE Insight" answer makes the participation-graph moat tangible in seconds — more than any copy could. Pre-composed + interactive + no backend = demo-safe and reliable.
**Lesson:** To create a category, let people *use* the new thing for ten seconds. Demonstration beats description.

---

## DISC-014 — The Opportunity Exchange Is the Real Commercial Moat
**Date:** 2026-05-31
**Discovery:** Until this build, PULSE's brand story read as "operations + discovery" — valuable, but bounded by the hospitality category. Adding the Opportunity Exchange / JV Network reframes PULSE as *economic-participation infrastructure*: a marketplace where opportunities are pitched, trust/readiness-scored, matched, and structured into joint ventures. This is the story investors and tourism boards actually buy, and it converts the participation graph from an abstract moat into a transacting one.
**Lesson:** Discovery shows what exists; the Opportunity Exchange creates what's next. The marketplace — not the dashboards — is where network effects become revenue.

## DISC-015 — Canvas Copy Overlap: Mask + Geometry + Exclusion (not smaller fonts)
**Date:** 2026-05-31
**Discovery:** The network section's canvas labels overlapped the centred headline. The correct fix was three independent layers, not a font reduction: (1) a radial **readability mask** behind the copy (guarantees legibility unconditionally), (2) **elliptical node redistribution** biased to the edges (nodes sit beyond the copy width), and (3) a **text-safe ellipse** that skips any label and dims any node entering the central zone — plus labels only on ≥820px and dots-only on mobile.
**Lesson:** For text-over-animation, separate the visual layer from the copy layer with a guaranteed mask, then keep moving elements out of a defined safe zone. Never rely on size alone.

---

## DISC-016 — The Production Homepage Is Lens-Switched, Not Scroll-Told
**Date:** 2026-05-31
**Discovery:** The HTML brand prototype (pulse-experience.html) is a linear scrollytelling documentary. The production Next.js homepage took a different, complementary form: SEVEN executive "intelligence lenses" the visitor switches between (Network · Intelligence · Opportunities · Destinations · Platform · Farmstead Live · Economic Impact). This reads as a Bloomberg/Palantir command surface rather than a marketing scroll — which is the correct register for the institutional audiences (tourism boards, municipalities, investors, governments).
**Why it works:** Lenses let one page carry the full platform without a feature list, and let a CFO/board member jump straight to Opportunities or Economic Impact. The 7th lens (Economic Impact) is the investor/government close — opportunities activated, revenue, jobs, economic value created.
**Build facts:** Self-contained `'use client'` component at root `/` (app stays at /dashboard). `next build` prerenders `/` static at 9 kB / 114 kB first load, 34 routes, zero errors. Canvas network uses the DISC-015 text-safe technique. No backend dependency.
**Lesson:** Match the format to the audience. Scrollytelling sells a story; a lens-switched command surface sells a category to operators who think in dashboards.

---

## DISC-017 — The Viability Engine Must Be Felt, Not Described
**Date:** 2026-05-31
**Discovery:** The most persuasive moment in the Opportunities chapter is the interactive Viability Engine — toggling evidence signals and watching the score, recommendation band and confidence recompute live (base 50 + weighted evidence, ≥75 Participate / 55–74 Conditional / <55 Hold, confidence by signal count). It reproduces the *actual* original `api/ai/viability` logic, so the centrepiece feels real, not decorative. A static scorecard would have read as a mockup; the live recompute reads as a working engine.
**Lesson:** For an engine that is the heart of the platform, let the visitor operate it. Ten seconds of interaction proves more than a paragraph of claims. Reuse the real production logic in the demo so the two never diverge.

## DISC-018 — Build the Doctrine Before the Chapter (it changed the content)
**Date:** 2026-05-31
**Discovery:** Following the directive's mandatory order (review originals → extract intent → write `PULSE_OPPORTUNITIES_DOCTRINE.md` → then build) materially improved the build. Extracting the original viability route surfaced the real scoring constants, recommendation states (participate/conditional/do_not_participate ↔ join/join_with_conditions/hold) and the "Google Business Profile not verified" standing risk — all of which went into the chapter verbatim. Without the doctrine pass, the chapter would have invented weaker numbers.
**Lesson:** The doctrine step is not bureaucracy — it is how the new surface inherits the original architecture's intent instead of drifting from it.

---

## DISC-019 — Discovery Is the Bridge, Not a Destination
**Date:** 2026-05-31
**Discovery:** The Travel & Discovery chapter only lands when it visibly hands off to Opportunity. Building the explicit bridge (Discovery → Participation → Opportunity → Impact) with reciprocal links — travel page → opportunities page, and the last-minute engine → "see the opportunity" — made the two chapters read as one network rather than two brochures. The ecosystem map in the Constitution (TRAVEL guides the guest, DISCOVERY surfaces the ecosystem, OPPORTUNITIES activates value) became literally navigable.
**Lesson:** Every domain chapter must terminate in the next domain, not in a generic CTA. Cross-linking the chapters is what turns a set of pages into a felt network.

---

## DISC-020 — Reconcile the Directive Against the Constitution Before Building
**Date:** 2026-05-31
**Discovery:** The Claude Code Build Directive named five deliverables, but three already existed at depth (the landing = pulse-experience.html, opportunities, and the exact 525-line travel-discovery file it referenced). Building literal duplicates (esp. pulse-os-landing.html) would have violated the SUPREME Constitution (no duplication, evolve-not-replace). The mandatory gap-analysis gate is precisely where this conflict surfaced and was resolved — alias, don't duplicate; enhance the existing landing; build only the genuinely-missing files (destination, host).
**Lesson:** When a new directive overlaps existing work, the gap analysis is not a formality — it is the mechanism that prevents a well-intentioned directive from causing duplication debt. The directive is law; the Constitution is supreme law; the gap analysis reconciles them.

## DISC-021 — The ⌘K Search Is the Cross-File Connective Tissue
**Date:** 2026-05-31
**Discovery:** The global ⌘K search (debuted in pulse-destination.html) does more than search — its categorised results (Opportunities · Destinations · Businesses · Insights) link across every cinematic file and into the live app, making the separate chapters feel like one navigable intelligence network. It is the lightest-weight way to turn a set of pages into a system.
**Lesson:** A shared search layer is the cheapest, highest-leverage way to make a multi-file experience cohere. Build it once, reuse it everywhere.
