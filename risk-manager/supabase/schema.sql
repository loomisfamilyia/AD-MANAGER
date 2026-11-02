-- ===========================================================================
-- Loomis Family Insurance Agency — Personal Risk Manager
--
-- Client-facing tables. Paste this whole file into Supabase:
-- SQL Editor -> New query -> Run. Safe to re-run; every statement is guarded.
--
-- READ THIS BEFORE RUNNING IT AGAINST THE LOVABLE SITE'S DATABASE
--
-- The Ads Manager schema next door grants every logged-in user access to every
-- row ("to authenticated using (true)"). That is correct for a staff-only tool
-- and catastrophic for this one: here, *clients* log in. A single policy like
-- that on any table in this database would let every client read every other
-- client's household. Before running this file, check the target database:
--
--   select schemaname, tablename, policyname, qual
--     from pg_policies where qual = 'true';
--
-- Any row that comes back is a table every client will be able to read.
--
-- Access model, enforced by Row Level Security on every table:
--   * a client sees and edits only households they belong to
--   * staff (rows in staff_members, signed in with MFA) see everything
--   * logged-out visitors see nothing
--   * anonymous sign-ins (playing before making a login) can build their own
--     world, and reach staff only through prm_save_world_without_login
--   * a few columns and tables are staff-write-only: in-force policies,
--     agency notes, quote status. The client app can never mark something
--     "covered" — only Loomis can.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Refuse to run over someone else's tables
--
-- Every table here is tagged with a "prm:" comment. If a table with the same
-- name already exists without that tag, it belongs to something else (the
-- Lovable site may already have a `people` or `assets` table), and silently
-- skipping it with `create table if not exists` would leave a half-installed
-- schema that fails in confusing ways later. Stop instead.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tag text;
begin
  foreach t in array array[
    'staff_members', 'households', 'household_users', 'household_agency',
    'people', 'person_links', 'assets', 'household_files', 'property_records',
    'coverage_choices', 'budget_lines', 'quote_requests', 'insurance_policies',
    'insurance_policy_links', 'household_messages', 'household_achievements',
    'household_activity', 'household_contacts'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      tag := obj_description(('public.' || t)::regclass, 'pg_class');
      if tag is null or tag not like 'prm:%' then
        raise exception
          'public.% already exists and was not created by this script. Rename one of them first — see risk-manager/docs/TECHNICAL_DESIGN.md, "Installing the schema".', t;
      end if;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Staff
--
-- Staff are rows here, not a JWT claim, so removing someone takes effect on
-- their very next request instead of whenever their token next refreshes.
-- There is deliberately no insert policy: staff are added from the SQL editor.
--
--   insert into staff_members (user_id, display_name)
--   select id, 'Jane Loomis' from auth.users where email = 'jane@example.com';
--
-- If the Lovable site already has a roles table (Lovable projects often have
-- `user_roles` + `has_role()`), point prm_is_staff() at that instead and drop
-- this table.
-- ---------------------------------------------------------------------------
create table if not exists staff_members (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 80),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
comment on table staff_members is 'prm: agency staff who may see every household';

/**
 * True when the caller is active staff AND signed in with a second factor.
 *
 * The MFA requirement is the line most likely to be "temporarily" removed and
 * never restored. A stolen staff password with no second factor is every
 * client's household — address, valuables, photos of the valuables. Staff
 * enroll a TOTP authenticator once; Supabase Auth handles the rest.
 */
create or replace function prm_is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_members
     where user_id = auth.uid() and is_active
  )
  and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

/**
 * Supabase anonymous sign-ins hand out real `authenticated` sessions. That's
 * what lets someone start building their world before giving an email — but
 * it also means "authenticated" is not proof of a real person. Anything that
 * reaches a human at the agency (messages, quote requests) requires a
 * permanent account.
 */
create or replace function prm_is_permanent_user()
returns boolean
language sql
stable
set search_path = ''
as $$
  select auth.uid() is not null
     and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;

