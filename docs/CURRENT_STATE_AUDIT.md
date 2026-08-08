# PULSE OS — Current State Audit
*Forensic audit completed: 2026-08-08. Auditor: Claude Code (Chief Product Officer role).*

---

## Audit Summary

The repository contains two parallel tracks that have never been integrated:

1. **A Next.js 15 operational app** (`apps/web`) — functional UI shell for Farmstead Hospitality property management, but backed entirely by in-memory mock data. No real database, no authentication, no live integrations.

2. **A set of cinematic HTML prototypes** (7 single-file HTML files) — high-quality presentation material for PULSE OS as an Opportunity Intelligence Network, but entirely static with no backend.

These two tracks do not link to each other in any meaningful way. The Next.js app has no public-facing story. The HTML files have no working backend.

---

## Next.js App (`apps/web`) — Capability Status

| Capability | Status | Real or Demo | Notes |
|---|---|---|---|
| Framework (Next.js 15, TypeScript, Tailwind) | WORKING | Real | Builds and runs |
| Sidebar navigation | WORKING | Real | All routes render |
| Dashboard (KPIs, tasks, bookings) | MOCKED | Demo | All data from `lib/mock-data.ts` |
| Properties list and detail | MOCKED | Demo | 4 Farmstead properties |
| Bookings | MOCKED | Demo | 5 fake bookings relative to today |
| Tasks | MOCKED | Demo | 7 fake tasks |
| Housekeeping | PARTIAL | Demo | Page exists, likely mocked |
| Maintenance | PARTIAL | Demo | Page exists, likely mocked |
| Works | PARTIAL | Demo | Page exists |
| Guests | MOCKED | Demo | 5 guest records |
| Reviews | MOCKED | Demo | 3 reviews |
| AI Brief | PARTIAL | Demo | References AI gateway |
| Brain / Knowledge | MOCKED | Demo | 5 static entries |
| Guest Guides | PARTIAL | Demo | Page exists |
| Opportunities | MOCKED | Demo | Shows LockedModulePage placeholder |
| Participation | BROKEN | Demo | Shows "MODULE DORMANT" text only |
| Destination | MOCKED | Demo | Shows LockedModulePage |
| Local Ecosystem | MOCKED | Demo | Shows LockedModulePage |
| Growth | MOCKED | Demo | Shows LockedModulePage |
| Visibility | MOCKED | Demo | Shows LockedModulePage |
| Economic Intelligence | MOCKED | Demo | Shows LockedModulePage |
| Admin | PARTIAL | Demo | Page exists |
| Settings | PARTIAL | Demo | Page exists |
| Reports | PARTIAL | Demo | Page exists |
| Map | PARTIAL | Demo | Page exists |
| Viability page | PARTIAL | Demo | Page exists |
| Board Demo route | MISSING | — | Not built |
| Onboarding | PARTIAL | Demo | Page exists |
| Authentication | MISSING | — | No auth implemented anywhere |
| Supabase (real DB) | MISSING | — | Placeholder credentials only |
| AI Gateway (Anthropic) | PARTIAL | — | Code wired, no API key in env |
| Google Places integration | PARTIAL | — | Adapter exists, no real key |
| iCal sync | PARTIAL | — | Adapter exists, not connected to real feeds |
| POPIA / privacy controls | MISSING | — | Not implemented |
| Tenant isolation / RLS | MISSING | — | No DB connected |
| Audit trail | MISSING | — | Not implemented |
| Export / PDF reports | MISSING | — | Not implemented |
| Mobile responsiveness | PARTIAL | — | Desktop-first layout |
| Docker deployment | PARTIAL | — | Dockerfile exists, untested |

---

## HTML Cinematic Files — Status

| File | Status | Purpose | Links to App? |
|---|---|---|---|
| `pulse-os-landing.html` | WORKING | 4-pillar hub (12KB, pure CSS) | Links to other HTML files only |
| `pulse-experience.html` | WORKING | Full cinematic PULSE story (108KB) | No |
| `pulse-opportunities.html` | PARTIAL | Opportunities chapter — needs JV/venue rebuild | No |
| `pulse-travel-discovery.html` | WORKING | Discovery layer (45KB, 14 sections) | No |
| `pulse-destination.html` | WORKING | Destination intelligence (39KB) | No |
| `pulse-host.html` | WORKING | Host global intelligence (46KB) | No |
| `pulse-os-v2.html` | WORKING | Farmstead operational HTML mock (488KB, 27 pages) | Self-contained |
| `pulse-os-final.html` | STALE | Superseded by v2 | — |
| `pulse-os-preview.html` | STALE | Superseded | — |
| `pulse-os-review.html` | STALE | Superseded | — |

---

## Database / Infrastructure

| Asset | Status | Notes |
|---|---|---|
| Supabase credentials | PLACEHOLDER | `https://placeholder.supabase.co` — not a real project |
| Migration files (3 SQL) | EXISTS | Not run against any real DB |
| `seed.sql` | EXISTS | Well-structured, not applied anywhere |
| `docker-compose.yml` | EXISTS | May allow local Postgres — untested |
| `supabase/functions/` | EXISTS | Edge functions — status unknown |
| `.env.example` | EXISTS | Present at root but not at apps/web level |

---

## Critical Gaps vs Tourism-Board Pilot Requirements

1. **No authentication** — anyone can access any route
2. **No real database** — all data vanishes on reload
3. **No opportunity flow** — the core product (create → match → viability → accept/decline) is not implemented
4. **No board dashboard** — the tourism-board workspace doesn't exist
5. **No Southern Drakensberg data** — demo is Farmstead (JoyWood Farm, SA Midlands), not Drakensberg
6. **No business onboarding** — no way for a business to claim/create a profile
7. **No presentation mode** — no `/board-demo` route
8. **No export/PDF** — no reports capability
9. **`pulse-opportunities.html` doesn't reflect JV/venue original concept** — pending rebuild

---

## What Is Genuinely Solid

- Next.js 15 app structure and routing — well-organised
- Mock data is realistic and internally consistent (ZAR, SA names, real Google Maps URLs)
- AI gateway pattern is sound (risk-tiered, approval-required, draft-first)
- Viability scoring engine (deterministic base-50 + signal weights) is correct
- Design system (`--black`, `--gold`, `--teal`, `--purple`) is consistently applied
- Cinematic HTML files are high-quality presentation assets
- Supabase SQL migrations are well-structured (ready to run)
- Brain governance documents are comprehensive
