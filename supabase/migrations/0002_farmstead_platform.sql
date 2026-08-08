-- 0002_farmstead_platform.sql
-- Extends the core schema with Farmstead-specific tables and Phase 1 features

-- Extend properties table with platform-specific columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS airbnb_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS operational_email text;

-- iCal sync sources
CREATE TABLE IF NOT EXISTS ical_sync_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id),
  platform text NOT NULL, -- 'airbnb' | 'booking_com' | 'lekkeslaap' | 'direct'
  ical_url text NOT NULL,
  last_synced_at timestamptz,
  sync_status text DEFAULT 'pending', -- 'pending' | 'syncing' | 'success' | 'error'
  last_error text,
  created_at timestamptz DEFAULT now()
);

-- Property knowledge base
CREATE TABLE IF NOT EXISTS property_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id),
  category text NOT NULL, -- 'appliance' | 'checkin' | 'wifi' | 'faq' | 'policy' | 'instruction'
  title text NOT NULL,
  content text NOT NULL,
  is_guest_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform event bus / audit log
CREATE TABLE IF NOT EXISTS platform_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_version text DEFAULT '1.0',
  organization_id uuid REFERENCES organizations(id),
  property_id uuid REFERENCES properties(id),
  actor_type text NOT NULL, -- 'user' | 'system' | 'ai' | 'integration'
  actor_id uuid,
  correlation_id uuid,
  causation_id uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  idempotency_key text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_events_org ON platform_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_platform_events_type ON platform_events(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_events_created ON platform_events(created_at DESC);

-- Workflow definitions
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  conditions jsonb DEFAULT '[]',
  actions jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Message log (WhatsApp/Email drafts)
CREATE TABLE IF NOT EXISTS message_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  property_id uuid REFERENCES properties(id),
  guest_id uuid,
  channel text NOT NULL, -- 'whatsapp' | 'email' | 'sms'
  direction text NOT NULL, -- 'inbound' | 'outbound' | 'draft'
  content text NOT NULL,
  status text DEFAULT 'draft', -- 'draft' | 'pending_approval' | 'sent' | 'delivered' | 'failed'
  ai_generated boolean DEFAULT false,
  approved_by uuid,
  booking_id uuid,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE ical_sync_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ical_sync_sources' AND policyname = 'ical_sync_org_isolation'
  ) THEN
    CREATE POLICY "ical_sync_org_isolation" ON ical_sync_sources
      USING (is_org_member(organization_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'property_knowledge' AND policyname = 'property_knowledge_org_isolation'
  ) THEN
    CREATE POLICY "property_knowledge_org_isolation" ON property_knowledge
      USING (is_org_member(organization_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'platform_events' AND policyname = 'platform_events_org_isolation'
  ) THEN
    CREATE POLICY "platform_events_org_isolation" ON platform_events
      USING (organization_id IS NULL OR is_org_member(organization_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workflow_definitions' AND policyname = 'workflow_definitions_org_isolation'
  ) THEN
    CREATE POLICY "workflow_definitions_org_isolation" ON workflow_definitions
      USING (is_org_member(organization_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_log' AND policyname = 'message_log_org_isolation'
  ) THEN
    CREATE POLICY "message_log_org_isolation" ON message_log
      USING (is_org_member(organization_id));
  END IF;
END $$;
