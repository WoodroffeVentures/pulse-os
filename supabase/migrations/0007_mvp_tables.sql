-- 0007_mvp_tables.sql
-- Tables from 0003 not yet applied to production.
-- 0006 already covered ical_feeds and work_items.
-- All RLS uses inline subqueries (no function dependency).

CREATE TABLE IF NOT EXISTS brain_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('wifi','sop','house_manual','guest_guide','maintenance','policy','lesson','local_recommendation','faq')),
  title text NOT NULL,
  content text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  guest_visible boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'manual',
  search_vector tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('photo','document','manual','floorplan','compliance','brand','other')),
  title text NOT NULL,
  storage_path text,
  external_url text,
  metadata jsonb NOT NULL DEFAULT '{}',
  guest_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guest_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp','email','sms','phone','platform')),
  direction text NOT NULL CHECK (direction IN ('inbound','outbound','draft')),
  subject text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','sent','delivered','failed','archived')),
  ai_generated boolean NOT NULL DEFAULT false,
  approved_by uuid REFERENCES auth.users(id),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guest_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  note_type text NOT NULL DEFAULT 'general' CHECK (note_type IN ('preference','issue','repeat_guest','accessibility','general')),
  note text NOT NULL,
  visibility text NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal','manager_only')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  platform text NOT NULL DEFAULT 'google',
  request_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','sent','completed','cancelled')),
  message_draft text,
  ai_generated boolean NOT NULL DEFAULT false,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  sections jsonb NOT NULL DEFAULT '[]',
  public_share_token text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(property_id, slug)
);

CREATE TABLE IF NOT EXISTS operational_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  asset_class text NOT NULL CHECK (asset_class IN ('house_manual','sop','wifi','checklist','vendor','policy','other')),
  title text NOT NULL,
  body text,
  storage_path text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offline_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_name text NOT NULL DEFAULT 'offline_html_bridge',
  imported_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','validated','imported','failed')),
  summary jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offline_import_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES offline_import_batches(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  external_key text,
  payload jsonb NOT NULL DEFAULT '{}',
  import_status text NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending','imported','skipped','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brain_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_import_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='brain_entries' AND policyname='brain_entries_org') THEN
    CREATE POLICY brain_entries_org ON brain_entries USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=brain_entries.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_assets' AND policyname='property_assets_org') THEN
    CREATE POLICY property_assets_org ON property_assets USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=property_assets.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='guest_communications' AND policyname='guest_comms_org') THEN
    CREATE POLICY guest_comms_org ON guest_communications USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=guest_communications.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='guest_notes' AND policyname='guest_notes_org') THEN
    CREATE POLICY guest_notes_org ON guest_notes USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=guest_notes.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_requests' AND policyname='review_requests_org') THEN
    CREATE POLICY review_requests_org ON review_requests USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=review_requests.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_guides' AND policyname='property_guides_org') THEN
    CREATE POLICY property_guides_org ON property_guides USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=property_guides.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='operational_assets' AND policyname='operational_assets_org') THEN
    CREATE POLICY operational_assets_org ON operational_assets USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=operational_assets.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='offline_import_batches' AND policyname='offline_batches_org') THEN
    CREATE POLICY offline_batches_org ON offline_import_batches USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=offline_import_batches.organization_id AND user_id=auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='offline_import_records' AND policyname='offline_records_org') THEN
    CREATE POLICY offline_records_org ON offline_import_records USING (
      EXISTS(SELECT 1 FROM organization_members WHERE organization_id=offline_import_records.organization_id AND user_id=auth.uid())
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_brain_entries_search ON brain_entries USING gin(search_vector);

-- Trigger to keep search_vector updated
CREATE OR REPLACE FUNCTION pulse_brain_entries_tsv() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title,'') || ' ' || coalesce(NEW.content,'') || ' ' || array_to_string(NEW.tags, ' ')
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_brain_entries_tsv ON brain_entries;
CREATE TRIGGER trg_brain_entries_tsv
  BEFORE INSERT OR UPDATE ON brain_entries
  FOR EACH ROW EXECUTE FUNCTION pulse_brain_entries_tsv();
CREATE INDEX IF NOT EXISTS idx_brain_entries_org ON brain_entries(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_guest_comms_guest ON guest_communications(guest_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_notes_guest ON guest_notes(guest_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_guides_slug ON property_guides(property_id, slug);
