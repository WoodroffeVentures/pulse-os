# PULSE Release Gate

Run the full PULSE acceptance checklist against production and report a pass/fail evidence record.

Do not claim completion on a TypeScript build alone. Each gate below requires independent evidence.

---

## 1. Repository

- [ ] Confirm current Git SHA and that it matches the SHA serving production
- [ ] Working tree clean (or document any intentional unstaged changes)
- [ ] Migration history reconciled: all local migrations present in `supabase migration list`
- [ ] No secrets in staged or committed files

Run:
```bash
git rev-parse HEAD
git status
/usr/local/Cellar/supabase/2.113.0/bin/supabase migration list --project-ref aqsegdzptwbyrasblrch
```

## 2. Build, type-check and lint

```bash
cd apps/web && pnpm build && pnpm tsc --noEmit && pnpm lint
```

All must pass with zero errors.

## 3. Public page

- [ ] `https://pulse-os-steel.vercel.app` loads for a signed-out visitor
- [ ] PULSE proposition is clear
- [ ] Pilot-interest form validates required fields
- [ ] Valid anonymous submission succeeds (or returns correct error if no Supabase row expected)
- [ ] No anonymous listing of submissions

## 4. Authentication

- [ ] Login flow completes with test account
- [ ] Organisation context resolves (`orgId` populated)
- [ ] Logout works
- [ ] Refresh and fresh login restore the session

## 5. Hospitality regression

- [ ] Farmstead organisation loads
- [ ] All four Farmstead properties visible
- [ ] Reservations list loads
- [ ] Reservation overlap attempt rejected
- [ ] Housekeeping page loads
- [ ] Maintenance page loads
- [ ] Existing operational routes return data (no 500/blank screens)

## 6. Opportunity lifecycle (atomic journey)

- [ ] `/opportunities` Radar loads with ranked cards
- [ ] Create new opportunity via modal
- [ ] Navigate to `/opportunities/[id]` Workspace
- [ ] Six tabs load: Brief, Fit & Scoring, Participants, Activation, Outcomes, Evidence
- [ ] Viability assessment visible with score, confidence, evidence breakdown
- [ ] Participation record with Join/Join with Conditions/Hold/Decline decision visible
- [ ] Milestone created and status toggled
- [ ] Outcome recorded (labelled as test)
- [ ] All data persists after page refresh
- [ ] All data persists after sign-out and fresh sign-in

## 7. Security and tenant isolation

Run the Playwright RLS suite or equivalent manual checks:
- [ ] Anonymous `SELECT` on org-scoped tables returns 0 rows
- [ ] Authenticated user cannot read another org's opportunities, businesses, participation records
- [ ] Anonymous `INSERT` on protected tables fails (except `pilot_interest`)
- [ ] No service-role key reachable in browser DevTools network responses or JS bundles
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is anon, not service-role

```bash
cd apps/web && npx playwright test --project=chromium tests/rls.spec.ts
```

## 8. UX and accessibility

- [ ] All pages render at 375px with no horizontal overflow
- [ ] Keyboard navigation reaches all primary actions
- [ ] No serious axe violations on Dashboard, Opportunity Radar and Workspace
- [ ] Loading states visible before data arrives
- [ ] Empty states visible when no data exists
- [ ] Error states do not crash the page

```bash
cd apps/web && npx playwright test --project=chromium tests/accessibility.spec.ts
```

## 9. Performance baseline

Run Lighthouse on:
- `https://pulse-os-steel.vercel.app` (public)
- Dashboard page (authenticated)

Thresholds: Performance ≥ 70, Accessibility ≥ 90, Best Practices ≥ 90.

## 10. Production confirmation

- [ ] `https://pulse-os-steel.vercel.app` serving the expected SHA
- [ ] Production console logs checked (no runtime errors)
- [ ] No new paid subscriptions or external services activated

---

## Evidence record format

At completion, produce:

```
PULSE RELEASE GATE — [date]
SHA: [git sha]
Production: https://pulse-os-steel.vercel.app

PASSED: [list]
FAILED: [list with detail]
DEFERRED: [list with reason]

Remaining blockers: [number]
Owner action required: [yes/no — what]
```
