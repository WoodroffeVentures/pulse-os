-- Fix infinite recursion in property_users SELECT policy.
-- The existing policy queries property_users from within a property_users SELECT policy,
-- causing "infinite recursion detected in policy for relation property_users".
-- Fix: simple self-reference check (user_id = auth.uid()) identical to the 0010 fix for organization_members.

DROP POLICY IF EXISTS property_users_select ON property_users;

CREATE POLICY property_users_select ON property_users
  FOR SELECT
  USING (user_id = auth.uid());
