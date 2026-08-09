# PULSE Pilot Release 1 — Scope

**Branch:** `pilot/release-1`
**Commit at freeze:** `1813f82`
**Date:** 2026-08-09

---

## Release-Blocking Workflows (must pass before launch)

| # | Workflow | Status |
|---|----------|--------|
| 1 | Magic-link authentication | BLOCKED — requires Supabase prod project migration |
| 2 | Organisation creation | BLOCKED — same |
| 3 | Owner/admin invitation | BLOCKED — same |
| 4 | Property creation and editing | BLOCKED — same |
| 5 | Room type and room creation | BLOCKED — same |
| 6 | Rate-plan and dated-rate creation | BLOCKED — same |
| 7 | Availability search | BLOCKED — same |
| 8 | Reservation creation, modification, cancellation | BLOCKED — same |
| 9 | Room assignment | BLOCKED — same |
| 10 | Overlapping-reservation prevention | BUILT — DB exclusion constraint + trigger in 0009 |
| 11 | Check-in and check-out | BUILT — front-desk page; actions persist via reservations table |
| 12 | Front-desk arrivals, departures, in-house view | BUILT — /front-desk page |
| 13 | Housekeeping/maintenance task creation | BUILT — /housekeeping page; tasks table with RLS |
| 14 | Property image/evidence upload | BUILT — storage buckets created; path isolation required |
| 15 | Live dashboard using real production data | BLOCKED — prod project migration required |
| 16 | Logout, login, session persistence | BUILT — Supabase Auth middleware |
| 17 | Tenant isolation between two organisations | BUILT — RLS on all tables; verified in audit |
| 18 | Audit records for important actions | BUILT — reservation_audit table with INSERT policy |

**Single external blocker for all BLOCKED items:** Supabase migrations 0001–0009 not yet applied to `aqsegdzptwbyrasblrch`.

---

## Scope Freeze

Everything below this line is explicitly deferred to post-launch backlog. It does not block Pilot Release 1.

- Certified OTA connections (Booking.com, Airbnb, Expedia) — requires 8–12 week external certification
- Automated payment processing (Peach Payments / Paystack) — requires merchant account setup
- AI image recognition and auto-tagging
- Guest Lite portal
- Business Connect / opportunity intelligence (schema preserved, not surfaced)
- Destination and tourism-board reporting
- Advanced rate strategy automation
- Online check-in guest portal
- Full NightsBridge parity checklist items beyond the 18 above
- WhatsApp / SMS communications

---

## Architecture Notes

- Stack: Next.js 15.5.23, TypeScript, Tailwind CSS, Supabase Postgres + Auth + Storage
- Monorepo: pnpm workspaces, apps/web
- Production Supabase project: `aqsegdzptwbyrasblrch` (1pulse.os@gmail.com)
- Old project `mrqgapyzsfgiolfqxyqk` is retained as rollback until acceptance tests pass
- Vercel project: `prj_kxZlZOrHXEOMOMFocYcDlE54wlh6` (pulse-os-web)
- Production URL: https://pulse-os-web-wine.vercel.app (domain to be confirmed after env var update)
