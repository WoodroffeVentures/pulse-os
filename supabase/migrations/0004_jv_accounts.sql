-- JV (Joint Venture) accounts: opened when a venue accepts an opportunity pitch.
-- Revenue is tracked against this account and split per the agreed terms.

create table if not exists jv_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  participation_id uuid not null references participation_records(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','suspended','closed')),
  revenue_venue_share numeric not null default 60,
  revenue_proposer_share numeric not null default 40,
  total_revenue_zar numeric not null default 0,
  venue_revenue_zar numeric not null default 0,
  proposer_revenue_zar numeric not null default 0,
  milestones jsonb not null default '[]',
  outcome_evidence jsonb not null default '{}',
  opened_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(opportunity_id, participation_id)
);

create table if not exists jv_revenue_events (
  id uuid primary key default gen_random_uuid(),
  jv_account_id uuid not null references jv_accounts(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  amount_zar numeric not null check (amount_zar > 0),
  venue_portion_zar numeric not null,
  proposer_portion_zar numeric not null,
  description text,
  evidence_files jsonb not null default '[]',
  recorded_by uuid references auth.users(id),
  event_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table jv_accounts enable row level security;
alter table jv_revenue_events enable row level security;

create policy jv_accounts_all on jv_accounts for all
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy jv_revenue_all on jv_revenue_events for all
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

-- Trigger: update jv_accounts totals when a revenue event is inserted
create or replace function update_jv_account_totals()
returns trigger language plpgsql security definer as $$
begin
  update jv_accounts
  set
    total_revenue_zar = total_revenue_zar + new.amount_zar,
    venue_revenue_zar = venue_revenue_zar + new.venue_portion_zar,
    proposer_revenue_zar = proposer_revenue_zar + new.proposer_portion_zar,
    updated_at = now()
  where id = new.jv_account_id;
  return new;
end;
$$;

create trigger trg_jv_revenue_totals
  after insert on jv_revenue_events
  for each row execute function update_jv_account_totals();

create index idx_jv_accounts_org on jv_accounts(organization_id, status);
create index idx_jv_revenue_account on jv_revenue_events(jv_account_id, event_date desc);

-- Also add a consent_records table (POPIA-aligned, referenced in docs)
create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  subject_email text,
  purpose text not null,
  consent_given boolean not null,
  consent_method text not null default 'web_form',
  ip_address text,
  user_agent text,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now()
);

alter table consent_records enable row level security;
create policy consent_org on consent_records for all
  using (organization_id is null or is_org_member(organization_id))
  with check (organization_id is null or is_org_member(organization_id));

create index idx_consent_user on consent_records(user_id, purpose);
