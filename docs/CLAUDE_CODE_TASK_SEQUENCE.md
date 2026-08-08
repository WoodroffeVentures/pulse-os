# Claude Code Task Sequence

Use these prompts one at a time. Do not ask Claude Code to build all phases in one pass.

## Prompt 1: Inspect Repo And Plan

Inspect the repository. Identify the app structure, package manager, Next.js version, Supabase files, existing components and current build status. Produce a concise implementation plan for Farmstead Hospitality Phase 1 only. Keep Phase 2-7 visible as locked roadmap modules. Do not edit files yet.

## Prompt 2: Database Migration And Seed

Add or update Supabase migrations for Farmstead Phase 1 operations. Include iCal feeds, work items, brain entries, property assets, guest communications, guest notes, review requests, property guides, operational assets, offline import batches and AI governance logs. Add Farmstead seed data for the four properties. Run SQL lint if available and explain any manual Supabase steps.

## Prompt 3: App Shell And Navigation

Build the PULSE command shell with a calm institutional dark UI. Add navigation for live Farmstead modules and locked Phase 2-7 modules. Use existing components where possible. Run typecheck/build.

## Prompt 4: Farmstead Dashboard

Build the dashboard for arrivals, departures, occupancy, readiness, open tasks, overdue issues, reviews, AI recommendations and today’s operating brief. Use existing mock data if Supabase is not connected yet. Run typecheck/build.

## Prompt 5: Properties And Bookings

Build `/properties`, `/properties/[id]`, `/bookings` and iCal source visibility. Each property detail must show overview, operations, guest experience and commercial sections. Run typecheck/build.

## Prompt 6: Tasks, Housekeeping, Maintenance

Build `/tasks`, `/housekeeping`, `/maintenance` and `/works`. Keep tasks actionable and works durable. Add filters by property, status and category. Run typecheck/build.

## Prompt 7: Brain And Knowledge Base

Build `/brain` with searchable operational knowledge, guest-visible flags and source categories. Include WiFi, SOPs, guest guide copy, maintenance lessons and private notes. Run typecheck/build.

## Prompt 8: Reviews And Guest Guides

Build `/reviews` and `/guest-guides`. AI review responses must be drafts only. Guest guide public/private data boundaries must be visible. Run typecheck/build.

## Prompt 9: AI Gateway And Prompts

Add an AI gateway boundary and prompt templates for daily brief, review response, maintenance recommendation, housekeeping brief, guest message, social post, booking gap and knowledge answer. Log every AI action. Do not send or publish anything automatically. Run typecheck/build.

## Prompt 10: Strategic Locked Modules

Build locked roadmap pages for `/visibility`, `/growth`, `/local-ecosystem`, `/destination`, `/opportunities` and `/economic-intelligence`. Use static demo cards only. Do not implement production workflows. Run typecheck/build.

## Prompt 11: Test, Fix, Document, Deploy

Run all available checks. Fix failures. Update README and deployment guide. Confirm Supabase env variables, migration order, seed data path, Vercel setup and manual test checklist.

