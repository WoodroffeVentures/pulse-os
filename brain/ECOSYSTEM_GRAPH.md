# ECOSYSTEM GRAPH
*The full relationship model between all platform entities. Every module must connect to this graph.*

---

## Core Entity Map

```
GUEST
  ├── has many BOOKINGS
  ├── has many REVIEWS
  ├── has many COMMUNICATIONS
  ├── has many PREFERENCES
  └── creates PARTICIPATION SIGNALS

BOOKING
  ├── belongs to GUEST
  ├── belongs to PROPERTY
  ├── belongs to UNIT (optional)
  ├── has source CHANNEL
  ├── triggers TASKS (via workflow)
  ├── triggers COMMUNICATIONS
  ├── creates REVIEW_REQUEST
  └── feeds REVENUE_INTELLIGENCE

PROPERTY
  ├── belongs to ORGANIZATION (tenant)
  ├── has many UNITS
  ├── has many BOOKINGS
  ├── has many TASKS
  ├── has many REVIEWS
  ├── has many MAINTENANCE_ISSUES
  ├── has many ASSETS
  ├── has READINESS_SCORE (computed)
  ├── has iCAL_SYNC_SOURCES
  ├── has KNOWLEDGE_ENTRIES (brain)
  ├── has GUEST_GUIDES
  └── has DISCOVERY_REGION → local vendors, attractions, experiences

TASK
  ├── belongs to PROPERTY
  ├── optionally linked to BOOKING
  ├── optionally linked to MAINTENANCE_ISSUE
  ├── optionally linked to REVIEW (negative → creates task)
  ├── has CATEGORY (housekeeping | maintenance | guest_services | compliance | inspection)
  ├── has ASSIGNEE (staff member)
  ├── has SLA timer
  └── feeds READINESS_SCORE

REVIEW
  ├── belongs to GUEST
  ├── belongs to BOOKING
  ├── belongs to PROPERTY
  ├── has PLATFORM source
  ├── has SENTIMENT (computed)
  ├── has TOPIC_TAGS (AI-extracted)
  ├── triggers TASKS (negative reviews)
  ├── triggers SOCIAL_CONTENT (positive reviews)
  ├── triggers AI_DRAFT_RESPONSE
  └── feeds VENDOR_TRUST_SCORE (if vendor mentioned)

VENDOR (local business)
  ├── has DISCOVERY_STATUS (suggested → approved → preferred)
  ├── has TRUST_SCORE (computed, 0–100)
  ├── has CATEGORY
  ├── has DISTANCE from property
  ├── receives GUEST_REFERRALS
  ├── receives GUEST_FEEDBACK
  ├── feeds ITINERARY_GENERATION
  └── feeds DESTINATION_INTELLIGENCE

CHANNEL (OTA)
  ├── has iCAL_URL
  ├── syncs BOOKINGS
  ├── has PERFORMANCE_METRICS (revenue, commission, booking count)
  └── feeds REVENUE_INTELLIGENCE

OPPORTUNITY (Phase 6)
  ├── has REQUIREMENTS (rating, availability, response time, verification)
  ├── has OPERATORS_MATCHED (via PULSE Score)
  ├── has PARTICIPATION_RECORDS
  └── feeds PARTICIPATION_GRAPH

ORGANIZATION (tenant)
  ├── has many PROPERTIES
  ├── has many USERS (staff)
  ├── has SUBSCRIPTION_TIER
  ├── has AI_USAGE_BUDGET
  └── is isolated by RLS
```

---

## Key Edges (Data Flows)

### Operational Loop
```
BOOKING → TASK (pre-arrival workflow)
TASK → READINESS_SCORE
READINESS_SCORE → MORNING_BRIEF
MORNING_BRIEF → OPERATOR_ACTION
```

### Review Intelligence Loop
```
REVIEW (negative) → TASK (maintenance/housekeeping)
REVIEW (positive) → SOCIAL_CONTENT suggestion
REVIEW (any) → AI_DRAFT_RESPONSE (approval-gated)
REVIEW (vendor mention) → VENDOR_TRUST_SCORE update
```

### Discovery + Trust Loop
```
PROPERTY_LOCATION → AUTO_DISCOVERY (Google Places)
DISCOVERY → TRUST_SCORE (Edge Function)
TRUST_SCORE → OPERATOR_APPROVAL_QUEUE
APPROVED_VENDOR → GUEST_FACING_DISCOVERY
GUEST_INTERACTION → VENDOR_FEEDBACK → TRUST_SCORE update
```

### Revenue Intelligence Loop
```
BOOKINGS → OCCUPANCY_CALCULATION
OCCUPANCY_CALCULATION → GAP_DETECTION
GAP_DETECTION → REVENUE_ALERT
REVENUE_ALERT → AI_PROMOTION_DRAFT (approval-gated)
PROMOTION → CHANNEL_DISTRIBUTION
```

### Guest Journey Loop
```
GETAWAY_SEARCH → PROPERTY_MATCH
PROPERTY_MATCH → ITINERARY_GENERATION (vendors + activities)
BOOKING → COMMUNICATION_SEQUENCE
CHECKOUT → REVIEW_REQUEST
REVIEW → PARTICIPATION_SIGNAL
REPEAT_BOOKING → VIP_STATUS
```

### Participation Graph Loop (Phase 6+)
```
OPERATION → PARTICIPATION_SIGNAL
PARTICIPATION_SIGNAL → PULSE_SCORE
PULSE_SCORE → OPPORTUNITY_MATCHING
OPPORTUNITY_PARTICIPATION → OUTCOME_MEASUREMENT
OUTCOME_MEASUREMENT → PARTICIPATION_GRAPH
PARTICIPATION_GRAPH → DESTINATION_INTELLIGENCE
```

---

## Current Connection Status

| Module | Graph Connected | Key Edges Active |
|--------|----------------|-----------------|
| Morning Brief | ✓ | Reads: properties, bookings, tasks, reviews |
| Bookings | ✓ | Creates: tasks via workflow, feeds channel performance |
| Tasks | ✓ | Updates: readiness score, links to maintenance |
| Reviews | ✓ (UI) | Links to: tasks (negative), social (positive) — production pending |
| Guest CRM | ✓ (UI) | Links to: bookings, communications, reviews |
| Trust Intelligence | ✓ (UI) | Links to: discovery, vendor scores — production pending |
| Local Discovery | ✓ (UI) | Links to: vendors, trust scores, itineraries |
| iCal Sync | ✗ | Needs: Edge Function implementation |
| AI Gateway | ✗ | Needs: Edge Function + real routing |
| Opportunity Intelligence | Demo only | Phase 6 |
| Destination Intelligence | Demo only | Phase 5 |
| Participation Graph | Schema only | Phase 4+ |

---

## Disconnected Modules (Risk)

The following modules are currently isolated from the graph and must be connected:

1. **Social Media page** — currently has no connection to Review Intelligence or Guest CRM. Social content should be derived from positive reviews and booking data. *Priority: Medium.*

2. **Works Register** — capital works are not currently linked to Asset Register or Maintenance Lifecycle. *Priority: Low.*

3. **Farm Operations** — farm-level infrastructure status not currently connected to Property Readiness scoring. A power outage should affect readiness. *Priority: Medium.*

4. **Revenue Gaps** — currently standalone. Needs to feed back into Channel Distribution and Social Growth Engine. *Priority: High.*

5. **AI Getaway Engine** — currently static. Must be connected to real property data, trust-scored vendors, and local events when production-ready. *Priority: High for Phase 2.*
