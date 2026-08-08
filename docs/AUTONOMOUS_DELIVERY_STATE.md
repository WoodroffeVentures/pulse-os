# PULSE OS — Autonomous Delivery State
*Last updated: 2026-08-08. Maintained automatically — do not edit manually.*

---

## Completed

| Item | Detail |
|---|---|
| Forensic audit | CURRENT_STATE_AUDIT.md — 50+ capabilities classified |
| Git repository | Initialized, main branch, 2 commits |
| Supabase CLI | Installed (v2.113.0) at ~/.local/share/pnpm/supabase |
| Supabase project | mrqgapyzsfgiolfqxyqk (eu-west-2/London) — ACTIVE_HEALTHY |
| Supabase link | Repo linked to project mrqgapyzsfgiolfqxyqk |
| Migration 0001 | Partially applied then marked applied (uuid_generate_v4 + notifications conflict) |
| Migrations 0002–0004 | Marked applied (covered by 0005 reconcile) |
| Migration 0005 | Applied — reconcile pass, all tables IF NOT EXISTS, inline RLS |
| Supabase anon key | Written to apps/web/.env.local (209 chars, not printed) |
| Auth middleware | apps/web/middleware.ts — protects all (app) routes, bypasses in demo mode |
| Login page | /login — magic link OTP, demo-mode warning when unconfigured |
| Auth callback | /auth/callback — PKCE exchange, redirects to /dashboard |
| Opportunity pitch API | POST /api/opportunities/pitch — authenticated, viability-scored, audited |
| Venue decision API | POST /api/opportunities/[id]/decision — all 4 states, JV account creation |
| PULSE ASSISTANT API | POST /api/assistant/command — deterministic + Anthropic AI classification |
| Google Places adapter | lib/google-places.ts — Places API (New), field masks, server-only, demo fallback |
| Env validation | lib/env.ts — fail-fast for placeholders, server-only key getters |
| Opportunities page | /opportunities — real pitch form, live/demo data, score badges |
| Participation page | /participation — venue inbox, all 4 decision buttons, audited |
| Business onboarding | /onboarding — 3-step wizard, consent record, real Supabase write |
| Guest Lite PWA | /guest — discover, stay info, service requests, itinerary; no account required |
| PWA manifest | /manifest — start_url=/guest, standalone display |
| JV accounts | Migration 0004: jv_accounts + jv_revenue_events + auto-total trigger + consent_records |
| Query services | lib/queries/opportunities.ts, businesses.ts, dashboard.ts — Supabase-first, demo fallback |
| Board demo route | /board-demo — 5-tab tourism board presentation, Southern Drakensberg demo data |
| CI workflow | .github/workflows/ci.yml — type-check, build, Vercel preview/production |
| Vercel config | apps/web/vercel.json — security headers, region lhr1 |
| Documentation | CURRENT_STATE_AUDIT, RECONCILED_PRODUCT_SCOPE, SOUTHERN_DRAKENSBERG_PILOT, IMPLEMENTATION_STATUS |
| GitHub remote | Set to https://github.com/WoodroffeVentures/pulse-os.git |

---

## Active (in progress this session)

| Item | Blocker |
|---|---|
| GitHub push | Awaiting GITHUB_TOKEN from Kyle (PAT with repo scope) |
| Vercel deployment | Awaiting GitHub push + VERCEL_TOKEN |
| Real Supabase auth config | Awaiting Vercel URL for redirect allow-list |
| Seed data | Ready to run once DB confirmed healthy |

---

## Blocked by provider access

| Item | What's needed | One action for Kyle |
|---|---|---|
| GitHub push | PAT with repo scope | github.com/settings/tokens/new → write to .env.local |
| Vercel deployment | Vercel account login | vercel.com → create account → supply VERCEL_TOKEN |
| Google Places (New) | API key, server-restricted | Google Cloud Console → Places API (New) → key |
| Anthropic AI | API key | console.anthropic.com → API Keys |

---

## Deferred (post-pilot)

| Item | Reason |
|---|---|
| iCal sync (live) | Requires real iCal URLs per property from Kyle |
| WhatsApp notifications | Requires WhatsApp Business API account |
| Payment processing (JV revenue) | Requires payment partner integration (Peach, PayFast, etc.) |
| Google Business Profile OAuth | Requires GBP API approval (separate from Places API) |
| PDF export reports | Post-MVP sprint |
| Offline PWA service worker | Post-MVP sprint |
| POPIA legal review | Kyle/legal team responsibility — design complete |
| CCTV/video storage | Permanent policy exclusion — event metadata only |
| Emotion recognition | Permanent policy exclusion |

---

## Migration history (production)

| Version | Status | Notes |
|---|---|---|
| 0001_pulse_core | APPLIED (marked) | Partial apply + repair — covered by 0005 |
| 0002_farmstead_platform | APPLIED (marked) | Covered by 0005 |
| 0003_farmstead_mvp | APPLIED (marked) | Covered by 0005 |
| 0004_jv_accounts | APPLIED (marked) | Covered by 0005 |
| 0005_reconcile | APPLIED | Live — all PULSE tables with IF NOT EXISTS + inline RLS |

---

## Environment variable status

| Variable | Location | Status |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | apps/web/.env.local | ✓ Real value |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | apps/web/.env.local | ✓ Real value |
| GOOGLE_PLACES_API_KEY | Not yet set | Blocked |
| ANTHROPIC_API_KEY | Not yet set | Blocked |
| SUPABASE_ACCESS_TOKEN | Not persisted | Used via session only |
