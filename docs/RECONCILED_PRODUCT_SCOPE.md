# PULSE OS — Reconciled Product Scope
*Authoritative scope definition for the tourism-board pilot. 2026-08-08.*
*This document supersedes conflicting legacy briefs. Controlled by the close-out directive.*

---

## What PULSE OS Is

**PULSE OS is an Opportunity Intelligence Network** that helps destinations, tourism boards, properties, businesses, guests, communities and partners discover, verify, activate and measure opportunities using trusted evidence and measurable participation outcomes.

**The sharp commercial core question:** Should this business participate in this opportunity — and what must happen next to improve the chance of a successful outcome?

**The long-term data moat:** The Verified Opportunity Participation Graph — which participants joined which opportunities, under what conditions, on the basis of which evidence, with what measured outcome.

---

## Resolved Conflicts

| Legacy claim | Resolution |
|---|---|
| "PULSE is a hospitality BMS" | FALSE. Hospitality operations are supply-side evidence only. Not the product definition. |
| "PULSE is Travel & Discovery software" | PARTIAL. Travel and Discovery is the demand/participation layer. It feeds the Opportunity Graph. It is not the product. |
| "PULSE is a Business Viability Platform" | PARTIAL. Viability is one step in the Opportunity Intelligence flow. Not the whole product. |
| "PULSE is a PMS / booking engine" | FALSE. iCal sync and booking visibility are evidence inputs for a property's readiness signal. Not core. |
| "Farmstead is the platform" | FALSE. Farmstead is Tenant #001 — proof that the platform works for a real operator. |
| "PULSE SOVEREIGN is a deliverable" | FALSE per Constitution. Strategic direction only. Never scope, estimate or build. |

---

## Controlling Product Architecture

```
DEMAND LAYER          SUPPLY LAYER           INTELLIGENCE LAYER        OUTCOME LAYER
─────────────────    ──────────────────     ───────────────────────   ─────────────────
Guest Intent         Properties             Viability Engine           Participation Graph
Regional Discovery   Businesses             Evidence Model             Outcome Tracking
Travel Signals       Community Partners     Matching Engine            Impact Metrics
Event Demand         Guides & Suppliers     Trust Scores               Board Reporting
```

The core flow is:
Signal → Verification → Trust → Participation → Outcome → Intelligence → Opportunity

---

## Pilot Scope (Tourism Board Ready)

### In scope for the Southern Drakensberg pilot

1. **Public discovery** — verified regional directory for Underberg / Himeville / Sani Pass area
2. **Business Connect** — non-technical onboarding with evidence capture
3. **Opportunity flow** — create → match → viability → response (accept/conditional/decline)
4. **Tourism Board Command** — dashboard with real or clearly-labelled demo data
5. **Board presentation mode** — `/board-demo` guided 7-part story
6. **Farmstead as Tenant #001** — operational proof, not the pilot subject

### Out of scope for pilot (deferred)

- POPIA-compliant production data processing (requires legal review)
- Real iCal sync to live booking platforms
- Real Google Places API integration
- Voice and image AI input (interface ready, mocked)
- Payment processing
- CCTV / video
- isiZulu full translation (structure prepared)
- PULSE SOVEREIGN
- Multi-country expansion

---

## Module Classification for Pilot

| Module | Classification | Deliverable |
|---|---|---|
| Public Discovery (Drakensberg) | DEMO with real intent | HTML + /board-demo |
| Business Connect | DEMO flow | Functional in app |
| Opportunity Intelligence | DEMO flow | Functional in app |
| Tourism Board Command | DEMO dashboard | /board-demo + app |
| Farmstead Operations | REAL proof | pulse-os-v2.html + app |
| Travel & Discovery narrative | DEMO story | pulse-travel-discovery.html |
| Destination Intelligence | DEMO story | pulse-destination.html |
| Host Global Intelligence | DEMO story | pulse-host.html |
| Opportunities narrative | DEMO story | pulse-opportunities.html (rebuilt) |
| AI features | MOCKED (labeled) | Demo adapters |
| Authentication | BYPASSED for pilot | Single demo login |
| Real DB | NOT CONNECTED | Mock data |
