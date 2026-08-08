# Implementation Roadmap

## Day 1 Launch

- Confirm local app runs.
- Apply Supabase migrations.
- Seed Farmstead Hospitality.
- Verify four properties, bookings, tasks, reviews and brain entries.
- Use mock/local data where production integrations are not connected.

## Week 1

- Connect Supabase reads for properties, bookings, tasks, reviews and brain.
- Add authenticated staff access.
- Add manual task creation and completion.
- Add offline bridge JSON import validation.

## Week 2

- Implement iCal feed fetch and booking upsert.
- Add integration sync logs.
- Add works register CRUD.
- Add guest notes and communications history.

## Week 3

- Wire AI gateway to provider.
- Log every AI action.
- Generate daily brief drafts.
- Generate review response drafts.
- Add approval state for public-facing AI output.

## Week 4

- Harden RLS.
- Add storage for manuals and property assets.
- Add mobile QA pass.
- Deploy to Vercel.
- Prepare Farmstead operating SOP.

## Phase 2-7 Activation

Only activate later phases after Farmstead Phase 1 is stable. Each phase requires its own migration, UX scope, data contracts, governance review and release checklist.

