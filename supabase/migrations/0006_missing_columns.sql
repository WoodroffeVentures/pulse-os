-- 0006_missing_columns.sql
-- Adds columns that were in 0002 but never applied to production
-- (0002 was marked applied without running — this reconciles)

ALTER TABLE properties ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS airbnb_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS operational_email text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS google_review_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS booking_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lekkeslaap_url text;

-- ical_sync_sources and property_knowledge are in 0002 and already IF NOT EXISTS
-- Ensure they exist
CREATE TABLE IF NOT EXISTS ical_sync_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id),
  platform text NOT NULL,
  ical_url text NOT NULL,
  last_synced_at timestamptz,
  sync_status text DEFAULT 'pending',
  last_error text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_guest_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_version text DEFAULT '1.0',
  organization_id uuid REFERENCES organizations(id),
  property_id uuid REFERENCES properties(id),
  actor_type text NOT NULL,
  actor_id uuid,
  correlation_id uuid,
  causation_id uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  idempotency_key text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS message_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  property_id uuid REFERENCES properties(id),
  guest_id uuid,
  channel text NOT NULL,
  direction text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'draft',
  ai_generated boolean DEFAULT false,
  approved_by uuid,
  booking_id uuid,
  created_at timestamptz DEFAULT now()
);

-- MVP extension tables (0003)
CREATE TABLE IF NOT EXISTS ical_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('airbnb','booking_com','lekkeslaap','direct','other')),
  feed_url text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sync_status text NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending','syncing','success','error','disabled')),
  last_synced_at timestamptz,
  last_error text,
  last_event_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(property_id, provider, feed_url)
);

CREATE TABLE IF NOT EXISTS work_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'maintenance',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','scoped','scheduled','in_progress','blocked','completed','cancelled')),
  priority risk_level NOT NULL DEFAULT 'medium',
  supplier_name text,
  estimated_cost numeric,
  actual_cost numeric,
  currency text NOT NULL DEFAULT 'ZAR',
  evidence_files jsonb NOT NULL DEFAULT '[]',
  lessons_learned text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE ical_sync_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ical_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ical_sync_sources' AND policyname='ical_sync_org') THEN
    CREATE POLICY ical_sync_org ON ical_sync_sources USING (exists(select 1 from organization_members where organization_id=ical_sync_sources.organization_id and user_id=auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_knowledge' AND policyname='knowledge_org') THEN
    CREATE POLICY knowledge_org ON property_knowledge USING (exists(select 1 from organization_members where organization_id=property_knowledge.organization_id and user_id=auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='platform_events' AND policyname='events_org') THEN
    CREATE POLICY events_org ON platform_events USING (organization_id IS NULL OR exists(select 1 from organization_members where organization_id=platform_events.organization_id and user_id=auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workflow_definitions' AND policyname='wf_org') THEN
    CREATE POLICY wf_org ON workflow_definitions USING (exists(select 1 from organization_members where organization_id=workflow_definitions.organization_id and user_id=auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='message_log' AND policyname='msg_org') THEN
    CREATE POLICY msg_org ON message_log USING (exists(select 1 from organization_members where organization_id=message_log.organization_id and user_id=auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ical_feeds' AND policyname='ical_feeds_org') THEN
    CREATE POLICY ical_feeds_org ON ical_feeds USING (exists(select 1 from organization_members where organization_id=ical_feeds.organization_id and user_id=auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_items' AND policyname='work_items_org') THEN
    CREATE POLICY work_items_org ON work_items USING (exists(select 1 from organization_members where organization_id=work_items.organization_id and user_id=auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_platform_events_org ON platform_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_platform_events_type ON platform_events(event_type);
