# PULSE OS — Product Constitution

## Strategic centre

**Opportunity** is the atomic object. The product exists to answer whether a specific business should participate in a specific opportunity, why, under what conditions, and what to do next.

The core intelligence lifecycle:
```
Signal → Structure → Verify → Score → Recommend → Decide → Participate → Activate → Measure → Graph
```

Every feature must either strengthen this lifecycle or feed evidence into it.

## Launch hierarchy

1. **PULSE Core** — Opportunity Intelligence (Radar, Workspace, Viability, Participation, Outcomes, Graph)
2. **Farmstead Hospitality** — Tenant #1; proof environment; four properties; operational workflows supply evidence into PULSE Core
3. **Travel & Discovery** — lightweight demand/proximity/destination signal feeder; must not displace Opportunity journey
4. **Broader layers** (institutional, sovereign, Physical Ops) — roadmap; not launch scope

## What the product must never do

- Display fabricated production metrics — any simulation or test record must be clearly labelled and removable
- Treat a clean TypeScript build as proof — auth, persistence and tenant isolation must be independently evidenced
- Collapse Opportunity into generic CRUD — ranking, evidence, explainable scoring, confidence, decision and activation are required
- Treat the architecture diagram as a literal dashboard wireframe

## Acceptance rule

A feature is not complete until it:
1. Passes a Playwright E2E test against the production URL
2. Passes RLS isolation across at least two tenant accounts
3. Works at 375px mobile width with no horizontal overflow
4. Has no serious axe accessibility violations

A TypeScript build pass is necessary but not sufficient.

## No-rebuild rule

This is a running production system. Preserve:
- All working routes, auth flows, database tables, migrations, RLS policies
- All Hospitality OS functionality
- All PULSE Core functionality
- Existing GitHub, Supabase (`aqsegdzptwbyrasblrch`) and Vercel (`pulse-dfe2/pulse-os`) projects
- Production domain: `https://pulse-os-steel.vercel.app`

Do not create a new repository, application, Supabase project, Vercel project, design system, or parallel set of pages. Patch surgically.

## Tenant safety rule

Every organisation-scoped SELECT, INSERT, UPDATE and DELETE must be tested across at least two tenants. RLS is the defence at database level, not UI level.

## Design character

Institutional, low-noise, evidence-led. Dark theme. Current tokens:
- Background: `#020912` | Surface: `#08111f` | Border: `white/10`
- Accent: `#C6A66B` | Text: `#f1f5f9` / `#9BA7B8`

Improve information hierarchy, spacing, empty/loading/error states and mobile layout. Do not add decorative motion, generic AI gradients, or wholesale visual redesigns.

## Secrets rule

- Service-role key is server-only; never in `NEXT_PUBLIC_` env vars; never in browser bundles
- No token, key, magic link or credential committed to the repo or shown in logs/screenshots
- `.env.local` is gitignored; Vercel stores production secrets

## Database rule

All schema changes go through numbered migration files in `supabase/migrations/`. Never make undocumented production-only schema changes. Current migrations: 0001–0015, all applied to `aqsegdzptwbyrasblrch`.

## CI/CD

Push to `main` → GitHub Actions builds with pnpm from repo root → `vercel build` (local in runner) → `vercel deploy --prebuilt`. The lock file (`pnpm-lock.yaml`) lives at the monorepo root, not in `apps/web`.

## Key references

- Production URL: `https://pulse-os-steel.vercel.app`
- Supabase project: `aqsegdzptwbyrasblrch`
- Vercel project: `pulse-dfe2/pulse-os`
- GitHub repo: `WoodroffeVentures/pulse-os`
- App directory: `apps/web/app/(app)/`
- OrgProvider context: `apps/web/lib/context/org-context.tsx`
