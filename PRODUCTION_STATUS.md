# PULSE OS — Production Status

**Production URL:** https://pulse-os-steel.vercel.app  
**Last updated:** 2026-08-11

## Capability Register

| Capability | Status |
|---|---|
| Multi-tenant authentication | **Live** |
| Organisation context (OrgProvider) | **Live** |
| Property management (create/edit/draft/active) | **Live** |
| Units and rate plans | **Live** |
| Reservations with overlap protection | **Live** |
| Housekeeping task management (create/complete) | **Live** |
| Maintenance issue tracking (create/resolve) | **Live** |
| Guest Guides | **Live** |
| Business profiles + evidence states | **Live** |
| Opportunity creation and management | **Live** |
| Explainable viability engine (rules-based-v1) | **Live** |
| Participation and JV tracking with milestones | **Live** |
| Outcome recording (self-reported / evidence-confirmed) | **Live** |
| Participation Graph (database-derived) | **Live** |
| Dashboard with real tenant data + onboarding progress | **Live** |
| Reports: HTML/print exports | **Live** |
| System status panel (Settings) | **Live** |
| Public landing page + pilot interest form | **Live** |
| Google Places API | **Not Connected** |
| Google ownership verification | **Manual Evidence Only** |
| Email invitations (external SMTP) | **Not Configured** |
| External AI model (viability enhancement) | **Planned** |
| OTA / channel integration | **Planned** |
| Custom domain | **Optional — not a launch blocker** |

## Notes

- No service-role key in any client bundle.
- All pages use real org context via `useOrg()` — hardcoded `a1b2c3d4-0001-0001-0001-000000000001` has been eliminated.
- No page silently falls back to mock data in a live Supabase environment.
- Viability engine is deterministic and requires no external AI API.
- Migration 0014 adds `pilot_interest` table with public INSERT / authenticated SELECT RLS.
