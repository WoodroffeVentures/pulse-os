-- 0003_farmstead_mvp.sql
-- Production MVP extension for Farmstead Hospitality operations.

create table if not exists ical_feeds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  provider text not null check (provider in ('airbnb','booking_com','lekkeslaap','direct','other')),
  feed_url text not null,
  enabled boolean not null default true,
  sync_status text not null default 'pending' check (sync_status in ('pending','syncing','success','error','disabled')),
  last_synced_at timestamptz,
  last_error text,
  last_event_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, provider, feed_url)
);

create table if not exists work_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'maintenance',
  status text not null default 'open' check (status in ('open','scoped','scheduled','in_progress','blocked','completed','cancelled')),
  priority risk_level not null default 'medium',
  supplier_name text,
  estimated_cost numeric,
  actual_cost numeric,
  currency text not null default 'ZAR',
  evidence_files jsonb not null default '[]',
  lessons_learned text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists brain_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  category text not null check (category in ('wifi','sop','house_manual','guest_guide','maintenance','policy','lesson','local_recommendation','faq')),
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  guest_visible boolean not null default false,
  source text not null default 'manual',
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'') || ' ' || array_to_string(tags, ' '))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists property_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  asset_type text not null check (asset_type in ('photo','document','manual','floorplan','compliance','brand','other')),
  title text not null,
  storage_path text,
  external_url text,
  metadata jsonb not null default '{}',
  guest_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists guest_communications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,
  channel text not null check (channel in ('whatsapp','email','sms','phone','platform')),
  direction text not null check (direction in ('inbound','outbound','draft')),
  subject text,
  body text not null,
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','sent','delivered','failed','archived')),
  ai_generated boolean not null default false,
  approved_by uuid references auth.users(id),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists guest_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  note_type text not null default 'general' check (note_type in ('preference','issue','repeat_guest','accessibility','general')),
  note text not null,
  visibility text not null default 'internal' check (visibility in ('internal','manager_only')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists review_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,
  platform text not null default 'google',
  request_url text,
  status text not null default 'draft' check (status in ('draft','pending_approval','sent','completed','cancelled')),
  message_draft text,
  ai_generated boolean not null default false,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists property_guides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  title text not null,
  slug text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sections jsonb not null default '[]',
  public_share_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, slug)
);

create table if not exists operational_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  asset_class text not null check (asset_class in ('house_manual','sop','wifi','checklist','vendor','policy','other')),
  title text not null,
  body text,
  storage_path text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists offline_import_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  source_name text not null default 'offline_html_bridge',
  imported_by uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending','validated','imported','failed')),
  summary jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists offline_import_records (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references offline_import_batches(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  record_type text not null,
  external_key text,
  payload jsonb not null default '{}',
  import_status text not null default 'pending' check (import_status in ('pending','imported','skipped','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

alter table ical_feeds enable row level security;
alter table work_items enable row level security;
alter table brain_entries enable row level security;
alter table property_assets enable row level security;
alter table guest_communications enable row level security;
alter table guest_notes enable row level security;
alter table review_requests enable row level security;
alter table property_guides enable row level security;
alter table operational_assets enable row level security;
alter table offline_import_batches enable row level security;
alter table offline_import_records enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'ical_feeds' and policyname = 'ical_feeds_org_access') then
    create policy ical_feeds_org_access on ical_feeds for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'work_items' and policyname = 'work_items_org_access') then
    create policy work_items_org_access on work_items for all using (is_org_member(organization_id) and can_access_property(property_id)) with check (is_org_member(organization_id) and can_access_property(property_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'brain_entries' and policyname = 'brain_entries_org_access') then
    create policy brain_entries_org_access on brain_entries for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'property_assets' and policyname = 'property_assets_org_access') then
    create policy property_assets_org_access on property_assets for all using (is_org_member(organization_id) and can_access_property(property_id)) with check (is_org_member(organization_id) and can_access_property(property_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'guest_communications' and policyname = 'guest_communications_org_access') then
    create policy guest_communications_org_access on guest_communications for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'guest_notes' and policyname = 'guest_notes_org_access') then
    create policy guest_notes_org_access on guest_notes for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'review_requests' and policyname = 'review_requests_org_access') then
    create policy review_requests_org_access on review_requests for all using (is_org_member(organization_id) and can_access_property(property_id)) with check (is_org_member(organization_id) and can_access_property(property_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'property_guides' and policyname = 'property_guides_org_access') then
    create policy property_guides_org_access on property_guides for all using (is_org_member(organization_id) and can_access_property(property_id)) with check (is_org_member(organization_id) and can_access_property(property_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'operational_assets' and policyname = 'operational_assets_org_access') then
    create policy operational_assets_org_access on operational_assets for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'offline_import_batches' and policyname = 'offline_import_batches_org_access') then
    create policy offline_import_batches_org_access on offline_import_batches for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'offline_import_records' and policyname = 'offline_import_records_org_access') then
    create policy offline_import_records_org_access on offline_import_records for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
  end if;
end $$;

create index if not exists idx_ical_feeds_property on ical_feeds(property_id, provider, enabled);
create index if not exists idx_work_items_property_status on work_items(property_id, status, priority);
create index if not exists idx_brain_entries_search on brain_entries using gin(search_vector);
create index if not exists idx_guest_communications_guest on guest_communications(guest_id, created_at desc);
create index if not exists idx_guest_notes_guest on guest_notes(guest_id, created_at desc);
create index if not exists idx_property_guides_slug on property_guides(property_id, slug);
