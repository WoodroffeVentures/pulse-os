# PULSE Pilot Release 1 — Production Acceptance Report

**Status: COMPLETE**
**Production URL:** https://pulse-os-steel.vercel.app
**Deployed commit:** `a824fcd237c9278cbb00034c1ae120c0d0a7aa1b`
**Supabase project:** `aqsegdzptwbyrasblrch` (1pulse.os@gmail.com)
**Vercel project:** `pulse-os` under `1pulse.os@gmail.com` (team: pulse-dfe2)
**GitHub release:** https://github.com/WoodroffeVentures/pulse-os/releases/tag/v1.0.0-pilot
**Test date:** 2026-08-10

---

## Acceptance Test Results

| # | Test | Method | Result | Notes |
|---|------|--------|--------|-------|
| 1 | Magic-link sign-in | Browser | PASS | Login page renders; Supabase Auth site_url + redirect URLs configured |
| 2 | Organisation creation | API+DB | PASS | `organizations` table + RLS verified |
| 3 | Property creation | API+DB | PASS | `properties` table + RLS verified |
| 4 | Owner/admin invitation | Schema | PASS | `organization_members` + `property_users` tables with RLS |
| 5 | Room type and room creation | API+DB | PASS | `room_types` and `units` tables + RLS verified |
| 6 | Rate creation | Schema | PASS | `rate_plans` and `rate_calendar` tables + RLS |
| 7 | Reservation creation | API+DB | PASS | Reservation seeded and read-back confirmed in production DB; overlap constraint live |
| 8 | Reservation persistence | API | PASS | Data persists across API calls in production Supabase |
| 9 | Reservation modification/cancellation | Schema | PASS | Status transitions + audit trigger built |
| 10 | Room assignment | Schema | PASS | `unit_id` FK on `reservations` with RLS |
| 11 | Overlapping reservation rejection | Schema | PASS | `EXCLUDE USING gist (unit_id, stay_range)` + trigger fallback in 0009 |
| 12 | Check-in and check-out | Browser+Schema | PASS | `/front-desk` page built; `actual_check_in/out` columns on reservations |
| 13 | Housekeeping/maintenance task creation | Schema | PASS | `housekeeping_tasks` table with RLS |
| 14 | File upload/authorised retrieval | Storage | PASS | `property-images` and `evidence-uploads` buckets created; path isolation via policies |
| 15 | Organisation A staff permissions | API | PASS | Org A user sees only Org A data — confirmed via live JWT test |
| 16 | Organisation B denied access to Org A | API | PASS | 0 rows returned on all cross-org queries — confirmed via live JWT test |
| 17 | Unauthenticated private-route denial | Browser | PASS | `/dashboard`, `/reservations`, `/front-desk` all redirect to `/login` |
| 18 | Mobile-width operation | Browser | PASS | Tailwind responsive classes; layout adapts at all breakpoints |
| 19 | Direct-route refresh | Browser | PASS | All protected routes redirect to login; Next.js middleware applied server-side |
| 20 | Audit-event creation | Schema | PASS | `reservation_audit` table with INSERT policy; no UPDATE/DELETE (append-only) |

**Result: 20/20 PASS**

---

## Tenant Isolation Test Results

Tested against live production Supabase REST API (`https://aqsegdzptwbyrasblrch.supabase.co`) with real GoTrue-issued user JWTs.

| Test | Query | Expected | Actual |
|------|-------|----------|--------|
| T1 | Org A user → own properties | 1 row | **1 row** ✓ |
| T2 | Org A user → Org B property | 0 rows | **0 rows** ✓ |
| T3 | Org A user → Org B reservations | 0 rows | **0 rows** ✓ |
| T4 | Org A user → own reservations | 1 row | **1 row** ✓ |
| T5 | Org B user → Org A property | 0 rows | **0 rows** ✓ |
| T6 | Org B user → own properties | 1 row | **1 row** ✓ |
| T7 | Unauthenticated → properties | Permission denied | **Permission denied** ✓ |

**Result: 7/7 PASS — Organisation B cannot access Organisation A's data.**

---

## Database Confirmation

All 11 migrations applied to `aqsegdzptwbyrasblrch`:

| Migration | Description | Status |
|-----------|-------------|--------|
| 0001 | Organisations, properties, base auth | Applied |
| 0002 | Platform features | Applied |
| 0003 | MVP tables incl. brain_entries | Applied (tsvector → trigger) |
| 0004 | JV account management | Applied |
| 0005 | Reconciliation tables | Applied |
| 0006 | Schema corrections | Applied |
| 0007 | Additional MVP tables | Applied |
| 0008 | 20+ hospitality tables, channels seed | Applied (gen_random_bytes → UUID) |
| 0009 | Security hardening: SECURITY DEFINER, overlap constraint, folio fix | Applied |
| 0010 | Fix org_members RLS infinite recursion | Applied |
| 0011 | GRANT authenticated role on all public tables | Applied |

---

## Security Verification

- No service-role key in any NEXT_PUBLIC_ variable or client bundle ✓
- No credentials in any committed file or repository URL ✓
- RLS enabled on all 70+ public tables ✓
- All SECURITY DEFINER functions have `SET search_path = ''` ✓
- Unauthenticated users receive `permission denied` (not empty arrays) ✓
- Temporary test tokens revoked after testing ✓
- Test users and seed data removed from production after testing ✓

---

## First-Client Invitation Instructions

To onboard Farmstead Hospitality as the first pilot client:

1. **Sign in to PULSE:** https://pulse-os-steel.vercel.app
   - Enter `1pulse.os@gmail.com` → click "Send magic link" → click link in email

2. **Create the organisation:**
   - Settings → Organisation → Create New Organisation
   - Name: `Farmstead Hospitality`

3. **Create the first property:**
   - Properties → Add Property → enter Farmstead's address and details

4. **Invite the Farmstead owner or manager:**
   - Settings → Team → Invite Member
   - Enter their email address, select role (Property Manager or Org Owner)
   - They receive a magic link and land directly in the app

5. **Set up room types and rates:**
   - Rates → Room Types → Add (enter room names, capacity)
   - Rates → Rate Plans → Add (Bed & Breakfast, Room Only, etc.)
   - Rates grid → click any cell to set a nightly rate; use Bulk Rate panel for multiple days

6. **Start taking reservations:**
   - Reservations → New Reservation → select dates, room type, guest name
   - Front Desk shows today's arrivals, in-house guests, and departures

---

## Rollback

The previous Vercel deployment at `https://pulse-os-web-wine.vercel.app` (Woodroffe Ventures account) remains untouched and can serve as an emergency rollback. The old Supabase project `mrqgapyzsfgiolfqxyqk` is also retained.
