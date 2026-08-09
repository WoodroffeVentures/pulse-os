-- =============================================================================
-- Migration 0008: Hospitality Core
-- NightsBridge parity baseline + PULSE enhancements
-- Forward-only, idempotent via IF NOT EXISTS / DO $$ blocks
-- =============================================================================

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM (
    'quote','hold','confirmed','deposit_paid','fully_paid',
    'checked_in','checked_out','cancelled','no_show','voided'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE folio_status AS ENUM ('open','closed','invoiced','paid','void');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'cash','eft','card_present','card_online','payment_link',
    'virtual_card','credit_note','account_transfer','other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending','authorised','captured','settled','refunded',
    'partially_refunded','failed','disputed','void'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE room_status AS ENUM (
    'vacant_clean','vacant_dirty','occupied','out_of_order',
    'out_of_service','maintenance','inspection'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE channel_status AS ENUM (
    'disconnected','connecting','connected','error','suspended'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE connector_capability AS ENUM (
    'live_certified','adapter_ready','blocked_external_certification','not_built'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rate_type AS ENUM (
    'standard','weekend','seasonal','promotional','package',
    'corporate','agent','last_minute','early_bird','event'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── PROPERTY SETTINGS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS property_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL UNIQUE,
  check_in_time         time DEFAULT '14:00',
  check_out_time        time DEFAULT '10:00',
  default_currency      text DEFAULT 'ZAR',
  vat_registered        boolean DEFAULT false,
  vat_number            text,
  vat_rate              numeric DEFAULT 0,
  tourism_levy_rate     numeric DEFAULT 0,
  bank_name             text,
  bank_account_ref      text,
  invoice_prefix        text DEFAULT 'INV',
  invoice_sequence      bigint DEFAULT 1,
  min_nights_default    int DEFAULT 1,
  max_nights_default    int DEFAULT 30,
  deposit_policy        jsonb DEFAULT '{"type":"percentage","value":50,"days_before":14}',
  cancellation_policy   jsonb DEFAULT '{"type":"flexible","refund_days":7}',
  child_policy          jsonb DEFAULT '{"max_age":12,"extra_charge":false}',
  pet_policy            jsonb DEFAULT '{"allowed":false}',
  payment_terms_days    int DEFAULT 0,
  confirmation_template text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ─── ROOM TYPES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS room_types (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  name              text NOT NULL,
  code              text,                        -- short code e.g. DBL, STD
  description       text,
  max_adults        int DEFAULT 2,
  max_children      int DEFAULT 0,
  max_occupancy     int DEFAULT 2,
  bed_configuration text,                        -- e.g. "1 king or 2 singles"
  size_sqm          numeric,
  amenities         jsonb DEFAULT '[]',
  images            jsonb DEFAULT '[]',          -- [{url, caption, sort_order, source}]
  is_active         boolean DEFAULT true,
  sort_order        int DEFAULT 0,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Link units to room types
ALTER TABLE units ADD COLUMN IF NOT EXISTS room_type_id uuid REFERENCES room_types(id);
ALTER TABLE units ADD COLUMN IF NOT EXISTS room_number text;
ALTER TABLE units ADD COLUMN IF NOT EXISTS floor_number int;
ALTER TABLE units ADD COLUMN IF NOT EXISTS current_room_status room_status DEFAULT 'vacant_clean';
ALTER TABLE units ADD COLUMN IF NOT EXISTS last_status_change timestamptz DEFAULT now();
ALTER TABLE units ADD COLUMN IF NOT EXISTS is_sellable boolean DEFAULT true;
ALTER TABLE units ADD COLUMN IF NOT EXISTS channel_unit_codes jsonb DEFAULT '{}'; -- {channel_id: external_code}

-- ─── RATE PLANS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rate_plans (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  name                  text NOT NULL,
  code                  text,
  rate_type             rate_type DEFAULT 'standard',
  description           text,
  meal_plan             text DEFAULT 'self_catering', -- self_catering, b&b, half_board, full_board, all_inclusive
  is_public             boolean DEFAULT true,
  is_refundable         boolean DEFAULT true,
  advance_purchase_days int DEFAULT 0,           -- 0 = not required
  min_nights            int DEFAULT 1,
  max_nights            int,
  cancellation_policy   jsonb,                   -- override property default
  deposit_policy        jsonb,                   -- override property default
  valid_from            date,
  valid_to              date,
  is_active             boolean DEFAULT true,
  channel_rate_codes    jsonb DEFAULT '{}',       -- {channel_id: external_code}
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ─── RATE CALENDAR ───────────────────────────────────────────────────────────
-- Authoritative per-night rate for each room_type + rate_plan combination

CREATE TABLE IF NOT EXISTS rate_calendar (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  room_type_id    uuid REFERENCES room_types(id) ON DELETE CASCADE NOT NULL,
  rate_plan_id    uuid REFERENCES rate_plans(id) ON DELETE CASCADE NOT NULL,
  stay_date       date NOT NULL,
  rate_amount     numeric NOT NULL CHECK (rate_amount >= 0),
  currency        text DEFAULT 'ZAR',
  min_nights      int DEFAULT 1,
  max_nights      int,
  stop_sell       boolean DEFAULT false,
  closed_to_arrival  boolean DEFAULT false,
  closed_to_departure boolean DEFAULT false,
  extra_adult_rate    numeric DEFAULT 0,
  extra_child_rate    numeric DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (room_type_id, rate_plan_id, stay_date)
);

CREATE INDEX IF NOT EXISTS idx_rate_calendar_lookup
  ON rate_calendar (property_id, room_type_id, rate_plan_id, stay_date);

-- ─── INVENTORY LEDGER ─────────────────────────────────────────────────────────
-- Authoritative source of truth for available inventory per room_type per night
-- Prevents double-booking via unique constraint on confirmed reservations

CREATE TABLE IF NOT EXISTS inventory_ledger (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  room_type_id    uuid REFERENCES room_types(id) ON DELETE CASCADE NOT NULL,
  unit_id         uuid REFERENCES units(id) ON DELETE SET NULL,
  stay_date       date NOT NULL,
  reservation_id  uuid,                          -- FK added after reservations table
  hold_id         uuid,
  status          text NOT NULL DEFAULT 'available',
  -- status: available | held | confirmed | blocked | out_of_order | maintenance
  idempotency_key text,
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT no_double_booking UNIQUE (unit_id, stay_date, status)
  -- partial: only one confirmed per unit per night enforced by application layer
  -- for room-type-level (not unit-level) bookings, use trigger below
);

CREATE INDEX IF NOT EXISTS idx_inventory_date
  ON inventory_ledger (property_id, room_type_id, stay_date, status);

-- ─── BOOKING HOLDS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS booking_holds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  room_type_id    uuid REFERENCES room_types(id) ON DELETE CASCADE NOT NULL,
  unit_id         uuid REFERENCES units(id) ON DELETE SET NULL,
  session_id      text,
  check_in_date   date NOT NULL,
  check_out_date  date NOT NULL,
  rate_plan_id    uuid REFERENCES rate_plans(id),
  quoted_rate     numeric,
  currency        text DEFAULT 'ZAR',
  adults          int DEFAULT 1,
  children        int DEFAULT 0,
  expires_at      timestamptz NOT NULL DEFAULT now() + interval '30 minutes',
  converted_to_reservation_id uuid,
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT valid_hold_dates CHECK (check_out_date > check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_holds_expiry ON booking_holds (expires_at);

-- ─── RESERVATIONS ────────────────────────────────────────────────────────────
-- Enhanced from existing `bookings` table. New table for full PMS lifecycle.
-- Existing bookings table is retained for backward compat; new code uses reservations.

CREATE TABLE IF NOT EXISTS reservations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  room_type_id          uuid REFERENCES room_types(id),
  unit_id               uuid REFERENCES units(id),
  rate_plan_id          uuid REFERENCES rate_plans(id),
  guest_id              uuid REFERENCES guests(id),
  hold_id               uuid REFERENCES booking_holds(id),

  -- Reference numbers
  confirmation_number   text UNIQUE DEFAULT 'PULSE-' || substr(gen_random_uuid()::text,1,8),
  external_booking_id   text,
  channel_id            uuid,                    -- FK to channels added below

  -- Dates
  check_in_date         date NOT NULL,
  check_out_date        date NOT NULL,
  booked_at             timestamptz DEFAULT now(),
  confirmed_at          timestamptz,
  cancelled_at          timestamptz,
  cancellation_reason   text,
  no_show_at            timestamptz,

  -- Guests
  adults                int DEFAULT 1,
  children              int DEFAULT 0,
  infants               int DEFAULT 0,
  pets                  int DEFAULT 0,
  special_requests      text,
  accessibility_needs   text,

  -- Status & source
  status                reservation_status DEFAULT 'confirmed',
  source                text NOT NULL DEFAULT 'direct', -- direct, ota, agent, walk_in, phone, corporate
  booking_agent_id      uuid,

  -- Financials — snapshot at booking time
  rate_snapshot         jsonb NOT NULL DEFAULT '{}', -- full rate breakdown
  subtotal              numeric NOT NULL DEFAULT 0,
  tax_amount            numeric DEFAULT 0,
  cleaning_fee          numeric DEFAULT 0,
  tourism_levy          numeric DEFAULT 0,
  channel_commission    numeric DEFAULT 0,
  total_amount          numeric NOT NULL DEFAULT 0,
  currency              text DEFAULT 'ZAR',
  outstanding_balance   numeric DEFAULT 0,
  deposit_due           numeric DEFAULT 0,
  deposit_due_date      date,

  -- Communication
  guest_email_sent_at   timestamptz,
  pre_arrival_sent_at   timestamptz,
  post_stay_sent_at     timestamptz,

  -- Check-in/out
  actual_check_in       timestamptz,
  actual_check_out      timestamptz,
  online_check_in_at    timestamptz,

  -- Internal
  notes                 text,
  tags                  text[] DEFAULT '{}',
  idempotency_key       text UNIQUE,

  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),

  CONSTRAINT valid_reservation_dates CHECK (check_out_date > check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_reservations_property_dates
  ON reservations (property_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations (property_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_guest
  ON reservations (guest_id);

-- Back-fill FK on inventory_ledger
ALTER TABLE inventory_ledger
  ADD COLUMN IF NOT EXISTS reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL;

-- ─── RESERVATION ROOMS ───────────────────────────────────────────────────────
-- For group/multi-room bookings

CREATE TABLE IF NOT EXISTS reservation_rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  uuid REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  room_type_id    uuid REFERENCES room_types(id),
  unit_id         uuid REFERENCES units(id),
  rate_plan_id    uuid REFERENCES rate_plans(id),
  check_in_date   date NOT NULL,
  check_out_date  date NOT NULL,
  adults          int DEFAULT 1,
  children        int DEFAULT 0,
  room_rate       numeric DEFAULT 0,
  guest_id        uuid REFERENCES guests(id),  -- individual guest per room
  created_at      timestamptz DEFAULT now()
);

-- ─── FOLIOS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS folios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reservation_id  uuid REFERENCES reservations(id) ON DELETE CASCADE,
  guest_id        uuid REFERENCES guests(id),
  folio_number    text UNIQUE,
  status          folio_status DEFAULT 'open',
  currency        text DEFAULT 'ZAR',
  subtotal        numeric DEFAULT 0,
  tax_total       numeric DEFAULT 0,
  total           numeric DEFAULT 0,
  amount_paid     numeric DEFAULT 0,
  balance         numeric DEFAULT 0,
  closed_at       timestamptz,
  invoiced_at     timestamptz,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ─── FOLIO ITEMS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS folio_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio_id        uuid REFERENCES folios(id) ON DELETE CASCADE NOT NULL,
  item_date       date DEFAULT current_date,
  description     text NOT NULL,
  quantity        numeric DEFAULT 1,
  unit_price      numeric NOT NULL,
  tax_rate        numeric DEFAULT 0,
  tax_amount      numeric DEFAULT 0,
  total           numeric NOT NULL,
  category        text DEFAULT 'accommodation', -- accommodation, extra, service, discount, credit
  vatable         boolean DEFAULT true,
  posted_by       uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now()
);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  folio_id              uuid REFERENCES folios(id),
  reservation_id        uuid REFERENCES reservations(id),
  guest_id              uuid REFERENCES guests(id),
  amount                numeric NOT NULL,
  currency              text DEFAULT 'ZAR',
  method                payment_method DEFAULT 'eft',
  status                payment_status DEFAULT 'pending',
  reference             text,
  gateway_provider      text,
  gateway_payment_id    text UNIQUE,
  gateway_response      jsonb DEFAULT '{}',
  idempotency_key       text UNIQUE,
  refunded_amount       numeric DEFAULT 0,
  refund_reason         text,
  payment_link_id       uuid,
  captured_at           timestamptz,
  settled_at            timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_reservation
  ON payments (reservation_id);

-- ─── PAYMENT LINKS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_links (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reservation_id    uuid REFERENCES reservations(id),
  guest_id          uuid REFERENCES guests(id),
  amount            numeric NOT NULL,
  currency          text DEFAULT 'ZAR',
  description       text,
  gateway_provider  text,
  gateway_link_id   text,
  link_url          text,
  status            text DEFAULT 'pending',
  expires_at        timestamptz,
  paid_at           timestamptz,
  payment_id        uuid REFERENCES payments(id),
  created_at        timestamptz DEFAULT now()
);

-- ─── INVOICES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  folio_id          uuid REFERENCES folios(id),
  reservation_id    uuid REFERENCES reservations(id),
  guest_id          uuid REFERENCES guests(id),
  invoice_number    text UNIQUE NOT NULL,
  invoice_date      date DEFAULT current_date,
  due_date          date,
  subtotal          numeric NOT NULL DEFAULT 0,
  tax_amount        numeric DEFAULT 0,
  total             numeric NOT NULL DEFAULT 0,
  amount_paid       numeric DEFAULT 0,
  status            text DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  line_items        jsonb NOT NULL DEFAULT '[]',
  billing_address   jsonb DEFAULT '{}',
  notes             text,
  pdf_url           text,
  sent_at           timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ─── CHANNELS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS channels (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  text UNIQUE NOT NULL,   -- booking_com, airbnb, expedia, lekke_slaap, direct, ical, etc.
  name                  text NOT NULL,
  logo_url              text,
  capability            connector_capability DEFAULT 'not_built',
  commission_default    numeric DEFAULT 0,
  external_api_docs     text,
  certification_notes   text,
  is_active             boolean DEFAULT true,
  created_at            timestamptz DEFAULT now()
);

-- Seed standard channels (idempotent)
INSERT INTO channels (code, name, capability, commission_default) VALUES
  ('direct',       'Direct Booking',    'live_certified', 0),
  ('phone',        'Phone Booking',     'live_certified', 0),
  ('walk_in',      'Walk-in',           'live_certified', 0),
  ('ical',         'iCal Import',       'live_certified', 0),
  ('booking_com',  'Booking.com',       'blocked_external_certification', 0.15),
  ('airbnb',       'Airbnb',            'blocked_external_certification', 0.03),
  ('expedia',      'Expedia',           'blocked_external_certification', 0.15),
  ('lekke_slaap',  'LekkeSlaap',        'adapter_ready', 0.10),
  ('agoda',        'Agoda',             'blocked_external_certification', 0.15),
  ('google_hotels','Google Hotels',     'blocked_external_certification', 0),
  ('agent',        'Travel Agent',      'adapter_ready', 0.10),
  ('corporate',    'Corporate Account', 'adapter_ready', 0)
ON CONFLICT (code) DO NOTHING;

-- Add channel FK to reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS channel_code text REFERENCES channels(code);

-- ─── CHANNEL CONNECTIONS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS channel_connections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  channel_id        uuid REFERENCES channels(id) NOT NULL,
  status            channel_status DEFAULT 'disconnected',
  property_external_id text,               -- how the channel identifies this property
  encrypted_creds_ref text,               -- Vault reference, never the value
  commission_override numeric,
  sync_availability boolean DEFAULT true,
  sync_rates        boolean DEFAULT true,
  sync_reservations boolean DEFAULT true,
  last_availability_sync timestamptz,
  last_rate_sync    timestamptz,
  last_reservation_sync timestamptz,
  last_error        text,
  is_active         boolean DEFAULT false,
  sandbox_mode      boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE (property_id, channel_id)
);

-- ─── CHANNEL ROOM MAPPING ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS channel_room_mapping (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_connection_id uuid REFERENCES channel_connections(id) ON DELETE CASCADE NOT NULL,
  room_type_id        uuid REFERENCES room_types(id) ON DELETE CASCADE NOT NULL,
  external_room_id    text NOT NULL,
  external_room_name  text,
  rate_plan_id        uuid REFERENCES rate_plans(id),
  external_rate_id    text,
  markup_percentage   numeric DEFAULT 0,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  UNIQUE (channel_connection_id, external_room_id)
);

-- ─── GUEST PROFILES ENHANCEMENT ──────────────────────────────────────────────

ALTER TABLE guests ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_type text;               -- passport, id_book, drivers
ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_number text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS address jsonb DEFAULT '{}';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS total_stays int DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS total_spend numeric DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS last_stay_at date;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS dietary_requirements text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS vip_status text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS popia_consent boolean DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS popia_consent_at timestamptz;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS data_retention_until date;

-- ─── GUEST COMMUNICATIONS ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guest_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reservation_id    uuid REFERENCES reservations(id) ON DELETE SET NULL,
  guest_id          uuid REFERENCES guests(id) ON DELETE SET NULL,
  direction         text NOT NULL DEFAULT 'outbound', -- inbound | outbound
  channel           text NOT NULL DEFAULT 'email',    -- email | sms | whatsapp | in_app
  subject           text,
  body              text NOT NULL,
  template_id       text,
  status            text DEFAULT 'queued',            -- queued | sent | delivered | read | failed
  external_message_id text,
  sent_at           timestamptz,
  delivered_at      timestamptz,
  read_at           timestamptz,
  requires_response boolean DEFAULT false,
  responded_at      timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- ─── RESERVATION AUDIT ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reservation_audit (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  uuid REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  actor_id        uuid REFERENCES auth.users(id),
  action          text NOT NULL,           -- created | modified | cancelled | check_in | check_out | payment_added | etc
  field_changes   jsonb DEFAULT '{}',      -- {field: {before, after}}
  reason          text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservation_audit ON reservation_audit (reservation_id, created_at);

-- ─── PROMO CODES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promo_codes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  code              text NOT NULL,
  description       text,
  discount_type     text DEFAULT 'percentage',   -- percentage | fixed_amount | free_night
  discount_value    numeric NOT NULL,
  min_nights        int DEFAULT 1,
  min_amount        numeric DEFAULT 0,
  valid_from        date,
  valid_to          date,
  max_uses          int,
  uses_count        int DEFAULT 0,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  UNIQUE (property_id, code)
);

-- ─── AGENTS AND CORPORATE ACCOUNTS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS booking_agents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  agent_name        text NOT NULL,
  company_name      text,
  email             text NOT NULL,
  phone             text,
  agent_type        text DEFAULT 'travel_agent',  -- travel_agent | tour_operator | corporate | ota
  commission_rate   numeric DEFAULT 0,
  account_code      text,
  credit_limit      numeric DEFAULT 0,
  payment_terms_days int DEFAULT 30,
  contract_ref      text,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS corporate_accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  company_name      text NOT NULL,
  contact_name      text,
  email             text,
  phone             text,
  vat_number        text,
  billing_address   jsonb DEFAULT '{}',
  contracted_rate_plan_id uuid REFERENCES rate_plans(id),
  credit_limit      numeric DEFAULT 0,
  payment_terms_days int DEFAULT 30,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- ─── HOUSEKEEPING ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  unit_id         uuid REFERENCES units(id) ON DELETE CASCADE,
  reservation_id  uuid REFERENCES reservations(id) ON DELETE SET NULL,
  task_type       text NOT NULL DEFAULT 'full_clean',
  -- full_clean | stayover | departure | inspection | deep_clean | turn_down
  priority        text DEFAULT 'normal',
  status          text DEFAULT 'pending',
  -- pending | in_progress | completed | inspected | skipped
  assigned_to     uuid REFERENCES auth.users(id),
  inspected_by    uuid REFERENCES auth.users(id),
  notes           text,
  checklist       jsonb DEFAULT '[]',        -- [{item, completed, notes}]
  evidence_photos jsonb DEFAULT '[]',
  scheduled_for   timestamptz,
  started_at      timestamptz,
  completed_at    timestamptz,
  inspected_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_housekeeping_date
  ON housekeeping_tasks (property_id, scheduled_for, status);

-- Room status log
CREATE TABLE IF NOT EXISTS room_status_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id         uuid REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  from_status     room_status,
  to_status       room_status NOT NULL,
  changed_by      uuid REFERENCES auth.users(id),
  reason          text,
  reservation_id  uuid REFERENCES reservations(id),
  created_at      timestamptz DEFAULT now()
);

-- ─── ONLINE CHECK-IN ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS online_checkins (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id    uuid REFERENCES reservations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  guest_id          uuid REFERENCES guests(id),
  token             text UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  token_expires_at  timestamptz DEFAULT now() + interval '7 days',
  submitted_at      timestamptz,
  verified_at       timestamptz,
  id_document_url   text,
  id_verified       boolean DEFAULT false,
  signature_url     text,
  terms_accepted    boolean DEFAULT false,
  terms_accepted_at timestamptz,
  estimated_arrival text,
  special_requests  text,
  created_at        timestamptz DEFAULT now()
);

-- ─── PROPERTY WEBSITE / DIRECT BOOKING ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS booking_engine_config (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_live               boolean DEFAULT false,
  slug                  text UNIQUE,            -- e.g. farmstead-meadows
  headline              text,
  tagline               text,
  hero_image_url        text,
  brand_color           text DEFAULT '#B08D57',
  accept_payments       boolean DEFAULT false,
  payment_gateway       text,                   -- peach | paystack | stripe | manual
  show_rate_from        boolean DEFAULT true,
  require_deposit       boolean DEFAULT true,
  widget_embed_code     text,                   -- generated embed snippet
  meta_title            text,
  meta_description      text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────

ALTER TABLE property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE folios ENABLE ROW LEVEL SECURITY;
ALTER TABLE folio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_room_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_engine_config ENABLE ROW LEVEL SECURITY;

-- Property-scoped tables (inline subqueries — no function dependency for list queries)
CREATE POLICY property_settings_all ON property_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = property_settings.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = property_settings.property_id AND om.user_id = auth.uid()));

CREATE POLICY room_types_all ON room_types FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = room_types.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = room_types.property_id AND om.user_id = auth.uid()));

CREATE POLICY rate_plans_all ON rate_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = rate_plans.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = rate_plans.property_id AND om.user_id = auth.uid()));

CREATE POLICY rate_calendar_all ON rate_calendar FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = rate_calendar.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = rate_calendar.property_id AND om.user_id = auth.uid()));

