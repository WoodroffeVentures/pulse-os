# PULSE Pilot Release 1 — Rollback and Recovery

**Date:** 2026-08-09

---

## Production Stack

| Component | Value |
|-----------|-------|
| Production URL | https://pulse-os-steel.vercel.app |
| Vercel project | `pulse-os` (prj_08iVFhvGpXcxoqA8xh0AvVUrqE0c, 1pulse.os@gmail.com) |
| Production Supabase project | `aqsegdzptwbyrasblrch` (1pulse.os@gmail.com) |
| Rollback URL | https://pulse-os-web-wine.vercel.app (Woodroffe Ventures account — untouched) |
| Rollback Supabase project | `mrqgapyzsfgiolfqxyqk` (woodroffe.ventures@gmail.com) |
| GitHub repo | https://github.com/WoodroffeVentures/pulse-os |
| GitHub release | `v1.0.0-pilot` at commit `a824fcd` |
| Production branch | `main` |

---

## Rollback Procedure

### Tier 1 — Application code rollback (Vercel)

If a bad deployment reaches production:

1. Open Vercel dashboard (1pulse.os@gmail.com) → pulse-os → Deployments
2. Find the last known-good deployment (note its commit SHA)
3. Click "..." → "Promote to Production"
4. Confirm — takes ~30 seconds, no downtime

Or via CLI:
```bash
cd "/Users/woodroffeventures/Woodroffe Ventures/Pulse OS"
git revert HEAD --no-edit
git push origin main
```

### Tier 2 — Database rollback (Supabase)

The old Supabase project `mrqgapyzsfgiolfqxyqk` is retained as rollback.

To revert to the old project:
1. In Vercel → Settings → Environment Variables
2. Update `NEXT_PUBLIC_SUPABASE_URL` → `https://mrqgapyzsfgiolfqxyqk.supabase.co`
3. Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` → old anon key
4. Trigger a new Vercel deployment

**Data note:** Any data written to `aqsegdzptwbyrasblrch` since cutover will not appear on rollback. This is acceptable during the pilot phase before Farmstead has live guests.

### Tier 3 — Full reset

If both projects are compromised:
1. Create a new Supabase project
2. Apply migrations 0001–0009 in order
3. Update Vercel env vars
4. Redeploy

---

## Backup Policy

Supabase Pro projects include automatic daily backups. Before the pilot launch:
- Verify `aqsegdzptwbyrasblrch` is on at minimum the Pro plan
- Enable Point-in-Time Recovery if available on the plan

---

## Compromised Credentials

The following credentials from prior sessions are known-compromised and must be rotated before pilot launch:

1. **GitHub PAT (prefix: ghp_uRmvk5K…)** — revoke at https://github.com/settings/tokens — value not repeated here
2. **Service role key exposed in prior conversation** — rotate at Supabase dashboard → Settings → API → Reset service_role key (old project `mrqgapyzsfgiolfqxyqk`)
3. **Supabase PAT (PULSE CLI token, sbp_98e8dc…)** — appeared in chat during this session; revoke manually at https://supabase.com/dashboard/account/tokens (sign in as `1pulse.os@gmail.com`) — value not repeated here

The new project `aqsegdzptwbyrasblrch` service role key must never appear in any conversation, commit, log, or client bundle.

---

## Monitoring

After pilot launch, watch:
- Vercel deployment logs for build failures
- Supabase dashboard → Logs → API for RLS violations or query errors
- Supabase Auth → Users for failed sign-in spikes

---

## Emergency Contacts

- Supabase status: https://status.supabase.com
- Vercel status: https://www.vercel-status.com
- GitHub status: https://www.githubstatus.com
