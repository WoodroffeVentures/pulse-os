# MASTER CONTEXT
*Platform vision, current state, and critical context for every session.*

---

## What PULSE OS Is

PULSE OS is a Hospitality and Destination Intelligence Network. It is not a PMS, channel manager, review tool, guest guide app, social media scheduler, or AI chatbot. It is the intelligence layer that connects guests, properties, local businesses, experience providers, and destinations into one verified, evidence-based operating network.

**The two questions every feature must serve:**
1. "How do I run my business better today?"
2. "Which opportunities are worth participating in tomorrow?"

## Current Platform State — As Of 2026-05-31

### Primary Deliverable: HTML Prototype
`pulse-os-v2.html` — 5,767 lines, 27 fully-implemented pages, zero stubs, single-file HTML/CSS/JS prototype. This is the UX blueprint and the reference implementation for all production development.

**Pages implemented:**
- COMMAND: morning, properties, ai-brief
- OPERATIONS: bookings, tasks, staff, housekeeping, maintenance, works, farmops, assets
- GUESTS: crm, comms, reviews
- INTELLIGENCE: revenue, social, discovery
- KNOWLEDGE: guides, playbooks
- PLATFORM: settings, landing, getaway, trial
- INTELLIGENCE LAYERS: trust, channels, opportunity, destination

### Production Codebase: Next.js App
`apps/web/` — Next.js 15, TypeScript, Tailwind, Supabase integration exists but is underbuilt. Pages exist as scaffolding. No Supabase data wiring. No auth flow implemented. No real-time data. TypeScript passes with zero errors.

**Critical gap:** The HTML prototype is months ahead of the Next.js app. The production strategy must bridge this gap systematically.

### Database: Supabase Migrations
Three migrations exist:
- `0001_pulse_core.sql` — base schema (organizations, properties, users, bookings, tasks, guests, reviews, etc.)
- `0002_farmstead_platform.sql` — iCal sources, property knowledge, platform events, workflows
- `0003_farmstead_mvp.sql` — extended Farmstead schema

Seed data exists in `supabase/seed.sql` with Farmstead's 4 real properties and operational data.

### Edge Functions: Stubs Only
- `ai-gateway/index.ts` — stub, not implemented
- `ical-sync/index.ts` — stub, not implemented
- `nightly-brief/index.ts` — stub, not implemented

## Production Tenant: Farmstead Hospitality

**Owner:** Nadia Woodroffe  
**Location:** JoyWood Farm, Southern Drakensberg, KwaZulu-Natal, South Africa  
**Properties:**
1. Jackals Rest (cottage) — Airbnb, Booking.com, LekkeSlaap, Direct
2. Woody's Cottage — Booking.com, Direct
3. Swallows Nest Studio — Direct, Booking.com
4. Meadows Cottage — LekkeSlaap, Direct

**Staff:** Thandi (housekeeping), Sipho (maintenance), Maria (guest services)

**Farmstead's role:** Tenant #001. Live validation environment. The first production node in the graph. Not the product definition.

**Farmstead's iCal URLs (Jackals Rest):**
- Booking.com: `https://ical.booking.com/v1/export?t=0d8f6bd9-52fb-4229-8fd8-d371651c89d7`
- Airbnb: `https://www.airbnb.ae/calendar/ical/53438771.ics?t=a30a63d356674ae193dbc77de22694fd`
- LekkeSlaap: `https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=VVRWRDg0SjJyWWJzZmNYeUp2dVdWZz09`

## Six Intelligence Layers

| Layer | Status | HTML Prototype | Next.js |
|-------|--------|----------------|---------|
| Hospitality Operations | Phase 1 Active | Complete | Scaffolded |
| Discovery Intelligence | Phase 1 Active | Complete | Stub |
| Trust Intelligence | Phase 2 Active | Complete (UI) | Not started |
| Revenue Intelligence | Phase 1 Active | Complete | Not started |
| Opportunity Intelligence | Phase 6 Roadmap | Demo only | Not started |
| Destination Intelligence | Phase 5 Roadmap | Demo only | Not started |

## Design System

- Background: `#020912`
- Surface: `#08111f`, `#0c1728`
- Border: `rgba(255,255,255,0.08)`
- Gold accent: `#C6A66B`
- Operational teal: `#2BB8A5`
- Blue: `#3b82f6`
- Critical red: `#ef4444`
- Warning amber: `#f59e0b`
- Text: `#E6EDF5`
- Muted: `#9BA7B8`
- Dim: `#617089`
- Fonts: Inter (body), JetBrains Mono (numbers/metrics)

## Technology Stack

**Production target:**
- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn components
- Backend: Supabase (PostgreSQL, RLS, Realtime, Auth, Storage, Edge Functions)
- Deployment: Vercel (frontend), Supabase (backend)
- Maps: Google Maps + Google Places API
- AI: Provider abstraction layer (Anthropic Claude for reasoning, cheaper models for generation)
- Monitoring: Sentry, PostHog

**Monorepo structure:** `pnpm` workspace with `apps/web` as primary

## Immediate Strategic Priority

Bridge the gap between the HTML prototype (complete UX blueprint) and the production Next.js application. The HTML prototype must not drift from the Next.js app indefinitely — it should function as the specification document, not the live product.

The 90-day priority is: Supabase connection → Real data in 5 core pages → Trust Intelligence as real Edge Function → iCal sync working → Auth and onboarding.
