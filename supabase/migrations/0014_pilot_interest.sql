-- Migration 0014: pilot_interest
--
-- Stores public pilot-interest submissions from the landing page.
-- Security model:
--   • Anonymous and authenticated users may INSERT (public submission).
--   • No client-side SELECT is permitted for any user including authenticated
--     org owners, because this table contains personal data (name, email, phone)
--     that must not be readable by ordinary tenant sessions.
--   • The platform_admin role exists in the user_role enum but is not yet
--     wired to a verified server-side check that prevents impersonation.
--     Until a proper platform-admin RLS guard is implemented, client-side
--     reads are blocked entirely. Submissions must be reviewed through a
--     trusted server-side or service-role administration path
--     (e.g. Supabase Dashboard → Table Editor, or a server-side admin API
--     route that authenticates the request before querying with the service role).
--   • UPDATE and DELETE are blocked for all clients.
--
-- To review submissions as a platform admin:
--   Use the Supabase Dashboard → Table Editor → pilot_interest,
--   or query via a server-side admin endpoint using the service-role key.

-- ── Create table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pilot_interest (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 200),
  organisation  text        NOT NULL CHECK (char_length(trim(organisation)) BETWEEN 1 AND 200),
  role          text        CHECK (role IS NULL OR char_length(trim(role)) <= 100),
  email         text        NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text        CHECK (phone IS NULL OR char_length(trim(phone)) <= 30),
  interest_type text        NOT NULL DEFAULT 'general'
                            CHECK (interest_type IN (
                              'general','hospitality','destination','business',
                              'university','investor','government'
                            )),
  message       text        CHECK (message IS NULL OR char_length(message) <= 2000),
  source        text        NOT NULL DEFAULT 'landing-page',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE pilot_interest ENABLE ROW LEVEL SECURITY;

-- Revoke default privileges on this table from the authenticated and anon roles
-- so that only explicitly granted operations are possible.
REVOKE ALL ON pilot_interest FROM anon, authenticated;

-- Grant INSERT only to the anon role (public landing-page submissions).
GRANT INSERT ON pilot_interest TO anon;

-- Grant INSERT to authenticated users in case they submit from a signed-in session.
GRANT INSERT ON pilot_interest TO authenticated;

-- No SELECT, UPDATE or DELETE granted to anon or authenticated.
-- The service_role (used by the Supabase Dashboard and server-side admin routes)
-- retains full access by default and is not affected by RLS.

-- ── INSERT policies ─────────────────────────────────────────────────────────
-- Drop and recreate safely so this migration is repeatable.
DROP POLICY IF EXISTS pilot_interest_anon_insert ON pilot_interest;
CREATE POLICY pilot_interest_anon_insert ON pilot_interest
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS pilot_interest_auth_insert ON pilot_interest;
CREATE POLICY pilot_interest_auth_insert ON pilot_interest
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ── Explicit deny policies ───────────────────────────────────────────────────
-- PostgreSQL RLS is deny-by-default when RLS is enabled and no USING policy
-- matches. Because we have not granted SELECT, UPDATE or DELETE to anon or
-- authenticated, no additional DENY policies are required. The REVOKE above
-- ensures these roles cannot perform those operations even if a policy existed.

-- ── Index ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS pilot_interest_created_at_idx ON pilot_interest (created_at DESC);
CREATE INDEX IF NOT EXISTS pilot_interest_email_idx ON pilot_interest (lower(email));
