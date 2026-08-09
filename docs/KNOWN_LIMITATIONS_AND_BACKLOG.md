# PULSE Pilot Release 1 — Known Limitations and Post-Launch Backlog

**Date:** 2026-08-09

---

## Known Limitations at Pilot Launch

### External Integration Blockers (not PULSE failures)

| Item | Reason | Workaround |
|------|--------|------------|
| Booking.com live connection | Requires Connectivity Partner certification (8–12 weeks) | iCal import; manual reservation entry |
| Airbnb live connection | Requires Software Partner programme approval | iCal import |
| Expedia live connection | Requires Expedia Group certification | iCal import |
| LekkeSlaap full sync | Adapter built; awaiting API credentials + sandbox | iCal import |
| Payment gateway (automated) | No merchant account yet | Manual payment recording in folio |
| WhatsApp messaging | Requires Meta Business API approval | Manual communication |

### Channel Policy — Permanent
No OTA channel may be displayed as "connected" or "live" until its certification is complete and tested in production. The channels page displays the honest status for each channel.

### Rates
The rates page allows rate entry and bulk updates. Rates persist to `rate_calendar` when Supabase is configured. Stop-sell toggles work. Channel-specific rate push is not available until OTA connections are live.

### Payments
Manual payment recording (cash, EFT, card present) is supported via the folio system. Online payment links via gateway are not available at pilot launch.

### AI Features
AI brief, AI recommendations, and AI-generated housekeeping tasks are available where the Anthropic key is configured. If the key is absent, these features degrade gracefully to manual entry — they do not block the pilot.

---

## Post-Launch Backlog (by priority)

### P1 — First 30 days after pilot

- [ ] Complete Supabase Auth email templates (magic-link branding)
- [ ] Property onboarding flow (guided first-time setup)
- [ ] Room type bulk creation from property setup
- [ ] Reservation confirmation email template
- [ ] Manual payment receipt generation
- [ ] Housekeeping task scheduling (auto-create on reservation checkout)
- [ ] Mobile PWA optimisation

### P2 — First 90 days

- [ ] LekkeSlaap adapter activation (after credentials received)
- [ ] iCal automatic sync scheduler
- [ ] Guest CRM: full profile edit, POPIA consent flow
- [ ] Folio UI: line-item add/edit/remove
- [ ] Invoice PDF generation
- [ ] Role-based access control UI (invite staff with specific roles)
- [ ] Reporting: occupancy, ADR, RevPAR dashboard
- [ ] Audit log viewer UI

### P3 — Post-pilot growth

- [ ] Booking.com / Airbnb / Expedia certification applications
- [ ] Online payment gateway (Peach Payments / Paystack)
- [ ] Online check-in guest portal
- [ ] Guest Lite (post-stay engagement)
- [ ] Business Connect (supplier/partner discovery)
- [ ] Destination intelligence and tourism-board reporting
- [ ] AI photo analysis for property listing optimisation
- [ ] Multi-property group reporting
- [ ] White-label deployment for second platform clients
