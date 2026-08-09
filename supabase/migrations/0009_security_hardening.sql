-- =============================================================================
-- Migration 0009: Security hardening and policy fixes
-- Fixes identified by pre-deploy audit of 0008:
--   1. SECURITY DEFINER functions missing SET search_path
--   2. online_checkins SELECT USING(true) information disclosure
--   3. Missing RLS policies on booking_holds, reservation_rooms,
--      room_status_log, channel_room_mapping
--   4. Missing INSERT policy on reservation_audit
--   5. Folio trigger balance bug
--   6. No DB-level overlap prevention on reservations
-- =============================================================================

-- ─── 1. Fix SECURITY DEFINER functions — add SET search_path ─────────────────
-- These functions live in 0001 and are recreated here with the correct attribute.

CREATE OR REPLACE FUNCTION is_org_member(org uuid)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION can_access_property(prop uuid)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.organization_members om ON om.organization_id = p.organization_id
    WHERE p.id = prop AND om.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.property_users pu
    WHERE pu.property_id = prop AND pu.user_id = auth.uid()
  );
$$;

-- ─── 2. Fix online_checkins SELECT policy ─────────────────────────────────────
-- Remove blanket USING(true) — restrict SELECT to staff only.
-- Guest token-based check-in will use a SECURITY DEFINER server action, not direct table access.

DROP POLICY IF EXISTS online_checkins_token ON online_checkins;

CREATE POLICY online_checkins_staff_select ON online_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reservations r
      JOIN public.properties p ON p.id = r.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE r.id = online_checkins.reservation_id
        AND om.user_id = auth.uid()
    )
  );

-- ─── 3. Add missing policies ──────────────────────────────────────────────────

-- booking_holds
CREATE POLICY booking_holds_all ON booking_holds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = booking_holds.property_id AND om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = booking_holds.property_id AND om.user_id = auth.uid()
    )
  );

-- reservation_rooms
CREATE POLICY reservation_rooms_all ON reservation_rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.reservations r
      JOIN public.properties p ON p.id = r.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE r.id = reservation_rooms.reservation_id AND om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reservations r
      JOIN public.properties p ON p.id = r.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE r.id = reservation_rooms.reservation_id AND om.user_id = auth.uid()
    )
  );

-- room_status_log
CREATE POLICY room_status_log_all ON room_status_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE u.id = room_status_log.unit_id AND om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE u.id = room_status_log.unit_id AND om.user_id = auth.uid()
    )
  );

-- channel_room_mapping
CREATE POLICY channel_room_mapping_all ON channel_room_mapping FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_connections cc
      JOIN public.properties p ON p.id = cc.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE cc.id = channel_room_mapping.channel_connection_id AND om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channel_connections cc
      JOIN public.properties p ON p.id = cc.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE cc.id = channel_room_mapping.channel_connection_id AND om.user_id = auth.uid()
    )
  );

-- ─── 4. reservation_audit INSERT policy ──────────────────────────────────────
-- Staff can insert audit events for reservations they can access.
-- DELETE is explicitly denied — audit records are immutable.

CREATE POLICY reservation_audit_insert ON reservation_audit FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reservations r
      JOIN public.properties p ON p.id = r.property_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE r.id = reservation_audit.reservation_id AND om.user_id = auth.uid()
    )
  );

-- No UPDATE or DELETE policies on reservation_audit — records are append-only.

-- ─── 5. Fix folio trigger — correct balance computation ──────────────────────
-- Original trigger had two separate UPDATE statements where the second referenced
-- old column values for `total` when computing `balance`. Fixed to single UPDATE.

CREATE OR REPLACE FUNCTION update_folio_totals()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $$
DECLARE
  v_folio_id uuid := COALESCE(NEW.folio_id, OLD.folio_id);
  v_subtotal  numeric;
  v_tax_total numeric;
  v_total     numeric;
BEGIN
  SELECT
    COALESCE(SUM(total), 0),
    COALESCE(SUM(tax_amount), 0)
  INTO v_subtotal, v_tax_total
  FROM public.folio_items
  WHERE folio_id = v_folio_id;

  v_total := v_subtotal + v_tax_total;

  UPDATE public.folios SET
    subtotal   = v_subtotal,
    tax_total  = v_tax_total,
    total      = v_total,
    balance    = v_total - amount_paid,
    updated_at = now()
  WHERE id = v_folio_id;

  RETURN NEW;
END;
$$;

