// Southern Drakensberg pilot demo dataset
// All data is FICTIONAL — clearly labelled demo content.
// Used only for tourism-board presentation purposes.

export const DEMO_LABEL = '⬛ DEMO DATA — Southern Drakensberg Pilot Scenario';

export const drakensbergOrg = {
  id: 'demo-org-drakensberg-001',
  name: 'Southern Drakensberg Tourism Board',
  region: 'Southern Drakensberg, KwaZulu-Natal',
  districts: ['Underberg', 'Himeville', 'Sani Pass', 'Nottingham Road'],
};

export const drakensbergProperties = [
  { id: 'd-prop-001', name: 'Sani Stone Lodge', type: 'lodge', district: 'Sani Pass', status: 'verified', rating: 4.7, rooms: 12 },
  { id: 'd-prop-002', name: 'Underberg Country Inn', type: 'inn', district: 'Underberg', status: 'verified', rating: 4.3, rooms: 8 },
  { id: 'd-prop-003', name: 'Himeville Arms Hotel', type: 'hotel', district: 'Himeville', status: 'verified', rating: 4.5, rooms: 16 },
  { id: 'd-prop-004', name: 'Berg Valley Farm Stay', type: 'farmstay', district: 'Underberg', status: 'pending', rating: 4.1, rooms: 4 },
  { id: 'd-prop-005', name: 'Drakensberg Summit Retreat', type: 'lodge', district: 'Sani Pass', status: 'verified', rating: 4.8, rooms: 6 },
  { id: 'd-prop-006', name: 'Nottingham Road Guesthouse', type: 'guesthouse', district: 'Nottingham Road', status: 'needs_review', rating: 3.9, rooms: 5 },
];

export const drakensbergBusinesses = [
  { id: 'd-biz-001', name: 'Thabo Mokoena Photography', category: 'photography', owner: 'Thabo Mokoena', district: 'Underberg', status: 'verified', evidenceScore: 82 },
  { id: 'd-biz-002', name: 'Zulu Craft Brewery', category: 'food_beverage', owner: 'Sipho Nzimande', district: 'Himeville', status: 'verified', evidenceScore: 91 },
  { id: 'd-biz-003', name: 'Nomvula Wellness Studio', category: 'wellness', owner: 'Nomvula Abrahams', district: 'Underberg', status: 'pending', evidenceScore: 64 },
  { id: 'd-biz-004', name: 'Lerato Mountain Guides', category: 'adventure', owner: 'Lerato Phiri', district: 'Sani Pass', status: 'pending', evidenceScore: 58 },
  { id: 'd-biz-005', name: 'Mpho Artisan Collective', category: 'community_enterprise', owner: 'Mpho Zulu', district: 'Underberg', status: 'verified', evidenceScore: 77 },
  { id: 'd-biz-006', name: 'Cronje Fly Fishing', category: 'adventure', owner: 'David Cronje', district: 'Nottingham Road', status: 'unverified', evidenceScore: 31 },
  { id: 'd-biz-007', name: 'Berg & Valley Tours', category: 'transport_tours', owner: 'Zanele Dube', district: 'Underberg', status: 'verified', evidenceScore: 85 },
  { id: 'd-biz-008', name: 'Sani Pass Kitchen', category: 'food_beverage', owner: 'Fikile Ntuli', district: 'Sani Pass', status: 'verified', evidenceScore: 79 },
];

export const drakensbergOpportunities = [
  {
    id: 'opp-001', title: 'Winter Wellness Retreat Package', type: 'seasonal_activation',
    proposer: 'Nomvula Abrahams', proposerBiz: 'Nomvula Wellness Studio',
    targetVenue: 'Sani Stone Lodge', revenueShare: '65% venue / 35% proposer',
    score: 81, status: 'open', jvActive: false, foc: true,
    description: 'Yoga, breathwork and cold-water immersion sessions for lodge guests. Offered FOC to the venue.',
  },
  {
    id: 'opp-002', title: 'Craft Beer & Local Cuisine Evenings', type: 'fb_programme',
    proposer: 'Sipho Nzimande', proposerBiz: 'Zulu Craft Brewery',
    targetVenue: 'Himeville Arms Hotel', revenueShare: '60% venue / 40% proposer',
    score: 88, status: 'in_review', jvActive: false, foc: true,
    description: 'Weekly tasting events featuring locally brewed craft beer paired with regional cuisine.',
  },
  {
    id: 'opp-003', title: 'Mountain Photography Experience', type: 'guest_experience',
    proposer: 'Thabo Mokoena', proposerBiz: 'Thabo Mokoena Photography',
    targetVenue: 'Sani Stone Lodge', revenueShare: '60% venue / 40% proposer',
    score: 74, status: 'jv_active', jvActive: true, foc: true,
    description: 'Professional landscape and guest lifestyle photography. JV account open. R 18,400 revenue to date.',
  },
  {
    id: 'opp-004', title: 'Sani Pass Trail Guide Service', type: 'adventure',
    proposer: 'Lerato Phiri', proposerBiz: 'Lerato Mountain Guides',
    targetVenue: 'Drakensberg Summit Retreat', revenueShare: '55% venue / 45% proposer',
    score: 51, status: 'conditional', jvActive: false, foc: true,
    description: 'Guided trails to Sani Pass and into Lesotho. Conditional — guide certification needs renewal.',
  },
  {
    id: 'opp-005', title: 'Basotho Craft Market Activation', type: 'community_partnership',
    proposer: 'Mpho Zulu', proposerBiz: 'Mpho Artisan Collective',
    targetVenue: 'Underberg Country Inn', revenueShare: '50% venue / 50% proposer',
    score: 79, status: 'accepted', jvActive: true, foc: true,
    description: 'Weekly craft market on venue grounds featuring Basotho artisans. Community SME focus.',
  },
  {
    id: 'opp-006', title: 'Fly Fishing Weekend Package', type: 'event_activation',
    proposer: 'David Cronje', proposerBiz: 'Cronje Fly Fishing',
    targetVenue: 'Berg Valley Farm Stay', revenueShare: '60% venue / 40% proposer',
    score: 38, status: 'declined', jvActive: false, foc: true,
    description: 'Declined — insufficient evidence. Proposer requires profile verification before resubmission.',
  },
];

