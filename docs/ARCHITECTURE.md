# PULSE OS Architecture

## Core Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn-style primitives
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Edge Functions
- Row Level Security
- Vercel deployment

Supabase/Postgres is the primary data foundation because the long-term system depends on relational tenant isolation, joins, typed relationships, reporting, readiness scoring, opportunity matching and participation graph logic.

## Architecture Tracks

### Track A: Offline HTML Bridge

Purpose:

- Immediate Farmstead use
- No infrastructure dependency
- Capture early operations data
- Export JSON for later import into production

The bridge is not the source of truth once Supabase is live. It is an intake and continuity tool.

### Track B: Production Platform

Purpose:

- Authenticated daily operations
- Supabase source of truth
- iCal ingestion
- RLS tenant isolation
- AI governance and audit logs
- Future participation graph extension

## Bounded Contexts

### Tenant Core

Organizations, users, roles, property access and tenant-level settings.

### Hospitality Operations

Properties, bookings, tasks, housekeeping, maintenance, works register, reviews, guests, guides and brain entries.

### Intelligence

AI recommendations, daily briefs, review response drafts, booking gap recommendations and governed action logs.

### Integrations

iCal feeds, Google placeholders, WhatsApp placeholders, review ingestion placeholders and offline bridge import/export.

### Strategic Expansion

Locked Phase 2-7 modules. These are narrative and architecture placeholders until explicitly activated.

## AI Governance

AI may draft, summarize, recommend and classify. AI may not publish, send, cancel, change pricing, make legal commitments or make financial commitments.

Every AI call must create an `ai_action_logs` record. Every public-facing AI output remains draft-first and approval-gated.

## UX Doctrine

The product must feel institutional, premium, calm, operational and high-trust. The visual language is closer to command centers, airport operations, Bloomberg and Palantir than playful SaaS.

Palette:

- Background: `#020912`
- Panels: `#08111f`
- Borders: `rgba(255,255,255,0.06)`
- Primary text: `#E6EDF5`
- Secondary text: `#9BA7B8`
- Gold accent: `#C6A66B`
- Operational teal: `#2BB8A5`
- Warning: `#D68B5C`
- Critical: `#D45D5D`

