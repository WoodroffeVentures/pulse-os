# PULSE OS — Security Checklist

## Completed Checks

| Check | Result |
|---|---|
| Service-role key in client bundles | Not present. Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used in browser code. |
| Hardcoded org UUID `a1b2c3d4-…` | Eliminated from all app routes. All pages use `useOrg()`. |
| RLS on tenant tables | Confirmed for properties, tasks, business_profiles, opportunities, viability_analyses, participation_records (see migrations 0009–0013). |
| Cross-tenant read | Blocked by RLS `eq(organization_id, user's org)`. |
| Credentials in Git history | No SUPABASE_SERVICE_ROLE_KEY or other secrets found in current tracked files. |
| Mock data in production routes | No production page silently falls back to mock content when Supabase is configured. |
| pilot_interest table RLS | Public INSERT, authenticated SELECT only (migration 0014). |
| Pilot interest API validation | Input validated server-side before insert. Email format checked. |

## Owner Actions Required Before External Pilot Invitations

| Action | Priority | Where |
|---|---|---|
| Revoke any previously exposed Supabase PATs | **Critical** | https://supabase.com/dashboard/account/tokens (signed in as 1pulse.os@gmail.com) |
| Confirm no prior service-role key commits in older branches | **High** | `git log --all -S "service_role"` |
| Configure custom SMTP for email invitations | Optional | Supabase → Auth → SMTP |
| Delete test accounts (1pulse.os+orga@gmail.com, 1pulse.os+orgb@gmail.com) | High | Supabase → Authentication → Users |
| Enable branch protection on `main` | Medium | GitHub → Settings → Branches |
| Review pilot_interest submissions before any public promotion | High | Supabase → Table Editor → pilot_interest |

## Known Limitations

- Email invitations are not configured — pilot accounts must be provisioned directly in Supabase Auth.
- Google ownership verification is manual only — no OAuth2 ownership proof.
- Storage access not verified end-to-end — evidence files may need manual reference if storage is unavailable.
- Audit trail appended in JSON (`evidence.audit`) — not a separate immutable audit table. Sufficient for controlled pilot.