export const boardMetrics = {
  verifiedProfiles: 14,
  totalProfiles: 22,
  pendingVerification: 5,
  needsReview: 3,
  activeOpportunities: 8,
  openOpportunities: 4,
  jvActive: 2,
  acceptanceRate: 71,
  avgViabilityScore: 74,
  totalJvRevenue: 84200,
  avgTimeToActivation: 4.2,
  communityParticipants: 5,
  smeParticipants: 8,
  infrastructureConstraint: 'Sani Pass road — seasonal accessibility limits participation windows (June–August)',
  dataQualityScore: 68,
  outcomeEvidenceComplete: 4,
  outcomeEvidencePending: 2,
};

export const guestIntentPatterns = [
  { intent: 'Adventure & hiking', share: 34, trend: '+8%' },
  { intent: 'Wellness & retreat', share: 22, trend: '+15%' },
  { intent: 'Scenic drives & Sani Pass', share: 18, trend: '+3%' },
  { intent: 'Family with children', share: 14, trend: '-2%' },
  { intent: 'Food & local culture', share: 8, trend: '+11%' },
  { intent: 'Photography & nature', share: 4, trend: '+22%' },
];

export const boardPresentationSteps = [
  {
    step: 1, title: 'The Regional Problem',
    summary: 'Tourism spend in the Southern Drakensberg is fragmented. Visitors lack verified, connected local discovery. Local businesses have no structured channel to participate in tourism activation.',
    metric: '73% of local businesses have no verified digital presence',
    metricLabel: 'Estimated — demo',
  },
  {
    step: 2, title: 'The Verified Destination Network',
    summary: 'PULSE builds a verified network of properties, businesses and experiences — each with evidence-graded profiles. Not a directory. Not paid rankings. Participation based on evidence.',
    metric: '14 verified profiles · 8 pending · 3 requiring review',
    metricLabel: 'Demo data · Drakensberg pilot',
  },
  {
    step: 3, title: 'Guest Demand & Discovery',
    summary: 'Guest intent signals are aggregated — anonymised and privacy-respecting — into regional demand patterns. Adventure and wellness lead. Photography intent is growing fastest.',
    metric: 'Adventure 34% · Wellness 22% · Sani Pass 18%',
    metricLabel: 'Demo intent pattern · not real analytics',
  },
  {
    step: 4, title: 'Opportunity Creation',
    summary: 'Any verified business or individual can pitch an opportunity to a venue — offering their skills or services for free in return for a structured JV revenue share. No cost to pitch.',
    metric: '8 active opportunities · 4 awaiting venue decision',
    metricLabel: 'Demo data',
  },
  {
    step: 5, title: 'Business Matching & Readiness',
    summary: 'Every opportunity is scored by the PULSE Viability Engine before the venue sees it. Score is deterministic, evidence-based, and explainable. Venues see missing evidence, not just a number.',
    metric: 'Avg viability score: 74/100 · Acceptance rate: 71%',
    metricLabel: 'Demo data',
  },
  {
    step: 6, title: 'Activation & Measured Outcomes',
    summary: 'Accepted opportunities open a shared JV account. Revenue is tracked and split transparently. Every milestone and outcome feeds the Participation Graph.',
    metric: 'R 84,200 JV revenue tracked · 2 active JV accounts',
    metricLabel: 'Demo data · not real revenue',
  },
  {
    step: 7, title: 'Proposed Southern Drakensberg Pilot',
    summary: '90-day pilot: onboard 20 verified businesses, create 10 structured opportunities, activate 5 JV accounts. Tourism board receives a live participation dashboard with real data.',
    metric: '90 days · 20 businesses · 5 JV activations',
    metricLabel: 'Proposed · subject to board decision',
  },
];
