# PULSE OPPORTUNITIES — DOCTRINE
*The strategic centre of PULSE. Source of truth for the Opportunities experience and the production Opportunity/Viability/Exchange engines. Extracted from the original PULSE concepts (PROJECT_BRIEF, AI_PROMPTS, the viability API route, types.ts, the blueprint) and the Constitution. Authored 2026-05-31.*

---

## WHY THIS IS THE CENTRE
Everything else generates **signals**. PULSE Opportunities converts signals into **participation** → **outcomes** → **intelligence** → **opportunity**. It is the reason the platform exists. It is **not** a module, menu item or dashboard.

## THE SIX QUESTIONS PULSE OPPORTUNITIES ANSWERS
(from the original PROJECT_BRIEF — the long-term verified-infrastructure questions)
1. What is the opportunity?
2. Who should participate?
3. Is the business operationally and commercially **ready**?
4. What outcome is expected?
5. What action must happen next?
6. What measurable result occurred?

## THE MOAT (restated)
The **Verified Opportunity Participation Graph** — a relational, evidence-based model of businesses, assets, opportunities, readiness, participation and **measured outcomes**. Every interaction strengthens it. It cannot be scraped or bought — only earned.

## THE OPPORTUNITY LIFECYCLE (canonical)
```
Signal → Discovery → Validation → Trust → Viability → Participation → Outcome → Impact
```
PULSE does not merely *identify* opportunities — it **scores, validates, matches participants, tracks outcomes, and measures impact.**

---

## THE VIABILITY ENGINE (from the original `api/ai/viability` route + blueprint)
**Inputs (weighted evidence signals):** Demand · Trust · Capability · Readiness · Capacity · Location · Seasonality · Risk · Partner Availability · Commercial Potential.
**Blueprint viability dimensions (retained):** visibility · operational readiness · district fit · audience fit · review strength · compliance readiness · financial readiness.

**Scoring (original logic):** base 50 + sum of weighted signals, clamped 0–100.
**Recommendation states:**
- score ≥ 75 → **Participate** ( = "join" )
- score 55–74 → **Conditional** ( = "join_with_conditions" )
- score < 55 → **Do Not Participate** ( = "hold" / "not_suitable" )
**Confidence band:** ≥ 4 evidence signals → ~0.82; fewer → ~0.58. (More verified evidence = higher confidence.)

**Outputs:** Viability Score · Recommended Participants · Expected ROI · Risk Band · Confidence Band · **Next Best Action**.
**Standing risks always surfaced:** data may be incomplete until Google Business Profile is verified; **human approval required before any public campaign commitment** (Constitution Art. VI).

## THE OPPORTUNITY OBJECT (from types.ts)
`title · opportunity_type · district/region · value_band · start_date · end_date · status` — plus, per the Exchange: proposed_by · target_participants · required_partners · expected_revenue · required_investment · trust_score · readiness_score · strategic_fit · participation_model · JV_potential · commercial_model · timeline · evidence · next_action.

## OPPORTUNITY TYPES (14)
Tourism Activation · Seasonal Campaign · JV Opportunity · Accommodation Partnership · Event Opportunity · Restaurant Promotion · Community Initiative · Experience Bundle · Investment Opportunity · Destination Project · Supplier Opportunity · Infrastructure Opportunity · Government Programme · Regional Development.

## OPPORTUNITY STATUSES
Draft · Submitted · Under Review · Needs Validation · Approved · Open for Partners · Matched · Negotiating · JV Proposed · Active · Completed · Rejected · Archived.

## THE EXCHANGE (not a marketplace)
PULSE Exchange **matches opportunity with participation based on evidence, trust, viability and strategic fit — never advertising.** It recommends participation, not listings. Example pairings: tour operator→property group · restaurant→hotel · investor→tourism project · guide→accommodation network · municipality→local business community.

## GOOGLE INTELLIGENCE LAYER (the missing evidence source)
Verified **public** signals are evidence — claims are not enough. Sources: Google Business · Maps · Reviews · Categories · Search Trends · Profile Completeness · Website Presence · Operating Hours · Media · Performance Signals. Feeds Trust + Viability. (Constitution: Evidence Decides.)

## PARTICIPATION INTELLIGENCE
The most important question is not "what opportunity exists?" but **"who should participate?"** PULSE continuously learns who delivers outcomes, who creates value, and who to match next — the compounding core of the graph.

## ECONOMIC IMPACT (the tourism-board / government story)
Every opportunity should create **measurable** outcomes: Visitor Spend Influenced · Businesses Activated · Jobs Supported · Campaign Revenue · Regional Impact · Tourism Contribution · Local Procurement · Community Participation.

## FARMSTEAD'S ROLE HERE
Production Environment #001 — proves Operations, Reviews, Discovery, Trust, Readiness, Guest Journeys, Opportunity Matching, Revenue Intelligence. **Farmstead is not the platform; Farmstead proves the platform.** It appears as proof only *after* the opportunity story is established — never first.

## SCALE
Property → Portfolio → District → Region → Province → Country → Economic Network. Future verticals: Hospitality (first node) · Travel · Tourism · Events · Economic Development · Agriculture · Investment · Government · Community Activation. Hospitality is only the first node; the Opportunity Graph scales infinitely.

---

## BUILD MANDATE
- The Opportunities experience is a **standalone cinematic scrolltelling chapter** of the PULSE Experience (Layer 1) — it must feel like the *centre of the ecosystem*, not a feature page.
- File: `pulse-opportunities.html`, reusing the Experience design system + motion engine. Entrances from: brand site Opportunity section, homepage Opportunities lens, and the operational app's opportunity page.
- The Viability Engine section must reflect the **real** engine logic above (weighted signals → score → recommendation/confidence/risk/next action), demonstrably — ideally lightly interactive.
- AI invisible (PULSE Insight/Recommendation/Opportunity). Outputs draft-first; human approval before public commitment. Demo/preview honestly labelled where not yet live (Art. IX).
- Passes the Six-Question Build Gate on Opportunity, Participation, Trust, Intelligence, Economic visibility and the graph — all six.
