# PULSE OS — Migration Inventory

*Written 08 Aug 2026. Purpose: a portable reference for pulling specific pieces of this repo into another project without touching or overwriting anything here. This file is additive only — nothing else in this repo was modified to produce it.*

---

## 0. Read this first — shared-infrastructure risk

`supabase/.temp/linked-project.json` shows this repo's Supabase CLI is linked to:

```
ref: mrqgapyzsfgiolfqxyqk
name: WoodroffeVentures's Project
```

**That is the same Supabase project currently backing the separate "1-Platform Command Centre" pilot** (set up earlier today, same session, different repo). The app code here (`apps/web/.env` per the audit docs) still points at `placeholder.supabase.co`, so nothing has actually been pushed from this repo into that live database yet — but the CLI link exists, which means an unguarded `supabase db push` from *this* directory would apply PULSE OS migrations (tables like `organizations`, `properties`, `bookings`, `guests`, `opportunities`, etc.) into the **same Postgres instance** already running 1-Platform's schema (`organisations`, `incidents`, `work_orders`, `sites`, ...).

There's no naming collision between the two schemas today (different table names), but they'd sit in the same database, same `public` schema, sharing `auth.users`. Before running any migration from either repo again:
- confirm which project you actually intend to target (`supabase status` / `cat supabase/.temp/linked-project.json`);
- consider whether PULSE OS should get its own separate Supabase project rather than sharing one with an unrelated pilot.

---

## 1. Repo snapshot

- Path: `/Users/woodroffeventures/Woodroffe Ventures/Pulse OS`
- Git: single commit (`d4d8e41 Initial commit: PULSE OS production foundation`), branch `main`, clean working tree
- Package manager: pnpm workspace (`pnpm-workspace.yaml`), Node ≥20.11
- Structure: monorepo — `apps/web` (Next.js 15 app) + `supabase/` (migrations, seed, edge functions) + a set of standalone cinematic HTML files at repo root

## 2. Tech stack (apps/web)

- Next.js 15, TypeScript, Tailwind
- `@supabase/*` client libraries present but not yet connected to a real project
- `@tanstack/*`, `@hookform`, `@radix-ui` for UI/forms
- `@anthropic-ai` SDK present in `lib/ai/gateway.ts` (103 lines) — AI gateway pattern, no key configured
- Design tokens: `--black`, `--gold`, `--teal`, `--purple` — consistently applied per the existing audit

## 3. Database schema — what's defined vs. what's live

**Nothing is live.** All of the below exists only as unapplied SQL migration files (`supabase/migrations/`), never run against a real Postgres instance.

| Migration | Contents |
|---|---|
| `0001_pulse_core.sql` | Core tables: `organizations`, `organization_members`, `properties`, `property_users`, `units`, `guests`, `bookings`, `tasks`, `reviews`, `business_profiles`, `opportunities`, `participation_records`, `viability_analyses`, `ai_recommendations`, `ai_action_logs`, `event_log`, `notifications`, `integration_accounts`, `integration_sync_logs`, `local_attractions`, `social_campaigns`, `finance_records`, `workflows` |
| `0002_farmstead_platform.sql` | Farmstead-specific extensions (conditional `create table if not exists`, ~11 tables) |
| `0003_farmstead_mvp.sql` | Farmstead MVP tables (~11 tables, conditional) |
| `0004_jv_accounts.sql` | JV account tables (~3 tables, conditional) |
| `0005_reconcile.sql` | Reconciliation pass across the above (~24 conditional table statements — likely idempotency/cleanup, not all new tables) |
| `seed.sql` | Farmstead demo tenant seed — well-structured, ready to run once a project is connected |

RLS, auth, and tenant isolation: **none implemented** — confirmed "MISSING" in both existing audit docs, since there's no live database to enforce policies against.

## 4. Edge functions (`supabase/functions/`)

Three functions exist, deploy status unknown (never pushed to a live project):
- `ai-gateway/index.ts` (34 lines) — server-side AI call wrapper
- `nightly-brief/index.ts` — scheduled summary generator
- `ical-sync/index.ts` — calendar sync adapter

## 5. App routes / modules — reusable vs. not

Condensed from `docs/IMPLEMENTATION_STATUS.md` (full table there is more detailed):

**Genuinely solid, worth reusing as a pattern:**
- AI gateway pattern in `lib/ai/gateway.ts` — risk-tiered, approval-required, draft-first design. Same spirit as the adapter-with-capability-flags pattern built into 1-Platform's `lib/integrations/`.
- Viability scoring engine (`/api/ai/viability`) — deterministic base-50 + weighted signals, no AI key required, returns real (if synthetic) scores. Pure logic, portable.
- `/api/ai/tasks` — same deterministic-fallback approach.
- `/board-demo` route — full tourism-board presentation flow (Command Overview, Opportunity Pipeline, Business Profiles, Guest Intent, 7-step presentation mode) — working demo, self-contained, Drakensberg-branded synthetic data.
- Cinematic HTML files (`pulse-experience.html`, `pulse-travel-discovery.html`, `pulse-destination.html`, `pulse-host.html`, `pulse-os-landing.html`) — static, single-file, no backend dependency. Safe to lift wholesale as marketing/presentation assets.
- Supabase migration SQL (§3 above) — schema design is sound even though unapplied; reusable as a starting schema for a hospitality/opportunity-matching domain if that's relevant to the target project.

**Not worth migrating as-is:**
- `lib/mock-data.ts` and `drakensberg-demo.ts` — synthetic data, useful only as a shape reference.
- `/opportunities` and `/participation` app routes — one shows a locked-module placeholder, the other literally renders "MODULE DORMANT" text. No real logic to extract.
- Any `.env.example` values — all placeholders, several provider integrations (Google Places, WhatsApp, Google Business Profile) are stubbed with no real credentials anywhere.
- `pulse-os-final.html`, `pulse-os-preview.html`, `pulse-os-review.html` — explicitly marked STALE/superseded by `pulse-os-v2.html` in the existing audit.

## 6. Recommended migration approach

1. **Don't share the Supabase project.** If the target project needs persistence, provision its own Supabase project rather than reusing `mrqgapyzsfgiolfqxyqk` (see §0).
2. **Copy, don't symlink or cross-import.** Treat this repo as read-only source material — copy specific files (e.g. `lib/ai/gateway.ts`, the viability engine, individual migration table definitions) into the target repo and adapt naming/conventions there, rather than creating a live dependency between the two codebases.
3. **Take schema pieces selectively.** The 5 migration files aren't a clean single schema — `0002`–`0005` are incremental patches with conditional `create table if not exists` statements. If reusing table designs, read the final reconciled shape in `0005_reconcile.sql` rather than replaying all 5 files.
4. **Take the pattern, not the mock data.** The AI-gateway and viability-engine *designs* are worth reusing; the data they operate on (`mock-data.ts`, `drakensberg-demo.ts`) is not.

## 7. What this document intentionally does not do

It does not modify, run, or apply anything in this repo — no migrations were pushed, no `.env` files were touched, no existing docs were overwritten. Everything above was gathered by reading existing files (`docs/IMPLEMENTATION_STATUS.md`, `docs/CURRENT_STATE_AUDIT.md`, migration SQL, `package.json`, `.env.example`, and directory listings).
