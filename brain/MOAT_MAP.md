# MOAT MAP
*Current, emerging, future, and strategic moat tracking. Updated: 2026-05-31.*

---

## Moat Hierarchy

```
CURRENT MOAT          → Verified Local Discovery
EMERGING MOAT         → Trust Intelligence  
FUTURE MOAT           → Verified Participation Graph
STRATEGIC MOAT        → Opportunity Intelligence Network
SOVEREIGN MOAT        → Economic Intelligence Infrastructure
```

---

## Current Moat: Verified Local Discovery

**Status:** Building. UI complete. Backend pending.

**What it is:** Every local business recommended to a guest through PULSE has been trust-scored, validated, and approved by the operator. No competitor in the hospitality intelligence space offers a trust-verified, operator-curated local discovery layer.

**Why it's defensible:** 
- The verification work is done by the operator community, not centrally
- The Trust Score compounds with each new data signal
- Guest feedback loops improve accuracy over time
- The data cannot be scraped — it's tied to real interactions

**What it needs to strengthen:**
- Trust scoring algorithm running as real Edge Function (pending)
- Google Places integration for auto-discovery (pending)
- Operator validation workflow in production (pending)
- Guest feedback connected back to vendor scores (pending)

**Current state:** Implemented as UI concept in HTML prototype. Trust Intelligence page shows scoring concept and validation queue.

---

## Emerging Moat: Trust Intelligence

**Status:** UI defined. Algorithm architecture documented. Not yet implemented.

**What it is:** A proprietary scoring model that evaluates every discovered business on evidence-based signals. Low-cost for PULSE to compute, high-value for operators and guests.

**Score inputs:**
1. Google review volume (max 25)
2. Review consistency — no sudden drops (max 20)
3. Contact verification — phone + website (max 15)
4. Address confirmation (max 10)
5. Review recency (max 15)
6. PULSE guest feedback + tracked outcomes (max 15)

**Why it compounds:** Every guest interaction with a discovered business generates a feedback signal. Over time, PULSE Trust Scores become more accurate than any individual review platform because they aggregate signals across multiple sources and incorporate real-world interaction outcomes.

**What it needs:**
- Edge Function implementation (ADR-010)
- Google Places API integration
- Guest feedback collection post-interaction
- Dynamic re-scoring on new signals

---

## Future Moat: Verified Participation Graph

**Status:** Architecture visible in schema. Not yet generating real data.

**What it is:** The relational network of: who participates in what, under what readiness conditions, and with what outcomes. This is the data asset that makes PULSE uniquely valuable to tourism boards, municipalities, and governments.

**How it builds:**
- Every booking creates a participation record (guest ↔ property)
- Every vendor referral creates an edge (operator ↔ vendor)
- Every opportunity matched creates a participation event
- Every review connected to a booking creates an outcome signal

**Why no competitor can replicate it:** The graph requires real-world operational adoption at scale. It cannot be scraped, purchased, or synthesised. It must be earned through daily use over time. By the time a competitor understands the value, PULSE will have months of lead on the graph.

**Current state:** Schema supports it. `platform_events` table captures operational events. Graph logic not yet implemented.

---

## Strategic Moat: Opportunity Intelligence Network

**Status:** Demo only. Phase 6 roadmap.

**What it is:** The system that routes opportunities (tourism campaigns, group bookings, seasonal activations) to the operators most likely to succeed, based on their PULSE Score. 

**Why it's the ultimate moat:** Operators stay on PULSE not just because it's useful today, but because their PULSE Score determines which opportunities they qualify for tomorrow. This creates switching costs that compound over time — leaving PULSE means losing your participation history and score.

**What it needs:**
- Participation Graph must be active (Phase 4+)
- Opportunity builder and lifecycle management
- PULSE Score algorithm
- Opportunity ↔ Operator matching algorithm

---

## Sovereign Moat: Economic Intelligence Infrastructure

**Status:** Vision only. Phase 7.

**What it is:** Government-grade reporting that lets economic development agencies measure the real impact of tourism investments, track SME participation, and allocate resources based on verified outcomes.

**Why it matters:** Governments currently have no reliable way to measure tourism sector economic participation. PULSE becomes the infrastructure that provides this — and once embedded in government procurement, creates extraordinary switching costs.

---

## Moat Risk Assessment

| Moat | Risk | Mitigation |
|------|------|------------|
| Verified Local Discovery | Competitors add "trust" labels | PULSE scores are transparent, evidence-based, and update dynamically — labels are not |
| Trust Intelligence | Google/TripAdvisor build competing trust layer | PULSE trust is operator-curated + guest-feedback — not just review aggregation |
| Participation Graph | OTAs build participation data | OTA data is channel-specific; PULSE graph is cross-channel and operation-connected |
| Opportunity Network | Govt builds their own platform | PULSE is a private layer that governments contract, not compete with |

---

## Moat-Strengthening Actions (Priority Order)

1. **Implement Trust Intelligence Edge Function** — every day this is not live is a day the emerging moat isn't growing
2. **Wire guest feedback to vendor scores** — close the Trust loop with real interaction data
3. **Connect every review to the Ecosystem Graph** — reviews are the richest signal source available right now
4. **Activate iCal sync** — every booking in Supabase is a participation graph node
5. **Launch Staff Hub mobile** — operational adoption generates the daily signals that build the graph
