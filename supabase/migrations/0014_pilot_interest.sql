-- Pilot interest submissions from the public landing page.
-- No authentication required to insert. Read restricted to org owners.

CREATE TABLE IF NOT EXISTS pilot_interest (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  organisation  text NOT NULL,
  role          text,
  email         text NOT NULL,
  phone         text,
  interest_type text NOT NULL DEFAULT 'general',
  message       text,
  source        text DEFAULT 'landing-page',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Public can insert (no auth required for pilot interest form).
ALTER TABLE pilot_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY pilot_interest_insert ON pilot_interest
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (admin review).
CREATE POLICY pilot_interest_select ON pilot_interest
  FOR SELECT USING (auth.role() = 'authenticated');
