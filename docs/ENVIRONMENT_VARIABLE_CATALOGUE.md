# PULSE OS — Environment Variable Catalogue
*Names, owners and purpose only. Never values.*

## apps/web/.env.local (local + Vercel project env)

| Variable | Owner | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project | Yes — core | Public URL for browser Supabase client. Safe to expose in browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project | Yes — core | Anon JWT for browser Supabase client. RLS enforces data isolation. |
| `GOOGLE_PLACES_API_KEY` | Google Cloud | For Places features | Server-only key for Places API (New). Must NEVER be in a NEXT_PUBLIC_ variable. Restricted to server requests only. |
| `ANTHROPIC_API_KEY` | Anthropic | For AI features | Server-only key for Claude AI gateway. System degrades gracefully to deterministic mode if absent. |
| `NEXT_PUBLIC_APP_URL` | Self | Yes | Canonical application URL — used for auth redirects, OG tags. |

## Supabase Edge Function secrets (set via Supabase CLI `secrets set`)

| Secret | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | AI gateway edge function |
| `GOOGLE_PLACES_API_KEY` | Places lookup edge function |

## CI/CD (GitHub Actions repository secrets)

| Secret | Purpose |
|---|---|
| `VERCEL_TOKEN` | Vercel CLI authentication for deploy jobs |
| `VERCEL_ORG_ID` | Vercel organisation identifier |
| `VERCEL_PROJECT_ID` | Vercel project identifier |

## Never store in environment variables

- Supabase service-role key (only in Edge Functions via Supabase secrets management)
- Database passwords
- Payment processor keys
- WhatsApp Business API credentials
