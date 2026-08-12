-- Migration 0015: Opportunity Radar metadata
--
-- Adds nullable/defaulted columns to opportunities that drive
-- the Radar ranked view and Workspace header.
-- All columns are additive — no existing data is affected.

ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS readiness_score  numeric       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS urgency          text          DEFAULT 'normal'
                                            CHECK (urgency IN ('critical','high','normal','low')),
  ADD COLUMN IF NOT EXISTS owner_user_id    uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS next_decision    text          DEFAULT NULL;

-- Index for radar ordering
CREATE INDEX IF NOT EXISTS opportunities_urgency_created_idx
  ON opportunities (organization_id, urgency, created_at DESC);
