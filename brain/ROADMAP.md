# ROADMAP
*Phase-sequenced build plan with 90-day horizon. Updated: 2026-05-31.*

---

## Active Phases

### Phase 1 — Hospitality Operations OS
**Status:** Active  
**Purpose:** Give operators the tools to run their properties with precision and replace spreadsheets, WhatsApp groups, and paper checklists.

**Phase 1 Scope (HTML Prototype — Complete):**
- Morning Brief (command dashboard)
- Property Readiness Engine
- Bookings + iCal sync
- Task Engine (kanban)
- Housekeeping module
- Maintenance lifecycle
- Works register
- Farm Operations
- Asset register
- Guest CRM
- Communications Hub
- Review Intelligence
- Staff Hub + printable checklists
- Guest Guides
- Playbooks / SOPs
- AI Brief
- Social Growth Engine
- Settings + integrations

**Phase 1 Production Gap (Next.js → needs implementation):**
All of the above exists as UX blueprint in `pulse-os-v2.html` but requires production implementation.

### Phase 2 — Trust Intelligence
**Status:** Active (UI complete, backend pending)  
**Purpose:** Score, validate, and monitor every business in the local ecosystem before it reaches a guest.

**Phase 2 Scope:**
- Trust scoring algorithm (Edge Function)
- Discovery validation workflow
- Auto-discovery from Google Places via property location
- Trust score update triggers (new review signals)
- Operator approval workflow for discovered businesses
- Guest-facing vs operator-facing visibility rules

---

## 90-Day Build Sequence (June–August 2026)

### Week 1–2: Supabase Foundation (CRITICAL PATH)
**Priority:** Highest — all subsequent work depends on this.

- [ ] Add `.env.local` with real Supabase credentials
- [ ] Run all 3 migrations against production Supabase project
- [ ] Seed Farmstead data (4 properties, iCal sources, knowledge entries)
- [ ] Verify RLS policies — cross-tenant read must fail
- [ ] Wire Supabase client to Next.js auth (email + Google sign-in)
- [ ] Create Farmstead org + Nadia user account in production
- [ ] Test: Nadia can log in and see only Farmstead data

**Deliverable:** Authenticated Farmstead session with real data.

### Week 3–4: Core Production Pages (5 highest daily-value)
**Priority:** High — adoption depends on these being production-ready.

- [ ] Morning Brief page — real Supabase data (properties, bookings, tasks, reviews)
- [ ] Bookings page — iCal sync working, real calendar data
- [ ] Tasks page — create, assign, complete tasks from Supabase
- [ ] Housekeeping page — real task states driving readiness
- [ ] Reviews page — review records in Supabase, AI draft workflow

**Deliverable:** Nadia can run daily operations from Next.js app.

### Week 5–6: iCal Sync Edge Function
**Priority:** High — bookings are the operational heartbeat.

- [ ] Implement `supabase/functions/ical-sync/index.ts` fully
- [ ] Parse VEVENT blocks from all 3 Jackals Rest feeds
- [ ] Upsert bookings with conflict detection
- [ ] Sync status updates (success/error/pending per source)
- [ ] Scheduled sync: every 15 minutes via Supabase cron
- [ ] Double-booking detection alert

**Deliverable:** Real-time booking data from Airbnb, Booking.com, LekkeSlaap.

### Week 7–8: AI Gateway + Nightly Brief
**Priority:** Medium-High — AI is a key retention driver.

- [ ] Implement `supabase/functions/ai-gateway/index.ts`
- [ ] Route tasks: Anthropic (reasoning) vs cheaper (generation)
- [ ] Implement nightly brief generation
- [ ] Review response drafts (approval-gated)
- [ ] Task suggestion from booking events
- [ ] All outputs logged to `ai_action_logs`

**Deliverable:** PULSE-branded AI recommendations appearing in the Morning Brief.

### Week 9–10: Trust Intelligence Edge Function
**Priority:** Medium — Phase 2 activation begins here.

- [ ] Google Places API integration (property location → nearby businesses)
- [ ] Trust scoring algorithm as Edge Function
- [ ] Auto-discovery job for Farmstead location
- [ ] Trust score storage in `discovery_vendors` table
- [ ] Operator validation workflow (approve/flag/hide)
- [ ] Display in Local Discovery page with real scores

**Deliverable:** Real trust-scored local businesses appearing in Farmstead's discovery layer.

### Week 11–12: Staff Hub Mobile + Notifications
**Priority:** Medium — staff adoption is the adoption proof point.

- [ ] Mobile-optimised task view for staff
- [ ] Push notifications for assigned tasks
- [ ] Checklist completion with photo upload
- [ ] Supervisor approval workflow
- [ ] WhatsApp-style notification via WhatsApp Business API (draft)

**Deliverable:** Thandi and Sipho use PULSE on their phones for daily tasks.

---

## Phases 3–7 (Planned / Roadmap / Vision)

### Phase 3 — Growth Intelligence
**Planned Q4 2026**
- Revenue gap detection (automated)
- Booking gap → promotional content pipeline
- Direct booking conversion (website widget)
- Repeat guest campaign automation
- OTA performance comparison

### Phase 4 — Local Ecosystem Intelligence
**Planned Q1 2027**
- Multi-business onboarding to PULSE
- Business profiles with Trust Scores
- Referral tracking (guest → vendor → outcome)
- Partner revenue attribution
- Ecosystem analytics for operators

### Phase 5 — Destination Intelligence
**Planned Q2 2027**
- Tourism board dashboard
- Visitor movement intelligence
- Seasonal demand forecasting
- Destination NPS tracking
- Regional participation heatmaps

### Phase 6 — Opportunity Intelligence
**Planned Q3 2027**
- Opportunity builder for tourism campaigns
- PULSE Score (operator readiness index)
- Opportunity → operator matching algorithm
- Participation tracking + outcome measurement
- Verified participation graph activation

### Phase 7 — Sovereign Intelligence
**Vision — No timeline, no scope**
- Government-grade reporting
- Economic impact measurement
- Sovereign data isolation
- Auditor access layer
- National participation benchmarking

---

## Phase 1 KPIs (Success Criteria)

| Metric | Target |
|--------|--------|
| Daily active use by Nadia | Every morning, 7 days/week |
| Staff task completion in PULSE | >80% of all tasks |
| Bookings via iCal | All Jackals Rest bookings synced |
| Review response rate | >90% within 48hr |
| AI brief review | Every morning before 9am |
| Property readiness accuracy | Matches actual property state |
