# PRODUCT DOCTRINE
*Core principles, non-negotiables, and the precise definition of what PULSE OS is and is not.*

---

## What PULSE OS Is

PULSE OS is a **Hospitality and Destination Intelligence Network**.

It is:
- An operational intelligence layer for hospitality operators
- A verified discovery and trust network for guests
- A participation intelligence infrastructure for tourism authorities
- A revenue gap and opportunity matching engine for operators
- The eventual sovereign intelligence layer for economic development agencies

## What PULSE OS Is Not

PULSE OS is not a PMS (property management system). Operators do not pay for the calendar.

PULSE OS is not a channel manager. We sync channels — we are not defined by channel sync.

PULSE OS is not a guest guide app. Guest guides are an output of intelligence, not the product.

PULSE OS is not a review management tool. Reviews are signals that route to operational actions.

PULSE OS is not an AI chatbot. AI is invisible infrastructure.

PULSE OS is not a social media scheduler. Social content is derived from platform intelligence — it is a growth signal, not a content calendar.

PULSE OS is not a tourism directory. Every business in the discovery layer is trust-scored and verified.

## The Two Governing Questions

Every feature, module, and decision must serve at least one of these questions:

> 1. "How do I run my business better today?"
> 2. "Which opportunities are worth participating in tomorrow?"

If a proposed feature cannot clearly answer at least one of these questions, it must be rejected or placed on the Strategic Watchlist.

## The Operational Heartbeat

The daily operational heartbeat of PULSE OS for an operator is:

**Morning Brief → Property Readiness → Today's Tasks → Guest Arrivals → Reviews**

This sequence must always be the fastest and most intuitive path through the platform. No new feature may add friction to this path without an explicit logged justification.

## AI Doctrine

**Users never see AI provider names.** Claude, Gemini, GPT, DeepSeek — these are implementation details. Users see:
- PULSE Insight
- PULSE Recommendation
- PULSE Draft
- PULSE Alert
- PULSE Opportunity

AI may:
- Draft responses, messages, content, summaries
- Generate recommendations with confidence scores
- Classify, tag, route, and summarise
- Identify gaps, risks, and opportunities
- Produce itineraries, guides, and suggestions

AI may never:
- Publish, send, or post without explicit human approval
- Change pricing, cancel bookings, make legal or financial commitments
- Take any action that affects a guest without an approval gate
- Operate without a complete audit trail

All AI outputs are **draft-first**. The approval step is not optional.

## Discovery Doctrine

Every business discovered by PULSE begins as `Suggested`. It moves to `Approved` only after trust validation. Only `Approved` and `Preferred` businesses are visible to guests. The status pipeline is:

```
Suggested → Approved → Preferred
          → Hidden
          → Needs Review → Risk Flagged → Rejected
```

No guest sees an unvalidated business. This is not a performance issue — it is a trust commitment.

## Review Doctrine

Every review is a signal. No signal is allowed to dead-end.

- Positive review → generate growth opportunity (social amplification, repeat guest offer, review request)
- Negative review → generate operational action (maintenance task, housekeeping follow-up, manager escalation)

Every review must be connected to a guest, a booking, and a property at minimum.

## Multi-Tenancy Doctrine

PULSE OS is multi-tenant from day one. Farmstead is Tenant #001. The schema, the API, the permission model, and the AI governance layer must all operate as if there are 1,000 tenants. Nothing may be hardcoded that belongs to a specific tenant.

Tenant isolation is enforced at the Row Level Security layer in Supabase. No tenant may ever see another tenant's data.

## Phase Governance Doctrine

Build only within the active phase unless explicitly cross-phase work is logged. The purpose of phase governance is to prevent scope drift, not to limit ambition. Future phases must be visible, compelling, and architecturally ready — but not operational until their phase activates.

| Phase | Name | Status |
|-------|------|--------|
| 1 | Hospitality Operations OS | Active |
| 2 | Trust Intelligence | Active |
| 3 | Growth Intelligence | Planned |
| 4 | Local Ecosystem Intelligence | Planned |
| 5 | Destination Intelligence | Roadmap |
| 6 | Opportunity Intelligence | Roadmap |
| 7 | Sovereign Intelligence | Vision only |

## UX Doctrine

The interface must feel institutional, premium, calm, and trustworthy. The visual reference is Bloomberg Terminal, Palantir, airport operations centers, and mission-critical infrastructure — not consumer travel apps, startup dashboards, or social platforms.

High information density. Low visual noise. Operational clarity. Executive readability.

The gold (#C6A66B) accent is brand identity. The teal (#2BB8A5) is operational confirmation. Red (#ef4444) is critical urgency. Every color must carry meaning.

## Pricing Doctrine

| Tier | Price | Scope |
|------|-------|-------|
| Starter | R499/month | 1 property, core operations |
| Professional | R999/month | Up to 5 properties, full ops + Discovery + AI |
| Enterprise | Custom | Groups, lodges, portfolios, tourism boards |

Free trial available. No credit card required for trial start.

AI expenditure must remain below 15% of platform revenue at all times. Cost controls are a product responsibility, not a finance responsibility.
