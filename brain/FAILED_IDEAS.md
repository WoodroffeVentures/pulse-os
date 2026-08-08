# FAILED IDEAS
*What was tried, why it failed, and what was learned.*

---

## FAIL-001 — Firebase as Production Backend
**Date:** 2026-05-16  
**What was tried:** Consider Firebase Firestore for the PULSE OS production backend, consistent with the Wholey AI OS sibling project.  
**Why it failed:** Firestore's document model creates fundamental limitations for the participation graph, which requires relational joins across entities (guest ↔ booking ↔ property ↔ vendor ↔ opportunity ↔ outcome). Complex queries that are trivial in PostgreSQL require denormalisation and duplication in Firestore, creating consistency risks at scale.  
**What was learned:** The choice of database is not about familiarity — it is about the data model the platform ultimately needs. Platform phase 6 (Opportunity Intelligence) depends on relational graph traversal that PostgreSQL handles natively.  
**Outcome:** Supabase chosen. This is the right call.

---

## FAIL-002 — Trying to Build Phase 5-7 UI Before Phase 1 Operations Work
**Date:** 2026-05-22  
**What was tried:** The HTML prototype was extended to include Destination Intelligence, Opportunity Intelligence, and Tourism Board demo dashboards before the Phase 1 operational modules were complete.  
**Why it failed (partially):** The Phase 5-7 modules were built as locked demo pages, which is appropriate. But the time spent on them meant some Phase 1 pages (Guides, AI Brief) were initially stubs when they should have been built first.  
**What was learned:** Always complete the active phase fully before adding demo content for future phases. The ordering matters for both product quality and stakeholder confidence.  
**Outcome:** All stubs resolved. Phase governance rules added to PRODUCT_DOCTRINE.md.

---

## FAIL-003 — Designing Social Media as a Scheduler
**Date:** 2026-05-20  
**What was tried:** Initial conception of the Social Media page was a content calendar with scheduling functionality — similar to Buffer or Hootsuite.  
**Why it failed:** A social media scheduler is a commodity. Every competitor has one. It contributes nothing unique to the moat. It also creates a content creation burden on the operator without providing intelligence.  
**What was learned:** Social content must be derived from platform intelligence (positive reviews, booking gaps, local events, vendor highlights). The platform should tell operators what to post and why — not just give them a place to schedule posts they had to write themselves.  
**Outcome:** Social Media page redesigned as "Social Growth Engine" with AI content generation tied to platform data sources. Every post suggestion must trace back to a platform data signal.

---

## FAIL-004 — Simultaneous Claude + ChatGPT Development
**Date:** 2026-05-25  
**What was tried:** Using ChatGPT to add pages to the HTML prototype in parallel with Claude development, to speed up development.  
**Why it failed:** ChatGPT had no context about prior architectural decisions, design system choices, or product doctrine. It changed the primary accent color from blue to gold, used different CSS class names, and created a second types.ts file. The short-term speed gain created technical debt and required multiple reconciliation sessions.  
**What was learned:** Context continuity is more valuable than parallel throughput. The Brain protocol was designed to solve this — all sessions start by reading the brain, ensuring coherent decision-making across sessions.  
**Outcome:** Brain protocol established. All development through Claude only.