-- ---------------------------------------------------------------------------
-- Households — one per client "world"
-- ---------------------------------------------------------------------------
create table if not exists households (
  id             uuid primary key default gen_random_uuid(),
  display_name   text check (length(display_name) <= 80),   -- "The Smith family"
  created_by     uuid default auth.uid() references auth.users(id) on delete set null,
  -- What the client says they'd like to spend in total, per month. A wish,
  -- not a price — the per-line split lives in budget_lines.
  monthly_budget numeric(10,2) check (monthly_budget between 0 and 100000),
  -- Game state the database doesn't need to understand: avatar, xp, level,
  -- which reveals have played. XP must never convert into anything of value
  -- (see the anti-rebating note in TECHNICAL_DESIGN.md).
  world          jsonb not null default '{}'
                 check (jsonb_typeof(world) = 'object' and pg_column_size(world) < 16384),
  -- First-touch UTM parameters captured at sign-up, so a client who arrived
  -- from an ad can be attributed in the Ads Manager.
  first_touch    jsonb check (first_touch is null or jsonb_typeof(first_touch) = 'object'),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table households is 'prm: one client world';

-- Who can open a household. v1 has one owner per household; a spouse joining
-- the same world is a v2 invite flow, which is why this is a table at all.
create table if not exists household_users (
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'owner' check (role in ('owner', 'member')),
  created_at   timestamptz not null default now(),
  primary key (household_id, user_id)
);
comment on table household_users is 'prm: which logins can open which household';

-- One world per login in v1. Without this, a double-tap on "Start" creates two.
create unique index if not exists household_users_one_owned
  on household_users (user_id) where role = 'owner';

/**
 * Households the caller belongs to.
 *
 * Every client policy below is `household_id in (select prm_my_household_ids())`.
 * Security definer so the lookup doesn't recurse through household_users' own
 * RLS; the subselect form lets Postgres evaluate it once per query instead of
 * once per row.
 */
create or replace function prm_my_household_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select household_id from public.household_users where user_id = auth.uid();
$$;

-- Staff-only facts about a household. A separate table rather than columns on
-- `households`, because RLS is per row: if these were columns, a client who
-- can update their household could update these too.
create table if not exists household_agency (
  household_id  uuid primary key references households(id) on delete cascade,
  status        text not null default 'prospect'
                check (status in ('prospect', 'client', 'former')),
  assigned_to   uuid references auth.users(id) on delete set null,
  -- The matching record in the agency management system, once there is one.
  ams_client_id text,
  notes         text,
  updated_at    timestamptz not null default now()
);
comment on table household_agency is 'prm: staff-only notes and status per household';

-- ---------------------------------------------------------------------------
-- People and the family tree
--
-- Every child table carries household_id and references its parents through
-- (household_id, id) pairs. That makes "this car belongs to a person in a
-- different household" unrepresentable — enforced by foreign keys, not by
-- remembering to check.
-- ---------------------------------------------------------------------------
create table if not exists people (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  -- The player. Exactly one per household.
  is_self       boolean not null default false,
  -- Relative to the player: spouse, partner, child, parent, ...
  relationship  text check (relationship ~ '^[a-z_]{2,30}$'),
  first_name    text not null check (length(first_name) between 1 and 80),
  last_name     text check (length(last_name) <= 80),
  birth_date    date check (birth_date >= '1900-01-01'),
  lives_here    boolean,
  -- Answers to the catalog's person questions (drives, license_status, ...).
  details       jsonb not null default '{}'
                check (jsonb_typeof(details) = 'object' and pg_column_size(details) < 16384),
  world_position jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Soft delete powers "Undo". Rows past 30 days are purged by a scheduled job.
  deleted_at    timestamptz,
  unique (household_id, id)
);
comment on table people is 'prm: household members and family';

create unique index if not exists people_one_self
  on people (household_id) where is_self and deleted_at is null;
create index if not exists people_household_idx
  on people (household_id) where deleted_at is null;

-- Family tree edges. Only direct relationships are stored — grandparents,
-- cousins and in-laws are derived, so the tree can't contradict itself.
create table if not exists person_links (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households(id) on delete cascade,
  from_person_id uuid not null,
  to_person_id   uuid not null,
  kind           text not null
                 check (kind in ('parent_of', 'spouse_of', 'partner_of', 'guardian_of', 'sibling_of')),
  created_at     timestamptz not null default now(),
  check (from_person_id <> to_person_id),
  unique (from_person_id, to_person_id, kind),
  foreign key (household_id, from_person_id) references people (household_id, id) on delete cascade,
  foreign key (household_id, to_person_id)   references people (household_id, id) on delete cascade
);
comment on table person_links is 'prm: family tree edges';

-- ---------------------------------------------------------------------------
-- Assets — everything that can be placed in the world
--
-- One table for every kind (homes, cars, boats, rings, dogs, jobs), keyed by
-- the catalog id in `kind`. The catalog (risk-manager/src/catalog) defines the
-- questions; the answers land in `details`. Adding a new kind of thing is a
-- code change, never a migration.
-- ---------------------------------------------------------------------------
create table if not exists assets (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references households(id) on delete cascade,
  kind            text not null check (kind ~ '^[a-z][a-z0-9_]{1,60}$'),
  -- Home systems and inventory items live inside a residence.
  parent_id       uuid,
  -- Whose car, whose job, whose ring.
  owner_person_id uuid,
  name            text not null check (length(name) between 1 and 120),
  estimated_value numeric(12,2) check (estimated_value >= 0),
  -- Where the value came from. An owner's guess and an appraisal are not the
  -- same number, and the agent quoting it needs to know which this is.
  value_source    text check (value_source in ('owner', 'public_record', 'receipt', 'appraisal', 'agent')),
  details         jsonb not null default '{}'
                  check (jsonb_typeof(details) = 'object' and pg_column_size(details) < 32768),
  -- 0–100, share of the catalog's questions answered. Drives the progress ring.
  completeness    smallint not null default 0 check (completeness between 0 and 100),
  world_position  jsonb,
  -- Pulled out of details so staff can search by VIN.
  vin             text generated always as (upper(details ->> 'vin')) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (household_id, id),
  foreign key (household_id, parent_id)
    references assets (household_id, id) on delete cascade,
  foreign key (household_id, owner_person_id)
    references people (household_id, id) on delete set null (owner_person_id)
);
comment on table assets is 'prm: homes, vehicles, toys, pets, valuables, jobs, businesses';

create index if not exists assets_household_idx
  on assets (household_id) where deleted_at is null;
create index if not exists assets_parent_idx
  on assets (parent_id) where parent_id is not null;
create index if not exists assets_vin_idx
  on assets (vin) where vin is not null;

-- Public-records results for a residence. Written by the lookup edge function
-- with the service role; clients can read them but not forge them, so staff
-- can tell "the county says 1978" from "the client typed 1978".
create table if not exists property_records (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  asset_id     uuid not null,
  provider     text not null,
  fetched_at   timestamptz not null default now(),
  -- Normalized fields the app displays (year_built, sqft, stories, ...).
  summary      jsonb not null default '{}' check (jsonb_typeof(summary) = 'object'),
  -- The provider's response, only where its license allows storing it.
  raw          jsonb,
  foreign key (household_id, asset_id) references assets (household_id, id) on delete cascade
);
comment on table property_records is 'prm: public-record lookups for residences';

create index if not exists property_records_asset_idx on property_records (asset_id);

-- ---------------------------------------------------------------------------
-- Files — photos, receipts, appraisals
--
-- The bytes live in the private `household-files` storage bucket under
-- `{household_id}/...`; this table is the index. The storage policies at the
-- bottom of this file key off that first path segment.
-- ---------------------------------------------------------------------------
create table if not exists household_files (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  asset_id     uuid,
  person_id    uuid,
  storage_path text not null unique
               check (split_part(storage_path, '/', 1) = household_id::text),
  kind         text not null default 'photo'
               check (kind in ('photo', 'receipt', 'appraisal', 'document', 'declarations')),
  content_type text,
  byte_size    integer check (byte_size between 0 and 10485760),
  uploaded_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (household_id, id),
  foreign key (household_id, asset_id)
    references assets (household_id, id) on delete cascade,
  foreign key (household_id, person_id)
    references people (household_id, id) on delete cascade
);
comment on table household_files is 'prm: index of files in the household-files bucket';

create index if not exists household_files_asset_idx on household_files (asset_id) where asset_id is not null;

-- ---------------------------------------------------------------------------
-- The protection plan
-- ---------------------------------------------------------------------------

-- One row per coverage per thing: "for the CR-V, collision is a Need".
-- A row with no asset and no person applies to the whole household (umbrella).
create table if not exists coverage_choices (
  id                 uuid primary key default gen_random_uuid(),
  household_id       uuid not null references households(id) on delete cascade,
  coverage_id        text not null check (coverage_id ~ '^[a-z][a-z0-9_]{1,60}$'),
  -- Copied from the catalog at write time so the database can group by line
  -- (budgets, quote requests) without knowing the catalog.
  line               text not null check (line ~ '^[a-z][a-z0-9_]{1,40}$'),
  asset_id           uuid,
  person_id          uuid,
  stance             text not null check (stance in ('need', 'want', 'not_now')),
  desired_limit      text check (length(desired_limit) <= 60),
  desired_deductible text check (length(desired_deductible) <= 60),
  note               text check (length(note) <= 500),
  -- Stamped when this choice goes out in a quote request. The shield shows
  -- "Quote requested" while requested_at >= updated_at; any later edit drops
  -- it back to "Planned", because the agent hasn't seen that version.
  requested_at       timestamptz,
  -- The upsert key: asset, else person, else the household itself. A generated
  -- column rather than an expression index because PostgREST upserts can only
  -- target real columns.
  target_id          uuid generated always as (coalesce(asset_id, person_id, household_id)) stored,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (num_nonnulls(asset_id, person_id) <= 1),
  unique (household_id, coverage_id, target_id),
  foreign key (household_id, asset_id)
    references assets (household_id, id) on delete cascade,
  foreign key (household_id, person_id)
    references people (household_id, id) on delete cascade
);
comment on table coverage_choices is 'prm: need / want / not now, per coverage per thing';

create index if not exists coverage_choices_household_line_idx
  on coverage_choices (household_id, line);

-- What the client would like to spend per line, per month. Information for
-- the agent, not a price.
create table if not exists budget_lines (
  household_id   uuid not null references households(id) on delete cascade,
  line           text not null check (line ~ '^[a-z][a-z0-9_]{1,40}$'),
  monthly_amount numeric(10,2) not null default 0 check (monthly_amount between 0 and 100000),
  updated_at     timestamptz not null default now(),
  primary key (household_id, line)
);
comment on table budget_lines is 'prm: desired monthly spend per line';

-- How Loomis reaches the household. A logged-in client's email is already on
-- their login; this holds everything else, and for a world saved without a
-- login it is the only way back to the person who built it.
create table if not exists household_contacts (
  household_id      uuid primary key references households(id) on delete cascade,
  full_name         text check (length(full_name) between 1 and 120),
  email             text check (length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone             text check (length(regexp_replace(phone, '\D', '', 'g')) between 10 and 15),
  preferred_contact text check (preferred_contact in ('call', 'text', 'email')),
  updated_at        timestamptz not null default now()
);
comment on table household_contacts is 'prm: how Loomis reaches the household';

-- ---------------------------------------------------------------------------
-- Quote requests
--
-- The client sends `lines` and an optional `note`; everything else is filled
-- in by the database. In particular `snapshot` is built server-side from the
-- household's plan at the moment of the request, so the agent quotes exactly
-- what the client saw — not whatever they edit afterwards, and not whatever a
-- modified client chose to send.
--
-- A world saved without a login arrives here too, as source 'saved_world'
-- (see prm_save_world_without_login), so staff work one inbox, not two.
-- ---------------------------------------------------------------------------
create table if not exists quote_requests (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  -- Set by the database from who is asking, never by the client.
  source       text not null default 'quote_request'
               check (source in ('quote_request', 'saved_world')),
  -- A saved world may have no plan yet ("just call me"); a quote request
  -- always names at least one line.
  lines        text[] not null check (cardinality(lines) <= 30),
  note         text check (length(note) <= 2000),
  snapshot     jsonb not null default '{}',
  status       text not null default 'new'
               check (status in ('new', 'in_review', 'quoted', 'won', 'lost', 'closed')),
  assigned_to  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (source = 'saved_world' or cardinality(lines) >= 1),
  unique (household_id, id)
);
comment on table quote_requests is 'prm: plans sent to the agency for quoting';

create index if not exists quote_requests_status_idx on quote_requests (status, created_at);

-- ---------------------------------------------------------------------------
-- In-force policies — staff-written only
--
-- This is the only thing that turns a shield gold. Clients can read their own
-- rows; only staff can create or change them. Keep it that way: an app that
-- lets a client mark their own boat "covered" is an E&O claim waiting to
-- happen.
-- ---------------------------------------------------------------------------
create table if not exists insurance_policies (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references households(id) on delete cascade,
  line            text not null check (line ~ '^[a-z][a-z0-9_]{1,40}$'),
  carrier         text,
  policy_number   text,
  effective_date  date,
  expiration_date date,
  annual_premium  numeric(12,2) check (annual_premium >= 0),
  status          text not null default 'active'
                  check (status in ('pending', 'active', 'cancelled', 'expired')),
  -- The matching record in the agency management system.
  ams_policy_id   text,
  verified_by     uuid default auth.uid() references auth.users(id) on delete set null,
  verified_at     timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (expiration_date is null or effective_date is null or expiration_date > effective_date),
  unique (household_id, id)
);
comment on table insurance_policies is 'prm: in-force policies, verified by staff';

-- Which things a policy covers. Both ids null = the whole household (umbrella).
create table if not exists insurance_policy_links (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  policy_id    uuid not null,
  asset_id     uuid,
  person_id    uuid,
  check (num_nonnulls(asset_id, person_id) <= 1),
  foreign key (household_id, policy_id)
    references insurance_policies (household_id, id) on delete cascade,
  foreign key (household_id, asset_id)
    references assets (household_id, id) on delete cascade,
  foreign key (household_id, person_id)
    references people (household_id, id) on delete cascade
);
comment on table insurance_policy_links is 'prm: which things each policy covers';

create index if not exists insurance_policy_links_policy_idx on insurance_policy_links (policy_id);

-- ---------------------------------------------------------------------------
-- Messages — one thread per household with Loomis HQ
--
-- Who sent a message is decided by the database, not the client: a trigger
-- overwrites sender_role and sender_user_id on every insert, so nobody can
-- post as "staff". There is no client update or delete — what was said to
-- the agency stays said.
-- ---------------------------------------------------------------------------
create table if not exists household_messages (
  id               uuid primary key default gen_random_uuid(),
  household_id     uuid not null references households(id) on delete cascade,
  sender_user_id   uuid references auth.users(id) on delete set null,
  sender_role      text not null default 'client'
                   check (sender_role in ('client', 'staff', 'system')),
  -- Staff display name at the time of sending; null for clients and system.
  sender_name      text,
  body             text not null check (length(body) between 1 and 4000),
  quote_request_id uuid,
  file_id          uuid,
  created_at       timestamptz not null default now(),
  read_by_client_at timestamptz,
  read_by_staff_at  timestamptz,
  foreign key (household_id, quote_request_id)
    references quote_requests (household_id, id) on delete set null (quote_request_id),
  foreign key (household_id, file_id)
    references household_files (household_id, id) on delete set null (file_id)
);
comment on table household_messages is 'prm: the client <-> Loomis HQ thread';

create index if not exists household_messages_thread_idx
  on household_messages (household_id, created_at desc);
create index if not exists household_messages_unread_staff_idx
  on household_messages (created_at) where read_by_staff_at is null and sender_role = 'client';

-- ---------------------------------------------------------------------------
-- Game bookkeeping and the audit trail
-- ---------------------------------------------------------------------------
create table if not exists household_achievements (
  household_id   uuid not null references households(id) on delete cascade,
  achievement_id text not null check (achievement_id ~ '^[a-z][a-z0-9_]{1,60}$'),
  earned_at      timestamptz not null default now(),
  primary key (household_id, achievement_id)
);
comment on table household_achievements is 'prm: badges earned (no cash value, ever)';

-- Who changed what, when — not what it changed to, so this table never holds
-- a second copy of anyone's personal details. No foreign key on household_id
-- on purpose: the trail has to outlive a deleted household.
create table if not exists household_activity (
  id             bigint generated always as identity primary key,
  household_id   uuid,
  actor_user_id  uuid,
  actor_is_staff boolean not null default false,
  table_name     text not null,
  row_id         uuid,
  action         text not null check (action in ('insert', 'update', 'delete')),
  at             timestamptz not null default now()
);
comment on table household_activity is 'prm: audit trail of changes (no field values)';

create index if not exists household_activity_household_idx
  on household_activity (household_id, at desc);

-- ===========================================================================
-- Triggers
-- ===========================================================================

create or replace function prm_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'households', 'household_agency', 'people', 'assets', 'coverage_choices',
    'budget_lines', 'quote_requests', 'insurance_policies', 'household_contacts'
  ]
  loop
    execute format('drop trigger if exists prm_touch_updated on %I', t);
    execute format(
      'create trigger prm_touch_updated before update on %I
         for each row execute function prm_touch_updated_at()', t);
  end loop;
end $$;

-- The creator of a household becomes its owner. Clients have no insert
-- permission on household_users at all, so this is the only way in.
create or replace function prm_add_household_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    insert into public.household_users (household_id, user_id, role)
    values (new.id, auth.uid(), 'owner');
  end if;
  return new;
end;
$$;

drop trigger if exists prm_household_owner on households;
create trigger prm_household_owner
  after insert on households
  for each row execute function prm_add_household_owner();

-- Messages: the database decides who's talking.
--
-- System messages ("Quote request sent") can only come from another trigger.
-- pg_trigger_depth() is 1 when a client inserts directly and 2 when the insert
-- comes from inside a trigger, so a client sending sender_role = 'system'
-- gets 'client' like everyone else.
create or replace function prm_stamp_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.sender_role = 'system' and pg_trigger_depth() > 1 then
    new.sender_user_id := null;
    new.sender_name := 'Loomis HQ';
  elsif public.prm_is_staff() then
    new.sender_role := 'staff';
    new.sender_user_id := auth.uid();
    select display_name into new.sender_name
      from public.staff_members where user_id = auth.uid();
  else
    new.sender_role := 'client';
    new.sender_user_id := auth.uid();
    new.sender_name := null;
  end if;
  new.created_at := now();
  new.read_by_client_at := null;
  new.read_by_staff_at := null;
  return new;
end;
$$;

drop trigger if exists prm_stamp_message on household_messages;
create trigger prm_stamp_message
  before insert on household_messages
  for each row execute function prm_stamp_message();

-- Quote requests: build the snapshot server-side and stamp who asked.
create or replace function prm_prepare_quote_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.requested_by := auth.uid();
  new.created_at := now();
  -- Anonymous sessions can't insert here directly (RLS), only through
  -- prm_save_world_without_login, so "anonymous" means "saved world".
  new.source := case
    when coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then 'saved_world'
    else 'quote_request'
  end;
  if not public.prm_is_staff() then
    new.status := 'new';
    new.assigned_to := null;
  end if;

  new.snapshot := jsonb_build_object(
    'taken_at', now(),
    'monthly_budget',
      (select h.monthly_budget from public.households h where h.id = new.household_id),
    'contact',
      (select to_jsonb(hc) - 'household_id'
         from public.household_contacts hc where hc.household_id = new.household_id),
    'budget_lines',
      (select coalesce(jsonb_object_agg(b.line, b.monthly_amount), '{}'::jsonb)
         from public.budget_lines b where b.household_id = new.household_id),
    'people',
      (select coalesce(jsonb_agg(to_jsonb(p) - 'household_id' - 'world_position'), '[]'::jsonb)
         from public.people p
        where p.household_id = new.household_id and p.deleted_at is null),
    'assets',
      (select coalesce(jsonb_agg(to_jsonb(a) - 'household_id' - 'world_position'), '[]'::jsonb)
         from public.assets a
        where a.household_id = new.household_id and a.deleted_at is null),
    'coverage_choices',
      (select coalesce(jsonb_agg(to_jsonb(c) - 'household_id'), '[]'::jsonb)
         from public.coverage_choices c
        where c.household_id = new.household_id
          and c.stance <> 'not_now'
          and c.line = any (new.lines))
  );
  return new;
end;
$$;

drop trigger if exists prm_prepare_quote_request on quote_requests;
create trigger prm_prepare_quote_request
  before insert on quote_requests
  for each row execute function prm_prepare_quote_request();

-- ...then drop a note in the thread and flip the shields to "requested".
create or replace function prm_after_quote_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.household_messages (household_id, sender_role, body, quote_request_id)
  values (
    new.household_id,
    'system',
    case new.source
      when 'saved_world' then 'World saved without a login. They asked Loomis to reach out.'
      else 'Quote request sent: ' || array_to_string(new.lines, ', ')
    end,
    new.id
  );

  update public.coverage_choices
     set requested_at = now()
   where household_id = new.household_id
     and stance <> 'not_now'
     and line = any (new.lines);

  return null;
end;
$$;

drop trigger if exists prm_after_quote_request on quote_requests;
create trigger prm_after_quote_request
  after insert on quote_requests
  for each row execute function prm_after_quote_request();

-- Audit trail. Records the fact of a change, never the values.
create or replace function prm_log_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r jsonb;
begin
  if tg_op = 'DELETE' then r := to_jsonb(old); else r := to_jsonb(new); end if;
  insert into public.household_activity
    (household_id, actor_user_id, actor_is_staff, table_name, row_id, action)
  values (
    (r ->> 'household_id')::uuid,
    auth.uid(),
    public.prm_is_staff(),
    tg_table_name,
    case when r ? 'id' then (r ->> 'id')::uuid end,
    lower(tg_op)
  );
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'people', 'person_links', 'assets', 'household_files', 'coverage_choices',
    'budget_lines', 'quote_requests', 'insurance_policies', 'insurance_policy_links',
    'household_contacts'
  ]
  loop
    execute format('drop trigger if exists prm_log_activity on %I', t);
    execute format(
      'create trigger prm_log_activity after insert or update or delete on %I
         for each row execute function prm_log_activity()', t);
  end loop;
end $$;

-- ===========================================================================
-- RPCs
-- ===========================================================================

-- Mark the thread read from whichever side is calling. An RPC rather than an
-- update policy, because clients can't be given update on messages without
-- also being able to rewrite what they said.
create or replace function prm_mark_thread_read(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.prm_is_staff() then
    update public.household_messages
       set read_by_staff_at = now()
     where household_id = p_household_id
       and sender_role = 'client'
       and read_by_staff_at is null;
  elsif p_household_id in (select public.prm_my_household_ids()) then
    update public.household_messages
       set read_by_client_at = now()
     where household_id = p_household_id
       and sender_role in ('staff', 'system')
       and read_by_client_at is null;
  else
    raise exception 'not a member of this household' using errcode = '42501';
  end if;
end;
$$;

/**
 * Save a world without making a login.
 *
 * The client was offered a login and declined, but still wants Loomis to
 * have what they built. This is the form-submission path: it records how to
 * reach them and files a 'saved_world' request that lands in the staff inbox
 * like any quote request. The app signs the anonymous session out right
 * after, so the world can't be reopened from that device (a shared family
 * computer shouldn't keep showing it). The client gets back to it by talking
 * to Loomis, and staff can attach it to a new login through household_users.
 *
 * This is the only door from an anonymous session to a person at the agency,
 * so it is deliberately narrow: anonymous callers only, their own world only,
 * once per world, and only with a way to reach them.
 */
create or replace function prm_save_world_without_login(
  p_full_name         text,
  p_phone             text default null,
  p_email             text default null,
  p_preferred_contact text default null,
  p_note              text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_household uuid;
  v_lines     text[];
  v_request   uuid;
begin
  if auth.uid() is null or public.prm_is_permanent_user() then
    raise exception 'only for worlds saved without a login; logged-in clients send a quote request'
      using errcode = '42501';
  end if;

  select household_id into v_household
    from public.household_users
   where user_id = auth.uid() and role = 'owner';
  if v_household is null then
    raise exception 'there is no world to save yet' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.quote_requests
     where household_id = v_household and source = 'saved_world'
  ) then
    raise exception 'this world has already been saved with Loomis' using errcode = '23505';
  end if;

  if nullif(btrim(p_full_name), '') is null then
    raise exception 'a name is needed so Loomis knows who to ask for' using errcode = '23514';
  end if;
  if nullif(btrim(p_phone), '') is null and nullif(btrim(p_email), '') is null then
    raise exception 'a phone number or email is needed so Loomis can reach you' using errcode = '23514';
  end if;

  insert into public.household_contacts
    (household_id, full_name, email, phone, preferred_contact)
  values (
    v_household,
    btrim(p_full_name),
    nullif(btrim(p_email), ''),
    nullif(btrim(p_phone), ''),
    p_preferred_contact
  )
  on conflict (household_id) do update
    set full_name         = excluded.full_name,
        email             = excluded.email,
        phone             = excluded.phone,
        preferred_contact = excluded.preferred_contact;

  -- Every line in their plan, so the snapshot carries all of it.
  select coalesce(array_agg(distinct line order by line), '{}')
    into v_lines
    from public.coverage_choices
   where household_id = v_household and stance <> 'not_now';

  insert into public.quote_requests (household_id, lines, note)
  values (v_household, v_lines, nullif(btrim(p_note), ''))
  returning id into v_request;

  return v_request;
end;
$$;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'staff_members', 'households', 'household_users', 'household_agency',
    'people', 'person_links', 'assets', 'household_files', 'property_records',
    'coverage_choices', 'budget_lines', 'quote_requests', 'insurance_policies',
    'insurance_policy_links', 'household_messages', 'household_achievements',
    'household_activity', 'household_contacts'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    -- Defense in depth: logged-out visitors get no table privileges at all,
    -- so a policy written carelessly later still can't expose anything to them.
    execute format('revoke all on %I from anon', t);
    -- Staff can do anything, everywhere. Narrower rules for clients follow.
    execute format('drop policy if exists staff_all on %I', t);
    execute format(
      'create policy staff_all on %I for all to authenticated
         using ((select prm_is_staff())) with check ((select prm_is_staff()))', t);
  end loop;
end $$;

-- Tables a client fully owns: read, add, change and remove their own rows.
do $$
declare t text;
begin
  foreach t in array array[
    'people', 'person_links', 'assets', 'household_files', 'coverage_choices',
    'budget_lines', 'household_achievements', 'household_contacts'
  ]
  loop
    execute format('drop policy if exists member_all on %I', t);
    execute format(
      'create policy member_all on %I for all to authenticated
         using (household_id in (select prm_my_household_ids()))
         with check (household_id in (select prm_my_household_ids()))', t);
  end loop;
end $$;

-- Tables a client can read but only staff (or the database) can write.
do $$
declare t text;
begin
  foreach t in array array[
    'property_records', 'insurance_policies', 'insurance_policy_links'
  ]
  loop
    execute format('drop policy if exists member_read on %I', t);
    execute format(
      'create policy member_read on %I for select to authenticated
         using (household_id in (select prm_my_household_ids()))', t);
  end loop;
end $$;

-- households: the creator can read their row before the owner trigger has
-- linked them, which is what lets `insert(...).select()` return it.
drop policy if exists member_read on households;
create policy member_read on households for select to authenticated
  using (id in (select prm_my_household_ids()) or created_by = (select auth.uid()));

drop policy if exists member_create on households;
create policy member_create on households for insert to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists member_update on households;
create policy member_update on households for update to authenticated
  using (id in (select prm_my_household_ids()))
  with check (id in (select prm_my_household_ids()));

drop policy if exists owner_delete on households;
create policy owner_delete on households for delete to authenticated
  using (id in (
    select household_id from household_users
     where user_id = (select auth.uid()) and role = 'owner'
  ));

-- household_users: see your own memberships. No client writes — if a client
-- could update this table they could point their membership at any household
-- id they managed to learn.
drop policy if exists self_read on household_users;
create policy self_read on household_users for select to authenticated
  using (user_id = (select auth.uid()));

-- quote_requests and messages reach a human, so they need a real account.
drop policy if exists member_read on quote_requests;
create policy member_read on quote_requests for select to authenticated
  using (household_id in (select prm_my_household_ids()));

drop policy if exists member_create on quote_requests;
create policy member_create on quote_requests for insert to authenticated
  with check (
    household_id in (select prm_my_household_ids())
    and (select prm_is_permanent_user())
  );

drop policy if exists member_read on household_messages;
create policy member_read on household_messages for select to authenticated
  using (household_id in (select prm_my_household_ids()));

drop policy if exists member_create on household_messages;
create policy member_create on household_messages for insert to authenticated
  with check (
    household_id in (select prm_my_household_ids())
    and (select prm_is_permanent_user())
  );

-- staff_members, household_agency, household_activity: staff_all only.

-- Functions in `public` are callable over the API. Nothing here is useful to a
-- logged-out visitor.
revoke execute on function prm_is_staff() from public, anon;
revoke execute on function prm_is_permanent_user() from public, anon;
revoke execute on function prm_my_household_ids() from public, anon;
revoke execute on function prm_mark_thread_read(uuid) from public, anon;
revoke execute on function prm_save_world_without_login(text, text, text, text, text) from public, anon;
grant execute on function prm_is_staff() to authenticated;
grant execute on function prm_is_permanent_user() to authenticated;
grant execute on function prm_my_household_ids() to authenticated;
grant execute on function prm_mark_thread_read(uuid) to authenticated;
grant execute on function prm_save_world_without_login(text, text, text, text, text) to authenticated;

-- ===========================================================================
-- Storage: private bucket for photos, receipts and appraisals
--
-- Paths are `{household_id}/{file}`. Photos of a client's jewelry next to
-- their home address are a burglar's shopping list, so this bucket is never
-- public; the app shows images through short-lived signed URLs.
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'household-files', 'household-files', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
on conflict (id) do nothing;

-- The household id in an object path, or null if the first segment isn't a
-- uuid — so a malformed path is denied rather than raising a cast error.
create or replace function prm_storage_household_id(object_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(object_name, '/', 1)
         ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(object_name, '/', 1)::uuid
  end;
$$;

drop policy if exists prm_files_read on storage.objects;
create policy prm_files_read on storage.objects for select to authenticated
  using (
    bucket_id = 'household-files'
    and (
      public.prm_storage_household_id(name) in (select public.prm_my_household_ids())
      or (select public.prm_is_staff())
    )
  );

drop policy if exists prm_files_write on storage.objects;
create policy prm_files_write on storage.objects for insert to authenticated
  with check (
    bucket_id = 'household-files'
    and (
      public.prm_storage_household_id(name) in (select public.prm_my_household_ids())
      or (select public.prm_is_staff())
    )
  );

drop policy if exists prm_files_update on storage.objects;
create policy prm_files_update on storage.objects for update to authenticated
  using (
    bucket_id = 'household-files'
    and (
      public.prm_storage_household_id(name) in (select public.prm_my_household_ids())
      or (select public.prm_is_staff())
    )
  )
  with check (
    bucket_id = 'household-files'
    and (
      public.prm_storage_household_id(name) in (select public.prm_my_household_ids())
      or (select public.prm_is_staff())
    )
  );

drop policy if exists prm_files_delete on storage.objects;
create policy prm_files_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'household-files'
    and (
      public.prm_storage_household_id(name) in (select public.prm_my_household_ids())
      or (select public.prm_is_staff())
    )
  );

-- ===========================================================================
-- Realtime: new messages appear without a refresh. Realtime applies the RLS
-- policies above, so each client only hears their own thread.
-- ===========================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'household_messages'
  ) then
    alter publication supabase_realtime add table public.household_messages;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication not found; skipping (not a Supabase database?)';
end $$;
