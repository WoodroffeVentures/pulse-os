# PULSE — THE ELEVEN INTELLIGENCE DOMAINS
*Canonical domain model (from the Constitution). Each domain + audience + capabilities + current build status. Updated 2026-05-31.*

Status legend: 🟢 Live/Built · 🟡 Prototyped (UI exists, no backend) · 🔵 Demo/Preview · ⚪ Vision only

---

## 1. PULSE HOST — Hospitality Operations Intelligence
**Audience:** Hotels, lodges, guest houses, Airbnb hosts, farm stays, property groups.
**Capabilities:** Property readiness · guest journeys · reviews · housekeeping · maintenance · revenue gaps · communications · staff ops · SOPs · playbooks · local discovery · trust signals.
**Status:** 🟡 Fully prototyped in `pulse-os-v2.html` (Farmstead). Next.js scaffolded, not wired. **Farmstead = deployment #001.**

## 2. PULSE TRAVEL — AI Travel Intelligence
**Audience:** Guests, travellers, planners, operators.
**Capabilities:** AI itineraries · dynamic & competitive pricing · experience matching · route/travel planning · destination discovery · personalised packages · last-minute deals · direct-booking opportunities.
**Status:** 🟡 AI Getaway Engine prototyped (DEC-007). Pricing/route intelligence not started.

## 3. PULSE DISCOVERY — Verified Discovery Intelligence
**Audience:** Guests, properties, tourism boards, businesses.
**Capabilities:** Google Business/Places intelligence · activities · restaurants · guides · attractions · events · suppliers · services.
**Lifecycle:** Suggested → Validated → Approved → Preferred. **Owner control always wins.**
**Status:** 🟡 UI built (Local Discovery + Trust formula). Google Places + scoring Edge Function pending.

## 4. PULSE TRUST — Trust Intelligence
**Audience:** Internal (operators, the platform).
**Capabilities:** Business validation · reputation analysis · review intelligence · trust scoring · risk assessment · verification workflows · evidence trails.
**Score factors:** Google reviews · recency · velocity · website presence · contact verification · owner validation · guest feedback.
**Rule:** Scores visible **internally only**, never public.
**Status:** 🟡 UI + scoring model defined (ADR-010). Edge Function pending. (Phase 2 Active, DEC-006.)

## 5. PULSE OPPORTUNITIES — Opportunity Intelligence  ⭐ most important
**Purpose:** Discover · validate · activate · measure opportunities.
**Capabilities:** Partnership discovery · JV matching · tourism activations · seasonal campaigns · investment/property/event/vendor/community/government opportunities.
**Rule:** Everything scored (High Potential / Validate First / Needs Partners / Too Early / Low Fit / Watchlist).
**Status:** 🟡 Opportunity Exchange + scoring prototyped on brand site + homepage lens (DEC-013/014/015).

## 6. PULSE EXCHANGE — Opportunity Exchange (not a marketplace)
**Purpose:** Connect participants; **recommend participation, not listings.**
**Examples:** Tour operator↔property · investor↔destination project · tourism board↔local businesses · restaurant↔guest house · event organiser↔accommodation group.
**Status:** 🟡 JV workflow + example opportunities prototyped (DEC-014). No live matching backend.

## 7. PULSE DESTINATION — Destination Intelligence
**Audience:** Tourism boards, DMOs, municipalities, development agencies, government.
**Capabilities:** Visitor intelligence · business participation · opportunity density · economic visibility · campaign intelligence · destination health · regional performance · participation rates · activation tracking.
**Message:** See Opportunity · Activate Participation · Measure Impact.
**Status:** 🔵 Destination Command demo (Phase 5 Preview) on brand site + homepage lens.

## 8. PULSE NETWORK — The Participation Graph
**Purpose:** Connect everything — every entity a node, every interaction a relationship, all of it intelligence.
**Entities:** Guests, businesses, properties, restaurants, activities, experiences, events, tourism boards, communities, investors, government.
**Status:** 🟡 Visualised (canvas) on brand site + homepage. Real graph DB/logic pending (PostgreSQL relational, DEC-001).

## 9. PULSE INTELLIGENCE — Ask PULSE
**Purpose:** The intelligence layer (NOT a chatbot). Query the network; receive evidence-led answers.
**Outputs:** PULSE Insight · PULSE Recommendation · PULSE Opportunity · PULSE Alert. AI providers never exposed.
**Status:** 🟡 Interactive Ask PULSE prototyped (7 prompts, participants + JV + metrics). Pre-composed; live retrieval pending.

## 10. PULSE IMPACT — Economic Impact Intelligence
**Purpose:** Measure outcomes — the government/economic story.
**Capabilities:** Visitor spend influenced · businesses activated · jobs supported · economic participation · tourism revenue · community impact · ESG · inclusion metrics.
**Status:** 🔵 Economic Impact lens on homepage (illustrative). Real measurement pending participation graph.

## 11. PULSE SOVEREIGN — National Intelligence
**Purpose (vision only):** Regional & national tourism intelligence · economic corridors · investment intelligence · national participation graph.
**Status:** ⚪ Vision only. **Never scoped, estimated, or built** until explicit founder authorisation (Constitution Art. X).

---

## DOMAIN ↔ SURFACE MAP
| Surface | Domains expressed |
|---|---|
| `pulse-os-v2.html` (Farmstead Live) | HOST, DISCOVERY, TRUST, OPPORTUNITIES (partial), INTELLIGENCE |
| `pulse-experience.html` (brand prototype) | All 1–10 as narrative; SOVEREIGN as direction |
| `apps/web` homepage (7 lenses) | NETWORK, INTELLIGENCE, OPPORTUNITIES, DESTINATION, PLATFORM, HOST(Farmstead), IMPACT |
| `apps/web/(app)` operational pages | HOST (production target, not yet wired) |

## BIGGEST GRAPH-STRENGTHENING GAPS (per Six-Question Gate)
1. **The Participation Graph is not yet real** (Domain 8) — it is visualised, not stored. This is the moat; it must become a real relational model with live nodes/edges.
2. **Trust scoring is not a live Edge Function** (Domain 4) — the emerging moat isn't compounding yet.
3. **Production HOST not wired to Supabase** (Domain 1) — no real operational data feeding the graph.
These three, in order, are the highest-leverage builds. (See NEXT_ACTIONS.md.)
