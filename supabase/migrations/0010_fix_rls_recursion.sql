-- Fix: organization_members SELECT policy causes infinite recursion.
-- Policy was: EXISTS (SELECT 1 FROM organization_members WHERE ...)
-- which re-triggers the same policy endlessly.
-- Fix: each user may SELECT only their own membership rows.

DROP POLICY IF EXISTS members_select ON organization_members;

CREATE POLICY members_select ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- Also ensure org SELECT works — org owner sees their org via membership
DROP POLICY IF EXISTS org_select ON organizations;

CREATE POLICY org_select ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
        AND user_id = auth.uid()
    )
  );
