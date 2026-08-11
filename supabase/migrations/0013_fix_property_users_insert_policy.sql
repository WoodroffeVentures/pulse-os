-- Add missing INSERT policy for property_users.
-- Without this, no authenticated user can add property staff even with org_owner role.
-- Org owners and group managers may add users to properties within their organisation.

CREATE POLICY property_users_insert ON property_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN properties p ON p.organization_id = om.organization_id
      WHERE p.id = property_users.property_id
        AND om.user_id = auth.uid()
        AND om.role IN ('org_owner', 'group_manager')
    )
  );
