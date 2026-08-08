# NEXT ACTIONS
*Exactly 3 immediate next actions. Always current. Re-derived 2026-05-31 against the ratified Constitution (DEC-016) and the Six-Question Build Gate. Every action below strengthens the graph — the true moat.*

> Governing principle: the experience layers (brand site, homepage, Farmstead prototype) now communicate the vision well. The platform's moat — **Verified Participation Intelligence** — is still *visualised, not real*. The next actions make the graph real, in dependency order.

---

## Action 1 — Make the Participation Graph real (Domain 8 + foundation for all)
**What:** Stand up the production Supabase project and run the existing migrations + Farmstead seed; wire Supabase Auth (email + Google) into the Next.js app; confirm RLS cross-tenant isolation. This turns the visualised graph into a stored, queryable one with real nodes (org, properties, bookings, guests, reviews, tasks) under tenant isolation.
**Why (gate):** Strengthens Participation, Trust, Intelligence, Opportunity discovery, and **the graph** — all six. Nothing else compounds until data is real and isolated.
**Done when:** Nadia logs in; the operational HOST pages render real Farmstead data; a second test org proves zero cross-tenant leakage.

## Action 2 — Activate live Trust scoring (Domain 4 — the emerging moat)
**What:** Implement `supabase/functions/trust-scoring` consuming Google Places + internal signals, computing the 7-factor score (reviews, recency, velocity, website, contact, owner validation, guest feedback), storing it on discovered vendors with the Suggested→Validated→Approved→Preferred lifecycle (owner control wins). Internal-only visibility.
**Why (gate):** Strengthens Trust, Discovery, Participation and the graph. Every day it is not live, the emerging moat does not compound.
**Done when:** Auto-discovery for Farmstead's location returns trust-scored vendors; Himeville Arms scores >85 with a visible factor breakdown; only Approved/Preferred reach guest-facing surfaces.

## Action 3 — Wire iCal sync so real bookings enter the graph (Domain 1 → 8)
**What:** Implement `supabase/functions/ical-sync` for Jackals Rest's three feeds (Booking.com, Airbnb, LekkeSlaap); parse VEVENTs, upsert bookings with conflict detection, schedule every 15 min. Each booking becomes a real participation node/edge.
**Why (gate):** Strengthens Participation, Intelligence and the graph — bookings are the richest real signal available now and the operational heartbeat of HOST.
**Done when:** All three feeds parse; bookings appear in the Morning Brief from live data; double-booking detection fires.

---

*Sequenced deliberately: Action 1 is the substrate; 2 and 3 are the first two real signal sources feeding the participation graph. Only after these are real should new domains (TRAVEL pricing, EXCHANGE matching, DESTINATION/IMPACT measurement) be built — each must pass the Six-Question Gate first and be logged before implementation.*
