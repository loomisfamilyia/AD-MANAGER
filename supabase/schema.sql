-- ===========================================================================
-- Loomis Family Insurance Agency — Ads Manager
-- Paste this whole file into Supabase: SQL Editor -> New query -> Run.
-- Safe to re-run; every statement is guarded.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type ad_platform as enum ('google', 'meta', 'reddit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('active', 'paused', 'ended', 'draft');
exception when duplicate_object then null; end $$;

-- Pipeline stages, in order. 'lost' is terminal and sits outside the ladder.
do $$ begin
  create type lead_status as enum ('new', 'contacted', 'quoted', 'sold', 'lost');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Campaigns
--
-- One row per campaign per platform. Rows can be created two ways:
--   * by hand (external_id stays null) — the day-one path
--   * by a sync function (external_id = the platform's own campaign id)
-- so the rest of the app never needs to care which platform data came from.
-- ---------------------------------------------------------------------------
create table if not exists campaigns (
  id            uuid primary key default gen_random_uuid(),
  platform      ad_platform not null,
  external_id   text,
  name          text not null,
  status        campaign_status not null default 'active',
  objective     text,
  daily_budget  numeric(12,2),
  -- Which book of business this campaign is chasing. Lets you compare cost per
  -- lead for auto against cost per lead for life, which are wildly different.
  coverage_line text check (
    coverage_line in ('auto','home','life','business','mixed')
  ),
  -- The utm_campaign value this campaign tags its landing-page links with.
  -- This is the join key between "money spent" and "humans who called".
  utm_campaign  text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Postgres treats NULLs as distinct, so this constrains synced campaigns to be
-- unique per platform while still allowing many manual rows with a null id.
create unique index if not exists campaigns_platform_external_key
  on campaigns (platform, external_id)
  where external_id is not null;

create index if not exists campaigns_utm_campaign_idx
  on campaigns (lower(utm_campaign))
  where utm_campaign is not null;

-- ---------------------------------------------------------------------------
-- Daily metrics — the fact table
--
-- Grain is one row per campaign per day. The unique constraint is what makes
-- re-syncing safe: a sync writes with ON CONFLICT DO UPDATE, so pulling the
-- same week twice corrects the numbers instead of double-counting them.
-- Ad platforms restate recent days (fraud filtering, late conversions), so
-- re-pulling is normal, not exceptional.
-- ---------------------------------------------------------------------------
create table if not exists metrics_daily (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references campaigns(id) on delete cascade,
  date          date not null,
  impressions   bigint  not null default 0 check (impressions >= 0),
  clicks        bigint  not null default 0 check (clicks >= 0),
  spend         numeric(12,2) not null default 0 check (spend >= 0),
  -- What the platform *claims* converted. Kept separate from your own lead
  -- count on purpose — platforms count generously and each one counts
  -- differently, so these are never compared across platforms.
  platform_conversions numeric(12,2) not null default 0,
  source        text not null default 'manual'
                check (source in ('manual', 'csv', 'api')),
  synced_at     timestamptz not null default now(),
  unique (campaign_id, date)
);

create index if not exists metrics_daily_date_idx on metrics_daily (date);

-- ---------------------------------------------------------------------------
-- Leads — the conversion endpoint
--
-- Ad platforms can tell you what a click costs. Only this table can tell you
-- what a *customer* costs, which is the number that decides where the budget
-- goes next month.
-- ---------------------------------------------------------------------------
create table if not exists leads (
  id             uuid primary key default gen_random_uuid(),
  full_name      text,
  email          text,
  phone          text,
  coverage_line  text check (
    coverage_line in ('auto','home','life','business')
  ),
  status         lead_status not null default 'new',

  -- Attribution. campaign_id is resolved from utm_campaign by trigger below,
  -- but can also be set by hand for a walk-in who mentions they saw the ad.
  campaign_id    uuid references campaigns(id) on delete set null,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_content    text,
  utm_term       text,

  -- Money. quoted_premium is the annual premium you offered; sold_premium is
  -- what they actually bought. Both annual, so the math stays comparable.
  quoted_premium numeric(12,2) check (quoted_premium >= 0),
  sold_premium   numeric(12,2) check (sold_premium >= 0),
  -- Overrides the agency default when this policy pays an unusual commission.
  commission_rate numeric(6,4) check (commission_rate between 0 and 1),

  notes          text,
  created_at     timestamptz not null default now(),
  status_changed_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx  on leads (created_at);
create index if not exists leads_campaign_id_idx on leads (campaign_id);
create index if not exists leads_status_idx      on leads (status);

-- ---------------------------------------------------------------------------
-- Settings — one row, holding the unit economics
--
-- These five numbers are what turn a cost-per-click into a business decision.
-- Defaults are placeholders; replace them with your real figures on the
-- Settings page before trusting any target-CPL number.
-- ---------------------------------------------------------------------------
create table if not exists settings (
  id                      boolean primary key default true check (id),
  agency_name             text not null default 'Loomis Family Insurance Agency',
  -- Share of premium you earn as commission, year one.
  default_commission_rate numeric(6,4) not null default 0.1200
                          check (default_commission_rate between 0 and 1),
  -- Share of leads that eventually buy. Be honest here — optimism in this
  -- field is how agencies talk themselves into overpaying for clicks.
  expected_close_rate     numeric(6,4) not null default 0.2000
                          check (expected_close_rate between 0 and 1),
  avg_annual_premium      numeric(12,2) not null default 1800,
  -- How many years the average policy renews. Renewal commission is most of
  -- the value of an insurance customer, so leaving this at 1 will make every
  -- campaign look unprofitable.
  avg_retention_years     numeric(6,2) not null default 3.00,
  -- Fraction of a lead's value you're willing to pay to acquire it. 0.50
  -- means "spend at most half of what the lead is worth."
  target_cpl_ratio        numeric(6,4) not null default 0.5000
                          check (target_cpl_ratio between 0 and 1),
  -- Set this to bypass the calculation entirely and use a flat target.
  target_cpl_override     numeric(12,2) check (target_cpl_override >= 0),
  updated_at              timestamptz not null default now()
);

insert into settings (id) values (true) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sync runs — an audit trail for the connectors
-- ---------------------------------------------------------------------------
create table if not exists sync_runs (
  id           uuid primary key default gen_random_uuid(),
  platform     ad_platform not null,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  status       text not null default 'running'
               check (status in ('running','success','error')),
  rows_written integer not null default 0,
  message      text
);

create index if not exists sync_runs_platform_started_idx
  on sync_runs (platform, started_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Resolve a lead's campaign from its utm_campaign tag when not set explicitly.
create or replace function link_lead_to_campaign()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.campaign_id is null and new.utm_campaign is not null then
    select id into new.campaign_id
      from campaigns
     where lower(utm_campaign) = lower(new.utm_campaign)
     limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_link_campaign on leads;
create trigger leads_link_campaign
  before insert or update of utm_campaign, campaign_id on leads
  for each row execute function link_lead_to_campaign();

-- Stamp status_changed_at so "days in pipeline" is answerable later.
create or replace function touch_lead_status()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists leads_touch_status on leads;
create trigger leads_touch_status
  before update on leads
  for each row execute function touch_lead_status();

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists campaigns_touch_updated on campaigns;
create trigger campaigns_touch_updated
  before update on campaigns
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- This is an internal tool: every table is staff-only, no anonymous access at
-- all. Lead records hold names, emails and phone numbers, so the default of
-- "deny everything, then allow authenticated" is the right posture.
--
-- Create your staff login under Authentication -> Users, then turn OFF
-- "Enable sign ups" under Authentication -> Providers -> Email so nobody can
-- register themselves into your ad data.
-- ---------------------------------------------------------------------------
alter table campaigns     enable row level security;
alter table metrics_daily enable row level security;
alter table leads         enable row level security;
alter table settings      enable row level security;
alter table sync_runs     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['campaigns','metrics_daily','leads','settings','sync_runs']
  loop
    execute format('drop policy if exists staff_all on %I', t);
    execute format(
      'create policy staff_all on %I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ===========================================================================
-- Optional: sample data so the dashboard has something to draw before your
-- first real campaign. Uncomment, run, and delete the campaigns later —
-- metrics and leads cascade/detach automatically.
-- ===========================================================================
-- insert into campaigns (platform, name, status, coverage_line, utm_campaign, daily_budget)
-- values
--   ('google', 'Search — Auto Quotes',      'active', 'auto',     'goog-auto-search', 25),
--   ('meta',   'Homeowners — Local Radius',  'active', 'home',     'meta-home-local',  15),
--   ('reddit', 'r/personalfinance — Life',   'active', 'life',     'rdt-life-pf',      10);
