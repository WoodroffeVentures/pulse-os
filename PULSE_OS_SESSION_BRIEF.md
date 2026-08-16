# PULSE OS — Comprehensive Session Brief
*For second-opinion review. Generated 2026-08-12.*

---

## 1. What Is This Project?

**Pulse OS** is a hospitality intelligence platform built for African/emerging-market boutique hotel operators. It sits on top of standard property management (front desk, reservations, housekeeping, maintenance, guests, reviews) and adds a "PULSE CORE" layer of business intelligence:

- **Businesses** — structured profiles of the operator's own business entities
- **Opportunity Radar** — ranked display of external opportunities (grants, tenders, JVs, incentives)
- **Viability** — structured AI-assisted business viability assessments per opportunity
- **Participation & JVs** — tracking of active applications and joint-venture agreements
- **Outcomes** — results recorded against participation records
- **Participation Graph** — visual relationship map of entities and opportunities
- **Reports** — cross-domain export layer

**Current pilot client:** Farmstead Hospitality (South Africa)

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5.23 (App Router) |
| Styling | Tailwind CSS, custom dark theme (#020912 bg, #C6A66B gold accent) |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| Hosting | Vercel (project: `pulse-dfe2/pulse-os`, team `team_bmShIyxlSgIMefEiJPqsKipu`) |
| Package manager | pnpm monorepo (`apps/web` contains the Next.js app) |
| CI/CD | GitHub Actions → Vercel CLI |
| Icons | lucide-react |
| Repo | github.com/WoodroffeVentures/pulse-os |

---

## 3. Repository Structure

```
/Woodroffe Ventures/Pulse OS/        ← repo root
  pnpm-lock.yaml                     ← monorepo lock file (MUST stay at root)
  pnpm-workspace.yaml
  apps/
    web/                             ← Next.js app
      .vercel/project.json           ← links to Vercel project (no credentials)
      app/
        (auth)/                      ← sign-in / sign-up pages
        (app)/                       ← authenticated shell
          layout.tsx                 ← OrgProvider wraps all app routes
          dashboard/page.tsx         ← home dashboard
          properties/
          front-desk/
          reservations/
          rates/
          housekeeping/
          maintenance/
          guests/
          reviews/
          guest-guides/
          businesses/
          opportunities/
            page.tsx                 ← Opportunity Radar (ranked list)
            [id]/page.tsx            ← Opportunity Workspace (6-tab detail)
          viability/
          participation/
          outcomes/
          graph/
          reports/
          settings/
      components/
        layout/
          sidebar.tsx                ← navigation with PULSE CORE section
      lib/
        context/org-context.tsx      ← OrgProvider / useOrg() hook
        supabase/
          client.ts                  ← browser Supabase client
          server.ts                  ← server Supabase client (never in browser)
  supabase/
    migrations/                      ← 0001 → 0015 applied in order
  .github/
    workflows/
      deploy.yml                     ← CI/CD (see Section 7)
```

---

## 4. Authentication & Multi-Tenancy

**Auth:** Supabase Auth (email/password). All routes under `(app)/` are protected by the OrgProvider.

**OrgProvider (`lib/context/org-context.tsx`)** exposes:
- `orgId` — the organization UUID (used in all RLS-filtered queries)
- `orgName`, `orgPlan`, `role`, `user`, `signOut`, `loading`

**RLS pattern:** Every table has `organization_id`. Policies enforce:
```sql
auth.uid() = user_id   -- or join through org_users
organization_id = (select organization_id from org_users where user_id = auth.uid())
```

**Critical rule:** The service-role key NEVER reaches the browser. All browser queries go through the anon-key Supabase client with RLS enforced.

---

## 5. Database (Supabase Project: `aqsegdzptwbyrasblrch`)

**Production URL:** `https://aqsegdzptwbyrasblrch.supabase.co`

### Migration history (0001–0015, all applied)

| # | Description |
|---|---|
| 0001 | Initial schema (organizations, org_users, profiles) |
| 0002 | Properties table |
| 0003 | Reservations |
| 0004 | Front desk / check-in |
| 0005 | Housekeeping |
| 0006 | Maintenance |
| 0007 | Guests |
| 0008 | Reviews |
| 0009 | Business profiles (`businesses` table) |
| 0010 | Opportunities table (core columns) |
| 0011 | Viability analyses |
| 0012 | Participation records + property_users |
| 0013 | Fix property_users insert policy (idempotent — DROP IF EXISTS added) |
| 0014 | Outcomes table |
| 0015 | Opportunity radar metadata (new columns on opportunities) |

### Key tables

**`opportunities`**
```
id, organization_id, title, opportunity_type, district, province,
description, value_band, start_date, end_date,
eligibility jsonb, evidence_requirements jsonb, status, created_at,
-- Added in 0015:
readiness_score numeric,
urgency text CHECK (urgency IN ('critical','high','normal','low')) DEFAULT 'normal',
owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
next_decision text
```

**`viability_analyses`** — AI-structured assessments per opportunity per business
**`participation_records`** — applications/JVs with milestones, conditions, decision badge
**`outcomes`** — results tied to participation records
**`business_profiles`** — structured business profiles with `verified_signals jsonb`

---

## 6. Key Pages Implemented

### `/opportunities` — Opportunity Radar
- Cards ranked by urgency: critical → high → normal → low, then by `created_at DESC`
- Filter tabs: All / Draft / Under Review / Open / Active / Completed
- Each card shows: urgency badge, value band, district/province, journey progress (viability count, participation count), next-decision alert
- "Add Opportunity" modal with urgency field
- Click card → `/opportunities/[id]`

### `/opportunities/[id]` — Opportunity Workspace (6 tabs)

| Tab | Content |
|---|---|
| Brief | Structured eligibility fields from jsonb, description, dates |
| Fit & Scoring | Viability analyses with factor breakdown, ScoreBar, ConfidenceBadge |
| Participants | Participation records with decision badge, conditions, milestones |
| Activation | Aggregate milestones across all participation records |
| Outcomes | Org-level outcomes with evidence state |
| Evidence | Viability evidence ledger (met/unmet factors with weights) |

- Inline next-decision editing: saves to `opportunities.next_decision`
- Back button → `/opportunities`

### `/dashboard` — Home Dashboard
Existing panels preserved; two new panels added:
- **Top Opportunities** — top 3 by urgency, with urgency badge, readiness score, next-decision alert, link to workspace
- **Evidence Health** — profiles count by evidence state, confidence explanation

### Sidebar (`components/layout/sidebar.tsx`)
Three nav sections:
- **OPERATIONS:** Dashboard, Properties, Front Desk, Reservations, Rates, Housekeeping, Maintenance, Guests, Reviews, Guest Guides
- **PULSE CORE:** Businesses, Opportunity Radar, Viability, Participation & JVs, Outcomes, Participation Graph
- **PLATFORM:** Reports, Settings

---

## 7. CI/CD Pipeline

### GitHub Actions (`/.github/workflows/deploy.yml`)

Triggers: push to `main` + manual `workflow_dispatch`

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3 (version: 9)
      - uses: actions/setup-node@v4 (node 20, pnpm cache)
      - run: pnpm install --frozen-lockfile          # runs from repo root (lock file location)
      - run: npx vercel build --token ... --prod     # local build in GHA runner
      - run: npx vercel deploy --prebuilt --token .. --prod  # upload pre-built output
```

**Why this pattern:** `pnpm-lock.yaml` lives at the monorepo root, not in `apps/web`. Previous workflow used `working-directory: apps/web` which caused Vercel's remote build to fail with `ERROR Headless installation requires a pnpm-lock.yaml file`. Fix: build locally in GHA, upload pre-built artifact — Vercel never runs its own install.

### Vercel project config
- Project JSON: `apps/web/.vercel/project.json`
- Production URL: `https://pulse-os-steel.vercel.app`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel dashboard (not committed)
- `VERCEL_TOKEN` secret set in GitHub repo secrets

---

## 8. Environment Variables

| Variable | Where set | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel dashboard + `.env.local` | `https://aqsegdzptwbyrasblrch.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel dashboard + `.env.local` | Anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel dashboard only | Never in browser, never committed |
| `VERCEL_TOKEN` | GitHub repo secret | Used by GHA deploy workflow |

`.env.local` is gitignored and never committed.

---

## 9. Known Issues / Pending Work

### Completed this session
- [x] Switched broken Supabase project (`mrqgapyzsfgiolfqxyqk`) → healthy project (`aqsegdzptwbyrasblrch`)
- [x] Applied all 15 migrations to production database
- [x] Updated Vercel env vars via REST API
- [x] Deployed Opportunity Radar, Workspace, and dashboard panels
- [x] Migration 0015 applied (urgency, readiness_score, owner_user_id, next_decision)
- [x] Fixed GitHub Actions deploy (pnpm-lock.yaml not found error)
- [x] Rotated exposed Vercel token (old token revoked, new token set in GH secrets)

### Still outstanding (gap analysis items)
- [ ] **Two-tenant isolation test** — verify Org A cannot read Org B data (RLS, storage, API, reports, graph)
- [ ] **Mobile 375px** — verify all pages render correctly at mobile width
- [ ] **Atomic journey proof** — run full Farmstead workflow: signal → opportunity → business → assessment → participation → milestone → outcome → graph
- [ ] **Adversarial auth test** — attempt to access other org's data with a valid but wrong-org JWT
- [ ] **Production sign-in verification** — live test of Opportunity Radar and Workspace with real Farmstead data

---

## 10. Design System

**Colors (dark theme only — no light mode)**
- Background: `#020912`
- Surface: `#08111f`
- Border: `white/10`
- Accent/gold: `#C6A66B`
- Text primary: `#f1f5f9`
- Text secondary: `#9BA7B8`
- Danger: `#ef4444`

**Typography:** System sans-serif stack via Tailwind defaults

**Component conventions:**
- All pages are `'use client'` components using `useOrg()` for `orgId`
- Data fetching via Supabase client in `useEffect` with parallel `Promise.all`
- No external UI library (no shadcn, no Radix) — all components are inline Tailwind

---

## 11. Security Notes

- RLS enforces org isolation at the database level for all tables
- Service-role key is server-only (Vercel server-side env, never `NEXT_PUBLIC_`)
- Anon key is safe for browser (RLS-protected)
- One security incident this session: Vercel token was briefly pasted in plain text in chat — that token was immediately revoked and replaced
- No API keys, tokens, or secrets are committed to the repository

---

## 12. Supabase CLI

```bash
# Linked to production project
/usr/local/Cellar/supabase/2.113.0/bin/supabase

# Apply new migration
supabase db push --project-ref aqsegdzptwbyrasblrch

# Check migration status
supabase migration list --project-ref aqsegdzptwbyrasblrch
```

Logged in as: `1pulse.os@gmail.com`

---

*End of brief. For full conversation transcript: `/Users/woodroffeventures/.claude/projects/-Users-woodroffeventures-Woodroffe-Ventures/a82fe010-3bb3-4c7a-b139-e7ccebe0e248.jsonl`*