CREATE POLICY inventory_ledger_all ON inventory_ledger FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = inventory_ledger.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = inventory_ledger.property_id AND om.user_id = auth.uid()));

CREATE POLICY reservations_all ON reservations FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = reservations.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = reservations.property_id AND om.user_id = auth.uid()));

CREATE POLICY folios_all ON folios FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = folios.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = folios.property_id AND om.user_id = auth.uid()));

CREATE POLICY folio_items_all ON folio_items FOR ALL
  USING (EXISTS (SELECT 1 FROM folios f JOIN properties p ON p.id = f.property_id JOIN organization_members om ON om.organization_id = p.organization_id WHERE f.id = folio_items.folio_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM folios f JOIN properties p ON p.id = f.property_id JOIN organization_members om ON om.organization_id = p.organization_id WHERE f.id = folio_items.folio_id AND om.user_id = auth.uid()));

CREATE POLICY payments_all ON payments FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = payments.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = payments.property_id AND om.user_id = auth.uid()));

CREATE POLICY payment_links_all ON payment_links FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = payment_links.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = payment_links.property_id AND om.user_id = auth.uid()));

CREATE POLICY invoices_all ON invoices FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = invoices.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = invoices.property_id AND om.user_id = auth.uid()));

CREATE POLICY channels_select ON channels FOR SELECT USING (true); -- public read

