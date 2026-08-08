-- 0005_reconcile.sql
-- Safe reconcile pass: adds any objects from 0001 that may have been missed
-- due to partial apply. All statements use IF NOT EXISTS.

create extension if not exists pgcrypto;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('super_admin','platform_admin','org_owner','group_manager','property_manager','front_desk','housekeeping_supervisor','housekeeper','maintenance_manager','maintenance_vendor','finance_user','marketing_user','concierge_user','executive_readonly','destination_analyst');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('open','in_progress','blocked','completed','cancelled','overdue');
  end if;
  if not exists (select 1 from pg_type where typname = 'risk_level') then
    create type risk_level as enum ('low','medium','high','critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type approval_status as enum ('draft','pending_approval','approved','rejected','executed','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('pending','confirmed','checked_in','checked_out','cancelled','no_show');
  end if;
end $$;

create table if not exists organizations (id uuid primary key default gen_random_uuid(), name text not null, legal_name text, country text default 'South Africa', default_currency text default 'ZAR', subscription_plan text default 'starter', billing_status text default 'trial', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists organization_members (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, user_id uuid references auth.users(id) on delete cascade not null, role user_role not null default 'org_owner', permissions text[] default '{}', created_at timestamptz default now(), unique(organization_id,user_id));
create table if not exists properties (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, name text not null, property_type text not null, address text, city text, province text, country text default 'South Africa', latitude numeric, longitude numeric, google_place_id text, timezone text default 'Africa/Johannesburg', room_count int default 0, website_url text, phone text, email text, description text, amenities jsonb default '[]', brand_assets jsonb default '{}', status text default 'active', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists property_users (id uuid primary key default gen_random_uuid(), property_id uuid references properties(id) on delete cascade not null, user_id uuid references auth.users(id) on delete cascade not null, role user_role not null, created_at timestamptz default now(), unique(property_id,user_id));
create table if not exists units (id uuid primary key default gen_random_uuid(), property_id uuid references properties(id) on delete cascade not null, unit_name text not null, unit_type text, max_occupancy int default 2, base_rate numeric default 0, amenities jsonb default '[]', status text default 'active', created_at timestamptz default now());
create table if not exists guests (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, first_name text, last_name text, email text, phone text, country text, language_preference text default 'en', marketing_consent boolean default false, whatsapp_consent boolean default false, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists bookings (id uuid primary key default gen_random_uuid(), property_id uuid references properties(id) on delete cascade not null, guest_id uuid references guests(id), source text not null default 'manual', external_booking_id text, check_in_date date not null, check_out_date date not null, booking_date date default current_date, unit_id uuid references units(id), status booking_status default 'confirmed', total_amount numeric default 0, currency text default 'ZAR', adults int default 1, children int default 0, special_requests text, payment_status text default 'unknown', channel_commission numeric default 0, created_at timestamptz default now(), updated_at timestamptz default now(), constraint valid_booking_dates check (check_out_date > check_in_date));
create table if not exists event_log (id uuid primary key default gen_random_uuid(), event_type text not null, organization_id uuid references organizations(id) on delete cascade, property_id uuid references properties(id) on delete cascade, actor_type text default 'system', actor_id uuid, source_system text default 'pulse', payload jsonb default '{}', correlation_id uuid default gen_random_uuid(), idempotency_key text, created_at timestamptz default now());
create table if not exists tasks (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, property_id uuid references properties(id) on delete cascade not null, title text not null, description text, category text not null default 'operations', priority risk_level default 'medium', status task_status default 'open', assigned_to uuid references auth.users(id), source_event_id uuid references event_log(id), ai_generated boolean default false, requires_approval boolean default false, approved_by uuid references auth.users(id), due_at timestamptz, completed_at timestamptz, evidence_required boolean default false, evidence_files jsonb default '[]', recurrence_rule text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists workflows (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, property_id uuid references properties(id) on delete cascade, name text not null, trigger_event_type text not null, conditions jsonb default '{}', actions jsonb not null default '[]', enabled boolean default true, version int default 1, created_by uuid references auth.users(id), created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists notifications (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, property_id uuid references properties(id) on delete cascade, user_id uuid references auth.users(id), channel text not null default 'app', title text not null, message text, priority risk_level default 'medium', status text default 'queued', related_entity_type text, related_entity_id uuid, sent_at timestamptz, read_at timestamptz, created_at timestamptz default now());
create table if not exists reviews (id uuid primary key default gen_random_uuid(), property_id uuid references properties(id) on delete cascade not null, source text not null, external_review_id text, guest_name text, rating numeric, review_text text, sentiment_score numeric, topics text[] default '{}', ai_summary text, response_status approval_status default 'draft', recommended_response text, published_response text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists social_campaigns (id uuid primary key default gen_random_uuid(), property_id uuid references properties(id) on delete cascade not null, campaign_name text not null, campaign_type text, objective text, platforms text[] default '{}', content_plan jsonb default '{}', assets jsonb default '[]', status approval_status default 'draft', scheduled_start date, scheduled_end date, ai_generated boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists local_attractions (id uuid primary key default gen_random_uuid(), property_id uuid references properties(id) on delete cascade not null, name text not null, category text, description text, latitude numeric, longitude numeric, distance_km numeric, google_place_id text, rating numeric, price_level int, opening_hours jsonb default '{}', website text, phone text, affiliate_partner_id uuid, ai_relevance_score numeric, weather_suitability text, family_friendly boolean, created_at timestamptz default now());
create table if not exists opportunities (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade, title text not null, opportunity_type text not null, district text, province text default 'KwaZulu-Natal', description text, value_band text, start_date date, end_date date, eligibility jsonb default '{}', evidence_requirements jsonb default '[]', status text default 'active', created_at timestamptz default now());
create table if not exists business_profiles (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, property_id uuid references properties(id) on delete set null, business_name text not null, google_place_id text, website_url text, verification_status text default 'unverified', verified_signals jsonb default '{}', consistency_score numeric, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists viability_analyses (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, opportunity_id uuid references opportunities(id) on delete cascade not null, business_profile_id uuid references business_profiles(id) on delete cascade not null, score numeric not null, confidence numeric not null, recommendation text not null, evidence jsonb not null default '[]', risks jsonb default '[]', actions jsonb default '[]', ai_model text, status approval_status default 'draft', created_at timestamptz default now());
create table if not exists participation_records (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, opportunity_id uuid references opportunities(id) on delete cascade not null, business_profile_id uuid references business_profiles(id) on delete cascade not null, status text default 'identified', owner_user_id uuid references auth.users(id), evidence jsonb default '{}', created_at timestamptz default now(), updated_at timestamptz default now(), unique(opportunity_id,business_profile_id));
create table if not exists finance_records (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, property_id uuid references properties(id) on delete cascade, source_system text, external_id text, record_type text not null, amount numeric not null, currency text default 'ZAR', tax_amount numeric default 0, category text, booking_id uuid references bookings(id), status text default 'posted', transaction_date date default current_date, created_at timestamptz default now());
create table if not exists ai_recommendations (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, property_id uuid references properties(id) on delete cascade, recommendation_type text not null, title text not null, body text, confidence_score numeric, impact_estimate text, risk_level risk_level default 'medium', source_data jsonb default '{}', requires_approval boolean default true, status approval_status default 'draft', approved_by uuid references auth.users(id), executed_at timestamptz, created_at timestamptz default now());
create table if not exists ai_action_logs (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade, property_id uuid references properties(id) on delete cascade, user_id uuid references auth.users(id), model_provider text, model_name text, prompt_template_id text, input_summary text, output_summary text, action_type text, confidence_score numeric, risk_level risk_level default 'medium', approved boolean default false, approved_by uuid references auth.users(id), created_at timestamptz default now());
create table if not exists integration_accounts (id uuid primary key default gen_random_uuid(), organization_id uuid references organizations(id) on delete cascade not null, property_id uuid references properties(id) on delete cascade, provider text not null, status text default 'disconnected', auth_type text, encrypted_credentials_ref text, scopes text[] default '{}', last_sync_at timestamptz, last_error text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists integration_sync_logs (id uuid primary key default gen_random_uuid(), integration_account_id uuid references integration_accounts(id) on delete cascade not null, sync_type text, status text not null, started_at timestamptz default now(), completed_at timestamptz, records_processed int default 0, error_message text, retry_count int default 0);

-- pulse_is_org_member / pulse_can_access_property: PULSE-namespaced variants
-- avoids conflicts with existing is_org_member in this project
create or replace function pulse_pulse_is_org_member(org uuid) returns boolean language sql security definer stable as $$ select exists(select 1 from organization_members where organization_id=org and user_id=auth.uid()); $$;
create or replace function pulse_pulse_can_access_property(prop uuid) returns boolean language sql security definer stable as $$ select exists(select 1 from properties p join organization_members om on om.organization_id=p.organization_id where p.id=prop and om.user_id=auth.uid()) or exists(select 1 from property_users pu where pu.property_id=prop and pu.user_id=auth.uid()); $$;

-- Enable RLS (safe to repeat)
do $$ declare t text; begin for t in select tablename from pg_tables where schemaname='public' and tablename in ('organizations','organization_members','properties','property_users','units','guests','bookings','event_log','tasks','workflows','notifications','reviews','social_campaigns','local_attractions','opportunities','business_profiles','viability_analyses','participation_records','finance_records','ai_recommendations','ai_action_logs','integration_accounts','integration_sync_logs') loop execute format('alter table %I enable row level security', t); end loop; end $$;

-- RLS policies (drop and recreate safely)
do $$ begin
  drop policy if exists org_select on organizations;
  drop policy if exists org_update on organizations;
  drop policy if exists members_select on organization_members;
  drop policy if exists properties_select on properties;
  drop policy if exists properties_all on properties;
  drop policy if exists property_users_select on property_users;
  drop policy if exists units_all on units;
  drop policy if exists guests_all on guests;
  drop policy if exists bookings_all on bookings;
  drop policy if exists event_log_select on event_log;
  drop policy if exists tasks_all on tasks;
  drop policy if exists workflows_all on workflows;
  drop policy if exists notifications_select on notifications;
  drop policy if exists reviews_all on reviews;
  drop policy if exists campaigns_all on social_campaigns;
  drop policy if exists attractions_all on local_attractions;
  drop policy if exists opportunities_select on opportunities;
  drop policy if exists business_profiles_all on business_profiles;
  drop policy if exists viability_all on viability_analyses;
  drop policy if exists participation_all on participation_records;
  drop policy if exists finance_all on finance_records;
  drop policy if exists ai_recs_all on ai_recommendations;
  drop policy if exists ai_logs_select on ai_action_logs;
  drop policy if exists integrations_all on integration_accounts;
  drop policy if exists sync_logs_select on integration_sync_logs;
exception when others then null; end $$;

-- Inline RLS policies — no function dependency, avoids cross-function issues
-- org membership check: exists(select 1 from organization_members where organization_id=X and user_id=auth.uid())
-- property access check: org membership OR property_users membership

create policy org_select on organizations for select using (exists(select 1 from organization_members where organization_id=id and user_id=auth.uid()));
create policy org_update on organizations for update using (exists(select 1 from organization_members where organization_id=id and user_id=auth.uid()));
create policy members_select on organization_members for select using (exists(select 1 from organization_members m2 where m2.organization_id=organization_id and m2.user_id=auth.uid()));
create policy properties_select on properties for select using (exists(select 1 from organization_members where organization_id=properties.organization_id and user_id=auth.uid()));
create policy properties_all on properties for all using (exists(select 1 from organization_members where organization_id=properties.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=properties.organization_id and user_id=auth.uid()));
create policy property_users_select on property_users for select using (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=property_users.property_id and om.user_id=auth.uid()) or exists(select 1 from property_users pu2 where pu2.property_id=property_users.property_id and pu2.user_id=auth.uid()));
create policy units_all on units for all using (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=units.property_id and om.user_id=auth.uid())) with check (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=units.property_id and om.user_id=auth.uid()));
create policy guests_all on guests for all using (exists(select 1 from organization_members where organization_id=guests.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=guests.organization_id and user_id=auth.uid()));
create policy bookings_all on bookings for all using (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=bookings.property_id and om.user_id=auth.uid())) with check (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=bookings.property_id and om.user_id=auth.uid()));
create policy event_log_select on event_log for select using (event_log.organization_id is null or exists(select 1 from organization_members where organization_id=event_log.organization_id and user_id=auth.uid()));
create policy tasks_all on tasks for all using (exists(select 1 from organization_members where organization_id=tasks.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=tasks.organization_id and user_id=auth.uid()));
create policy workflows_all on workflows for all using (exists(select 1 from organization_members where organization_id=workflows.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=workflows.organization_id and user_id=auth.uid()));
-- notifications policy: only apply if organization_id column exists on our notifications table
do $$ begin
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='organization_id') then
    execute $p$create policy notifications_select on notifications for select using (user_id=auth.uid() or exists(select 1 from organization_members where organization_id=notifications.organization_id and user_id=auth.uid()))$p$;
  end if;
exception when duplicate_object then null; end $$;
create policy reviews_all on reviews for all using (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=reviews.property_id and om.user_id=auth.uid())) with check (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=reviews.property_id and om.user_id=auth.uid()));
create policy campaigns_all on social_campaigns for all using (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=social_campaigns.property_id and om.user_id=auth.uid())) with check (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=social_campaigns.property_id and om.user_id=auth.uid()));
create policy attractions_all on local_attractions for all using (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=local_attractions.property_id and om.user_id=auth.uid())) with check (exists(select 1 from organization_members om join properties p on om.organization_id=p.organization_id where p.id=local_attractions.property_id and om.user_id=auth.uid()));
create policy opportunities_select on opportunities for select using (opportunities.organization_id is null or exists(select 1 from organization_members where organization_id=opportunities.organization_id and user_id=auth.uid()));
create policy business_profiles_all on business_profiles for all using (exists(select 1 from organization_members where organization_id=business_profiles.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=business_profiles.organization_id and user_id=auth.uid()));
create policy viability_all on viability_analyses for all using (exists(select 1 from organization_members where organization_id=viability_analyses.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=viability_analyses.organization_id and user_id=auth.uid()));
create policy participation_all on participation_records for all using (exists(select 1 from organization_members where organization_id=participation_records.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=participation_records.organization_id and user_id=auth.uid()));
create policy finance_all on finance_records for all using (exists(select 1 from organization_members where organization_id=finance_records.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=finance_records.organization_id and user_id=auth.uid()));
create policy ai_recs_all on ai_recommendations for all using (exists(select 1 from organization_members where organization_id=ai_recommendations.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=ai_recommendations.organization_id and user_id=auth.uid()));
create policy ai_logs_select on ai_action_logs for select using (ai_action_logs.organization_id is null or exists(select 1 from organization_members where organization_id=ai_action_logs.organization_id and user_id=auth.uid()));
create policy integrations_all on integration_accounts for all using (exists(select 1 from organization_members where organization_id=integration_accounts.organization_id and user_id=auth.uid())) with check (exists(select 1 from organization_members where organization_id=integration_accounts.organization_id and user_id=auth.uid()));
create policy sync_logs_select on integration_sync_logs for select using (exists(select 1 from integration_accounts ia join organization_members om on om.organization_id=ia.organization_id where ia.id=integration_sync_logs.integration_account_id and om.user_id=auth.uid()));

-- Indexes
create index if not exists idx_bookings_property_dates on bookings(property_id, check_in_date, check_out_date);
create index if not exists idx_tasks_property_status on tasks(property_id, status, due_at);
create index if not exists idx_events_org_type on event_log(organization_id, event_type, created_at desc);
create index if not exists idx_viability_score on viability_analyses(opportunity_id, score desc);
