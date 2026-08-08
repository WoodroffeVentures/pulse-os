# ARCHITECTURE DECISIONS
*Technical choices, rationale, and tradeoffs. The engineering record of PULSE OS.*

---

## ADR-001 — pnpm Monorepo Structure
**Date:** 2026-05-16  
**Decision:** Use pnpm workspace monorepo with `apps/web` as the primary package.  
**Rationale:** Allows future addition of `apps/mobile`, `apps/admin`, `packages/ui`, `packages/db` without repository restructuring. pnpm is faster than npm and yarn for monorepo use cases.  
**Tradeoff:** Slightly more complex initial setup. Justified by future flexibility.  
**Status:** Active.

---

## ADR-002 — Next.js 15 App Router
**Date:** 2026-05-16  
**Decision:** Use Next.js 15 with App Router (not Pages Router).  
**Rationale:** App Router enables React Server Components, which reduces client bundle size for data-heavy pages. Supabase SSR helper is designed for App Router. Route Groups allow clean separation of `(app)` authenticated routes from `(auth)` and public routes.  
**Tradeoff:** App Router has a steeper learning curve and some ecosystem libraries lag behind. Accepted.  
**Status:** Active.

---

## ADR-003 — Supabase RLS as Primary Security Layer
**Date:** 2026-05-16  
**Decision:** All tenant data isolation enforced at the database level via Supabase Row Level Security policies. No tenant isolation at the application layer.  
**Rationale:** Application-layer isolation is fragile — a single coding error exposes tenant data. Database-layer RLS is enforced for every query, regardless of application logic. This is the only acceptable approach for a multi-tenant platform handling guest PII.  
**Implementation:** Every tenant-scoped table has `organization_id` column. RLS policies use `auth.uid()` to look up the user's `organization_id` and filter all reads/writes to their tenant.  
**Tradeoff:** RLS policies are complex to write and test. Required investment in test coverage for cross-tenant isolation.  
**Status:** Active.

---

## ADR-004 — Event Bus: PostgreSQL Tables → Kafka Evolution Path
**Date:** 2026-05-16  
**Decision:** Phase 1 uses PostgreSQL `platform_events` table as the event bus. Phase 3+ evolves to Kafka/NATS.  
**Rationale:** Supabase Realtime already provides pub/sub over PostgreSQL. Using PostgreSQL events avoids introducing Kafka complexity in Phase 1. The canonical event schema is designed to be Kafka-compatible when migration occurs.  
**Canonical event schema:**
```json
{
  "event_id": "uuid",
  "event_type": "booking.created",
  "organization_id": "uuid",
  "property_id": "uuid",
  "actor_type": "user | system | ai | integration",
  "actor_id": "uuid",
  "correlation_id": "uuid",
  "causation_id": "uuid",
  "payload": {},
  "metadata": {},
  "idempotency_key": "string",
  "timestamp": "ISO8601"
}
```  
**Status:** Active. Migration path documented.

---

## ADR-005 — AI Gateway Abstraction Layer
**Date:** 2026-05-18  
**Decision:** All AI calls route through a single gateway abstraction. No domain module calls a model provider directly.  
**Implementation:** `apps/web/lib/ai/gateway.ts` + `supabase/functions/ai-gateway/index.ts`  
**Rationale:** Provider abstraction enables cost routing (use cheapest capable model per task), prevents vendor lock-in, enforces audit logging, and allows risk-level gating.  
**Task-to-model routing:**

| Task | Model | Risk Level |
|------|-------|------------|
| Daily brief, trust analysis, policy review | Claude Sonnet | Medium-High |
| Social captions, summaries, descriptions | Gemini Flash / DeepSeek | Low |
| Classification, tagging, sentiment | Rules + cheap model | Low |
| Review responses | Claude Sonnet (approval-gated) | High |
| Opportunity analysis | Claude Sonnet | High |

**AI cost target:** Below 15% of platform revenue.  
**Status:** Active. Gateway stub exists. Full implementation pending.

---

## ADR-006 — iCal Sync as Primary OTA Integration (Phase 1)
**Date:** 2026-05-16  
**Decision:** Phase 1 OTA integration via iCal feed polling. Full API integration (Airbnb Connect, Booking.com XML) deferred to Phase 2.  
**Rationale:** iCal sync requires no OTA API approval, is universally supported, and can be implemented in days. It provides the booking data needed for the operations layer immediately. Full API integration (messaging sync, rate sync) requires OTA partnership programs and months of approval process.  
**Tradeoff:** iCal only syncs bookings — not messages, rates, or reviews. Accepted for Phase 1.  
**Jackals Rest iCal sources active:**  
- Booking.com: confirmed syncing  
- Airbnb: confirmed syncing  
- LekkeSlaap: configured, not yet synced  
**Status:** Active. Edge Function stub exists (`ical-sync/index.ts`). Full parsing implementation pending.

---

## ADR-007 — Two Types Files (Technical Debt)
**Date:** 2026-05-25  
**Decision:** Two types files co-exist: `lib/types.ts` and `lib/types/index.ts`. This is a known conflict requiring resolution.  
**Context:** Parallel development sessions created both. TypeScript resolves without errors because both export compatible types.  
**Resolution plan:** Consolidate into `lib/types/index.ts`. Remove `lib/types.ts`. Update all imports. Target: next dedicated refactoring session.  
**Risk:** Low — types are compatible. No runtime impact.  
**Status:** Technical debt. See TECHNICAL_DEBT.md.

---

## ADR-008 — HTML Prototype as Track A (Offline Bridge)
**Date:** 2026-05-16  
**Decision:** The HTML prototype (`pulse-os-v2.html`) serves as Track A: the offline HTML bridge for immediate Farmstead use and as the UX specification for production development.  
**The Track A → Track B convergence plan:**
1. HTML prototype is the source of UX truth
2. Next.js pages are implemented to match the HTML prototype's UX
3. Real Supabase data replaces mock data
4. When Track B matches Track A in functionality, Track A is retired
**Status:** Active. Track A far ahead of Track B. Convergence is the primary 90-day technical priority.

---

## ADR-009 — Property Readiness Engine as Computed Score
**Date:** 2026-05-20  
**Decision:** Property readiness is a computed score derived from task states, maintenance issues, housekeeping status, and upcoming bookings. It is not a manually entered value.  
**Readiness inputs:**
- Pre-arrival clean complete: 25 points
- Hot water tested: 15 points
- WiFi functional: 10 points
- Welcome pack prepared: 15 points
- Inspection complete: 20 points
- No open critical maintenance: 15 points (−8 per open critical issue)
**Score thresholds:**
- 90–100: Ready (teal)
- 75–89: Minor items pending (gold)
- 60–74: Attention needed (amber)
- Below 60: Not ready (red)
**Status:** Implemented in HTML prototype as static display. Production implementation requires Supabase RLS function.

---

## ADR-010 — Trust Score as Edge Function
**Date:** 2026-05-31  
**Decision:** Trust Intelligence scoring runs as a Supabase Edge Function, consuming Google Places API data and internal signal sources.  
**Score inputs (0–100):**
- Google review volume (max 25 points)
- Review consistency — no sudden drops (max 20)
- Contact verification — phone + website (max 15)
- Address confirmation via Google Maps (max 10)
- Review recency (max 15)
- PULSE guest feedback outcomes (max 15)  
**Update frequency:** Re-score when new reviews detected, monthly baseline refresh.  
**Status:** Architecture defined. Implementation pending. Priority: Phase 2 activation.
