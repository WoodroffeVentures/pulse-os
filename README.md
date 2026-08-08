# PULSE OS

PULSE OS is an opportunity participation intelligence platform. The current production MVP is **PULSE Hospitality OS for Farmstead Hospitality**.

Farmstead Hospitality is the only implemented production customer in this scaffold. The broader PULSE OS architecture remains visible through locked Phase 2-7 roadmap surfaces for hospitality visibility, growth, local ecosystem, destination, opportunity participation and government/economic intelligence.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn-style components
- TanStack Query
- Zustand-ready architecture
- Recharts-ready dashboards
- Supabase Auth, PostgreSQL, Storage, Edge Functions and Realtime
- PostgreSQL Row Level Security
- AI gateway pattern for OpenAI/Anthropic
- PWA-first direction for staff operations

## Farmstead MVP Modules

- Command dashboard
- Farmstead portfolio and property detail
- Bookings and iCal source visibility
- Tasks, housekeeping, maintenance and works register
- Guest CRM
- Reviews
- Guest guides
- Brain / knowledge base
- AI daily brief and recommendations
- Settings

## Locked Strategic Modules

- Phase 2: Hospitality Visibility Intelligence
- Phase 3: Hospitality Growth Intelligence
- Phase 4: Local Ecosystem Intelligence
- Phase 5: Destination Intelligence
- Phase 6: Opportunity Participation Intelligence
- Phase 7: Economic / Government Intelligence

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Supabase

Apply migrations from `supabase/migrations` in order and seed with `supabase/seed.sql`.

Required principles:

- RLS must stay enabled.
- No cross-tenant reads.
- AI action logs are mandatory.
- High-risk AI actions require approval.

## Docker

```bash
docker compose up --build
```

## Deployment

1. Create Supabase project.
2. Run SQL migration.
3. Add environment variables in Vercel.
4. Deploy `apps/web` to Vercel.
5. Configure domain through Cloudflare.
6. Enable Sentry/PostHog before onboarding live properties.

## Roadmap

See `docs/PROJECT_BRIEF.md`, `docs/ARCHITECTURE.md` and `docs/IMPLEMENTATION_ROADMAP.md`.

## Rust Agent Runtime Future Integration

The platform is designed to add a Rust-based AI agent runtime later. Integrate it behind the AI Gateway and Event Bus with explicit session permissions, tenant scope, tool grants, audit logging and approval policies.

Suggested future package:

```bash
/apps/agent-runtime-rs
```

The runtime should never bypass RLS, workflow approvals, or audit logs.

## License

AGPL-3.0-or-later. Review before commercial deployment if you prefer a different license model.