CREATE POLICY channel_connections_all ON channel_connections FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = channel_connections.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = channel_connections.property_id AND om.user_id = auth.uid()));

CREATE POLICY guest_messages_all ON guest_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = guest_messages.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = guest_messages.property_id AND om.user_id = auth.uid()));

CREATE POLICY reservation_audit_select ON reservation_audit FOR SELECT
  USING (EXISTS (SELECT 1 FROM reservations r JOIN properties p ON p.id = r.property_id JOIN organization_members om ON om.organization_id = p.organization_id WHERE r.id = reservation_audit.reservation_id AND om.user_id = auth.uid()));

CREATE POLICY housekeeping_all ON housekeeping_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = housekeeping_tasks.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = housekeeping_tasks.property_id AND om.user_id = auth.uid()));

CREATE POLICY booking_engine_all ON booking_engine_config FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = booking_engine_config.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = booking_engine_config.property_id AND om.user_id = auth.uid()));

CREATE POLICY booking_agents_all ON booking_agents FOR ALL
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = booking_agents.organization_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = booking_agents.organization_id AND user_id = auth.uid()));

CREATE POLICY corporate_accounts_all ON corporate_accounts FOR ALL
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = corporate_accounts.organization_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = corporate_accounts.organization_id AND user_id = auth.uid()));

