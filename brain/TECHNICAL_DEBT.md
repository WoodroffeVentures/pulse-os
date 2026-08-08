# TECHNICAL DEBT
*Known debt items, severity, and remediation priority. Updated: 2026-05-31.*

---

## Severity Scale
- **P0 — Critical:** Blocks production deployment or creates security risk
- **P1 — High:** Significantly degrades quality or creates architectural risk
- **P2 — Medium:** Reduces code quality or creates maintenance burden
- **P3 — Low:** Cosmetic or minor inefficiency

---

## TD-001 — Dual Types Files
**Severity:** P2  
**Location:** `apps/web/lib/types.ts` AND `apps/web/lib/types/index.ts`  
**Issue:** Two type definition files co-exist. Created by parallel Claude/ChatGPT development sessions. TypeScript compiles without errors because types are compatible, but the duplication creates maintenance confusion.  
**Resolution:** Consolidate all types into `lib/types/index.ts`. Remove `lib/types.ts`. Update all imports. Estimated effort: 2 hours.  
**Risk if unresolved:** Future type additions may go into wrong file, causing inconsistency.  
**Status:** Open. Target: next refactoring session.

---

## TD-002 — Edge Function Stubs Not Implemented
**Severity:** P1  
**Location:** `supabase/functions/ai-gateway/index.ts`, `ical-sync/index.ts`, `nightly-brief/index.ts`  
**Issue:** All three Edge Functions are stubs. The production application has no real AI execution, no automated iCal sync, and no nightly brief generation.  
**Resolution:** Implement in priority order: (1) ical-sync, (2) ai-gateway, (3) nightly-brief. See ROADMAP.md Week 5-8.  
**Risk if unresolved:** The Next.js app is non-functional for its core value propositions.  
**Status:** Open. P1 in 90-day roadmap.

---

## TD-003 — No Auth Flow in Next.js App
**Severity:** P0  
**Location:** `apps/web/`  
**Issue:** The Next.js application has no login/signup/session management. `supabase/client.ts` and `server.ts` exist but auth is not wired to any page. There is no protected route middleware.  
**Resolution:** Implement Supabase Auth with email + Google OAuth. Add middleware for route protection. Create login/signup pages. Estimated effort: 1 day.  
**Risk if unresolved:** Production deployment is impossible without authentication.  
**Status:** Open. P0 — must be resolved before any production deployment.

---

## TD-004 — HTML Prototype vs Next.js Divergence
**Severity:** P1  
**Location:** `pulse-os-v2.html` vs `apps/web/`  
**Issue:** The HTML prototype has 27 fully-implemented pages. The Next.js app has basic scaffolding. There is a significant implementation gap that will widen with every HTML prototype update.  
**Resolution:** Systematic page-by-page porting from HTML prototype to Next.js with real Supabase data. See ROADMAP.md Week 3-4.  
**Risk if unresolved:** HTML prototype becomes the de-facto product (unacceptable — it has no backend, no auth, no real data).  
**Status:** Open. Strategy: port highest-daily-value pages first.

---

## TD-005 — Farmstead Hardcoded Data in HTML Prototype
**Severity:** P2  
**Location:** `pulse-os-v2.html` (mock data throughout)  
**Issue:** The HTML prototype contains hardcoded Farmstead-specific data (property names, guest names, iCal URLs, staff names). This is appropriate for a demo but must not carry over to the production app.  
**Resolution:** All production data comes from Supabase. Mock data in the HTML prototype is intentional — it serves as the UX specification. When Next.js pages are built, they pull real data.  
**Risk if unresolved:** None for production — the issue is architectural awareness, not a code bug.  
**Status:** Managed. No immediate action required for HTML prototype.

---

## TD-006 — No Error Boundaries in Next.js Pages
**Severity:** P2  
**Location:** `apps/web/app/`  
**Issue:** Next.js pages have no error.tsx boundaries. A Supabase query failure will result in an unhandled error page.  
**Resolution:** Add error.tsx and loading.tsx to each route group. Estimated effort: 2 hours.  
**Risk if unresolved:** Poor user experience when errors occur in production.  
**Status:** Open. Target: before first production deployment.

---

## TD-007 — No Test Coverage
**Severity:** P2  
**Issue:** Zero automated tests exist. No unit tests, no integration tests, no RLS cross-tenant isolation tests.  
**Resolution:** Priority order: (1) RLS cross-tenant isolation tests (security), (2) iCal parsing unit tests, (3) Trust Score algorithm unit tests.  
**Risk if unresolved:** RLS misconfiguration could silently expose tenant data.  
**Status:** Open. P2. Security tests should precede first production deployment.

---

## TD-008 — Stale HTML Preview Files
**Severity:** P3  
**Location:** `pulse-os-preview.html`, `pulse-os-final.html`, `pulse-os-review.html`  
**Issue:** Three outdated HTML files exist alongside the current `pulse-os-v2.html`. They create confusion about which file is authoritative.  
**Resolution:** Archive or delete `pulse-os-preview.html`, `pulse-os-final.html`, `pulse-os-review.html`. Keep only `pulse-os-v2.html` as the authoritative HTML prototype.  
**Risk if unresolved:** Developer confusion about which file is current.  
**Status:** Open. P3. Low urgency.

---

## TD-009 — Platform Pages Appended Outside the Scroll Container
**Severity:** P2
**Location:** `pulse-os-v2.html` — `#page-getaway`, `#page-trial`, `#page-trust`, `#page-channels`, `#page-opportunity`, `#page-destination`
**Issue:** These six pages are direct children of `#main` (overflow:hidden), siblings of the scrollable `#content` rather than children of it. They are therefore clipped at the viewport fold and cannot scroll (see DISC-008). `#page-landing` was given a full-screen own-scroll workaround (DEC-011), but the other six still inherit the defect — any content below the fold on those pages is unreachable.
**Resolution:** Relocate the six platform page blocks to inside `#content` (where the 20 operational pages already live and scroll correctly). This is the correct structural fix. Estimated effort: 1 hour (block move + verify navigation).
**Risk if unresolved:** getaway/trial/trust/channels/opportunity/destination pages clip long content. Low impact today (most fit in a viewport) but will worsen as content grows.
**Status:** Open. P2.
