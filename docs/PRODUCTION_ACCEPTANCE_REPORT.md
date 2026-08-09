# PULSE Pilot Release 1 — Production Acceptance Report

**Status: INCOMPLETE — awaiting migration to production Supabase project**
**Tested against:** Local build only (localhost:3001)
**Production project:** `aqsegdzptwbyrasblrch` — migrations not yet applied
**Date:** 2026-08-09

A locally built screen is not a PASS. Tests will be re-run against the production HTTPS URL once migrations are applied.

---

## Acceptance Test Results

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Magic-link sign-in | BLOCKED | Requires prod Supabase |
| 2 | Organisation creation | BLOCKED | Requires prod Supabase |
| 3 | Property creation | BLOCKED | Requires prod Supabase |
| 4 | Owner/admin invitation | BLOCKED | Requires prod Supabase |
| 5 | Room type and room creation | BLOCKED | Requires prod Supabase |
| 6 | Rate creation | BLOCKED | Requires prod Supabase |
| 7 | Reservation creation | BLOCKED | Requires prod Supabase |
| 8 | Reservation persistence after refresh/logout | BLOCKED | Requires prod Supabase |
| 9 | Reservation modification and cancellation | BLOCKED | Requires prod Supabase |
| 10 | Room assignment | BLOCKED | Requires prod Supabase |
| 11 | Rejection of overlapping reservation | BLOCKED | DB constraint in 0009; requires prod |
| 12 | Check-in and check-out | BLOCKED | UI built; requires prod |
| 13 | Housekeeping/maintenance task creation | BLOCKED | Schema and UI built; requires prod |
| 14 | File upload and authorised retrieval | BLOCKED | Buckets exist; storage policies require prod |
| 15 | Organisation A staff permissions | BLOCKED | RLS built; requires prod |
| 16 | Organisation B denied access to Org A data | BLOCKED | RLS built; requires prod |
| 17 | Unauthenticated private-route denial | PASS (local) | Middleware verified redirecting to /login |
| 18 | Mobile-width operation | BLOCKED | Requires prod URL for full test |
| 19 | Direct-route refresh | BLOCKED | Requires prod |
| 20 | Audit-event creation | BLOCKED | Schema + policies built; requires prod |

---

## Code Audit Results

| Area | Finding | Status |
|------|---------|--------|
| SECURITY DEFINER functions missing search_path | Found in 0001 | FIXED in 0009 |
| online_checkins SELECT USING(true) | Information disclosure | FIXED in 0009 |
| Missing RLS on booking_holds | Deny-all default | FIXED in 0009 |
| Missing RLS on reservation_rooms | Deny-all default | FIXED in 0009 |
| Missing RLS on room_status_log | Deny-all default | FIXED in 0009 |
| Missing RLS on channel_room_mapping | Deny-all default | FIXED in 0009 |
| reservation_audit missing INSERT policy | Audit writes blocked | FIXED in 0009 |
| Folio trigger balance bug | Wrong column reference | FIXED in 0009 |
| No DB-level overlap prevention | Concurrent race possible | FIXED in 0009 (EXCLUDE + trigger) |
| No org INSERT policy | Onboarding blocked | FIXED in 0009 |
| Trigger functions missing search_path | Good practice | FIXED in 0009 |

---

## This report will be updated when:
1. `supabase link --project-ref aqsegdzptwbyrasblrch` completes
2. `supabase db push` applies migrations 0001–0009
3. Vercel env vars updated to `aqsegdzptwbyrasblrch`
4. All 20 acceptance tests re-run against production HTTPS URL
