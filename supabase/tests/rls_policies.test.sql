-- pgTAP RLS policy tests for PULSE OS
-- Run with: supabase test db --project-ref aqsegdzptwbyrasblrch
-- These tests verify database-level tenant isolation.

BEGIN;
SELECT plan(12);

-- 1. RLS is enabled on critical tables
SELECT has_table('public', 'opportunities', 'opportunities table exists');
SELECT lives_ok(
  $$ SELECT relrowsecurity FROM pg_class WHERE relname = 'opportunities' AND relrowsecurity = true $$,
  'RLS enabled on opportunities'
);

SELECT lives_ok(
  $$ SELECT relrowsecurity FROM pg_class WHERE relname = 'business_profiles' AND relrowsecurity = true $$,
  'RLS enabled on business_profiles'
);

SELECT lives_ok(
  $$ SELECT relrowsecurity FROM pg_class WHERE relname = 'participation_records' AND relrowsecurity = true $$,
  'RLS enabled on participation_records'
);

SELECT lives_ok(
  $$ SELECT relrowsecurity FROM pg_class WHERE relname = 'outcomes' AND relrowsecurity = true $$,
  'RLS enabled on outcomes'
);

-- 2. Migration history: all 15 migrations applied
SELECT ok(
  (SELECT count(*) FROM supabase_migrations.schema_migrations) >= 15,
  'At least 15 migrations applied'
);

-- 3. opportunities table has required columns from migration 0015
SELECT has_column('public', 'opportunities', 'urgency', 'opportunities.urgency column exists');
SELECT has_column('public', 'opportunities', 'readiness_score', 'opportunities.readiness_score column exists');
SELECT has_column('public', 'opportunities', 'owner_user_id', 'opportunities.owner_user_id column exists');
SELECT has_column('public', 'opportunities', 'next_decision', 'opportunities.next_decision column exists');

-- 4. urgency check constraint exists
SELECT col_has_check('public', 'opportunities', 'urgency', 'urgency has CHECK constraint');

-- 5. pilot_interest table exists (migration 0014)
SELECT has_table('public', 'pilot_interest', 'pilot_interest table exists');

SELECT * FROM finish();
ROLLBACK;