CREATE POLICY promo_codes_all ON promo_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = promo_codes.property_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p JOIN organization_members om ON om.organization_id = p.organization_id WHERE p.id = promo_codes.property_id AND om.user_id = auth.uid()));

-- Online check-in: token-based access for guests (no auth required for token lookup)
CREATE POLICY online_checkins_token ON online_checkins FOR SELECT
  USING (true); -- filtered by token in application layer
CREATE POLICY online_checkins_staff ON online_checkins FOR ALL
  USING (EXISTS (SELECT 1 FROM reservations r JOIN properties p ON p.id = r.property_id JOIN organization_members om ON om.organization_id = p.organization_id WHERE r.id = online_checkins.reservation_id AND om.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM reservations r JOIN properties p ON p.id = r.property_id JOIN organization_members om ON om.organization_id = p.organization_id WHERE r.id = online_checkins.reservation_id AND om.user_id = auth.uid()));

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- Auto-update folios balance when items change
CREATE OR REPLACE FUNCTION update_folio_totals() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE folios SET
    subtotal = (SELECT COALESCE(SUM(total), 0) FROM folio_items WHERE folio_id = COALESCE(NEW.folio_id, OLD.folio_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.folio_id, OLD.folio_id);

  UPDATE folios SET
    tax_total = (SELECT COALESCE(SUM(tax_amount), 0) FROM folio_items WHERE folio_id = id),
    total = subtotal + COALESCE((SELECT SUM(tax_amount) FROM folio_items WHERE folio_id = id), 0),
    balance = total - amount_paid
  WHERE id = COALESCE(NEW.folio_id, OLD.folio_id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS folio_items_totals ON folio_items;
CREATE TRIGGER folio_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON folio_items
  FOR EACH ROW EXECUTE FUNCTION update_folio_totals();

-- Auto-update reservation outstanding_balance
CREATE OR REPLACE FUNCTION update_reservation_balance() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE reservations SET
    outstanding_balance = total_amount - COALESCE((
      SELECT SUM(amount) FROM payments
      WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
        AND status IN ('captured', 'settled')
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.reservation_id, OLD.reservation_id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS payments_balance ON payments;
CREATE TRIGGER payments_balance
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_reservation_balance();

-- ─── SEED: Farmstead Hospitality room types and rate plans ───────────────────

DO $$
DECLARE
  org_id uuid := 'a1b2c3d4-0001-0001-0001-000000000001';
  prop1  uuid;
  rt_id  uuid;
  rp_id  uuid;
BEGIN
  -- Get first property
  SELECT id INTO prop1 FROM properties WHERE organization_id = org_id LIMIT 1;
  IF prop1 IS NULL THEN RETURN; END IF;

  -- Property settings
  INSERT INTO property_settings (property_id) VALUES (prop1)
  ON CONFLICT (property_id) DO NOTHING;

  -- Room type (generic self-catering cottage)
  INSERT INTO room_types (property_id, name, code, description, max_adults, max_children, max_occupancy, bed_configuration)
  VALUES (prop1, 'Self-Catering Cottage', 'SCC', 'Fully equipped self-catering accommodation', 4, 2, 6, '2 bedrooms, 1 king + 2 singles')
  ON CONFLICT DO NOTHING
  RETURNING id INTO rt_id;

  IF rt_id IS NULL THEN
    SELECT id INTO rt_id FROM room_types WHERE property_id = prop1 LIMIT 1;
  END IF;

  -- Rate plan
  INSERT INTO rate_plans (property_id, name, code, rate_type, meal_plan, min_nights)
  VALUES (prop1, 'Standard Rate', 'STD', 'standard', 'self_catering', 2)
  ON CONFLICT DO NOTHING
  RETURNING id INTO rp_id;

  IF rp_id IS NULL THEN
    SELECT id INTO rp_id FROM rate_plans WHERE property_id = prop1 LIMIT 1;
  END IF;

  -- Book engine config
  INSERT INTO booking_engine_config (property_id, headline, slug)
  VALUES (prop1, 'Welcome to Farmstead Hospitality', 'farmstead')
  ON CONFLICT (property_id) DO NOTHING;

END $$;