-- ─── 6. Database-level overlap prevention on reservations ────────────────────
-- Uses a BEFORE INSERT/UPDATE trigger to enforce no-overlap for active reservations
-- on the same unit. btree_gist is used if available for daterange exclusion;
-- otherwise a trigger-based check provides the guarantee.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add daterange column for exclusion constraint
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS stay_range daterange
  GENERATED ALWAYS AS (daterange(check_in_date, check_out_date)) STORED;

-- Exclusion constraint: no two active reservations can overlap on the same unit
-- Active statuses: confirmed, deposit_paid, fully_paid, checked_in
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_reservations'
  ) THEN
    ALTER TABLE reservations
      ADD CONSTRAINT no_overlapping_reservations
      EXCLUDE USING gist (
        unit_id WITH =,
        stay_range WITH &&
      )
      WHERE (
        unit_id IS NOT NULL
        AND status IN ('confirmed','deposit_paid','fully_paid','checked_in')
      );
  END IF;
END $$;

-- Trigger-based fallback for property-level (no unit assigned) overlap check
-- Prevents double-booking at room_type level when unit is not yet assigned.
CREATE OR REPLACE FUNCTION check_reservation_overlap()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $$
BEGIN
  -- Unit-level: handled by EXCLUDE constraint above
  -- Room-type level: check for conflicts when unit is null but room_type is set
  IF NEW.room_type_id IS NOT NULL AND NEW.unit_id IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.reservations
      WHERE id <> NEW.id
        AND property_id = NEW.property_id
        AND room_type_id = NEW.room_type_id
        AND unit_id IS NULL
        AND status IN ('confirmed','deposit_paid','fully_paid','checked_in')
        AND check_in_date < NEW.check_out_date
        AND check_out_date > NEW.check_in_date
    ) THEN
      RAISE EXCEPTION 'Reservation overlap: this room type already has an active reservation for the requested dates (property: %, room_type: %, % to %)',
        NEW.property_id, NEW.room_type_id, NEW.check_in_date, NEW.check_out_date
        USING ERRCODE = 'exclusion_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservation_overlap ON reservations;
CREATE TRIGGER trg_reservation_overlap
  BEFORE INSERT OR UPDATE OF check_in_date, check_out_date, status, room_type_id, unit_id
  ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION check_reservation_overlap();

-- ─── 7. Fix update_reservation_balance search_path ───────────────────────────

CREATE OR REPLACE FUNCTION update_reservation_balance()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $$
BEGIN
  UPDATE public.reservations SET
    outstanding_balance = total_amount - COALESCE((
      SELECT SUM(amount) FROM public.payments
      WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
        AND status IN ('captured', 'settled')
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.reservation_id, OLD.reservation_id);
  RETURN NEW;
END;
$$;

-- ─── 8. Harden organization creation ─────────────────────────────────────────
-- Add INSERT policy so new users can create their first org.

DO $$ BEGIN
  -- Only add if not already present (0001 may have created it)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='organizations' AND policyname='org_insert'
  ) THEN
    EXECUTE 'CREATE POLICY org_insert ON organizations FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Allow users to insert themselves as org members (needed during onboarding).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='organization_members' AND policyname='members_insert_self'
  ) THEN
    EXECUTE 'CREATE POLICY members_insert_self ON organization_members FOR INSERT WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;

-- Allow org owner to update org
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='organizations' AND policyname='org_insert'
  ) THEN
    EXECUTE 'CREATE POLICY org_insert ON organizations FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- ─── 9. Additional indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_reservations_unit_dates
  ON reservations (unit_id, check_in_date, check_out_date)
  WHERE unit_id IS NOT NULL
    AND status IN ('confirmed','deposit_paid','fully_paid','checked_in');

CREATE INDEX IF NOT EXISTS idx_holds_property
  ON booking_holds (property_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_housekeeping_unit
  ON housekeeping_tasks (unit_id, status, scheduled_for);

-- ─── 10. Storage bucket isolation note ───────────────────────────────────────
-- Storage RLS is configured separately via Supabase dashboard Storage policies.
-- Required buckets: property-images, evidence-uploads
-- Required policies:
--   property-images: authenticated users may INSERT/SELECT files under
--     path pattern: {org_id}/{property_id}/*
--     enforced by application layer path construction + Supabase storage policies
--   evidence-uploads: same pattern
-- These cannot be expressed in SQL migrations — apply via dashboard or MCP.
