-- ===========================================================================
-- Rally — Supabase schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New
-- query → paste → Run). It is idempotent: safe to re-run.
--
-- Access model: residents and volunteers are anonymous, organizers sign in.
-- Anyone may report an issue and anyone may sign up for an event without an
-- account. Only a signed-in organizer can publish an event, and only the
-- organizer of an event can see who signed up for it.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Organizer profiles
-- ---------------------------------------------------------------------------
-- One row per signed-in organizer, keyed to the Supabase auth user. Holds the
-- public-facing host name that appears on events ("UF Circle K"), which is the
-- only part of an organizer that is ever shown publicly.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  host_name   text not null default 'A neighbor',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "organizers manage their own profile" on public.profiles;
create policy "organizers manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Give every new auth user a profile so events always have a host name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, host_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'host_name', 'A neighbor'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Issues — the pin layer
-- ---------------------------------------------------------------------------
-- Layers 1 and 2 share this table because they share a shape: a GLOBE Observer
-- record and a resident report differ only in `source`.
--
-- larvae_count is nullable and the null MUST be preserved. A null means the
-- observer never sampled; a 0 means they sampled and found none. Collapsing
-- them would let an unchecked site read as a clear one. There is a check
-- constraint rather than a default for exactly this reason.

create table if not exists public.issues (
  id            uuid primary key default gen_random_uuid(),
  lat           double precision not null,
  lng           double precision not null,
  type          text not null,
  detail        text not null default '',
  water_source  text,
  larvae_count  integer,
  measured_at   date not null default current_date,
  reports       integer not null default 1,
  source        text not null default 'Resident report',
  globe_id      text unique,
  created_at    timestamptz not null default now(),

  constraint issues_lat_valid check (lat between -90 and 90),
  constraint issues_lng_valid check (lng between -180 and 180),
  -- Negative counts exist in the GLOBE archive. Reject them rather than
  -- storing junk; null is the right value for "unknown".
  constraint issues_larvae_sane check (larvae_count is null or larvae_count >= 0)
);

create index if not exists issues_measured_at_idx on public.issues (measured_at desc);
create index if not exists issues_latlng_idx on public.issues (lat, lng);

alter table public.issues enable row level security;

drop policy if exists "issues are publicly readable" on public.issues;
create policy "issues are publicly readable"
  on public.issues for select
  using (true);

-- Reporting is the one thing that must never need an account.
drop policy if exists "anyone can report an issue" on public.issues;
create policy "anyone can report an issue"
  on public.issues for insert
  with check (true);

-- ---------------------------------------------------------------------------
-- Events — derived from a pin
-- ---------------------------------------------------------------------------
-- An event inherits coordinates, type and suggested supplies from the issue it
-- came from. The organizer adds only date, time and host.
--
-- going_count is maintained by a trigger below rather than computed from
-- signups, because signups are private: the public needs the number without
-- being able to read the rows behind it.

create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  issue_id      uuid references public.issues (id) on delete set null,
  organizer_id  uuid not null references auth.users (id) on delete cascade,
  title         text not null,
  loc           text not null,
  lat           double precision,
  lng           double precision,
  starts_at     timestamptz not null,
  bring         text not null default 'Gloves and water',
  host_name     text not null default 'A neighbor',
  going_count   integer not null default 1,
  created_at    timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);

alter table public.events enable row level security;

drop policy if exists "events are publicly readable" on public.events;
create policy "events are publicly readable"
  on public.events for select
  using (true);

drop policy if exists "organizers publish their own events" on public.events;
create policy "organizers publish their own events"
  on public.events for insert
  to authenticated
  with check (auth.uid() = organizer_id);

drop policy if exists "organizers edit their own events" on public.events;
create policy "organizers edit their own events"
  on public.events for update
  to authenticated
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);

drop policy if exists "organizers delete their own events" on public.events;
create policy "organizers delete their own events"
  on public.events for delete
  to authenticated
  using (auth.uid() = organizer_id);

-- ---------------------------------------------------------------------------
-- Signups — personal data, locked down
-- ---------------------------------------------------------------------------
-- These rows hold names, emails and phone numbers. There is deliberately NO
-- public select policy: anyone can insert one, nobody can read them back
-- except the organizer of that event. Without this, the volunteer list of
-- every cleanup in the city would be a public mailing list.

create table if not exists public.signups (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  org         text,
  party_size  integer not null default 1,
  created_at  timestamptz not null default now(),

  constraint signups_party_sane check (party_size between 1 and 50),
  constraint signups_email_shaped check (email like '%_@_%._%')
);

create index if not exists signups_event_idx on public.signups (event_id);

alter table public.signups enable row level security;

drop policy if exists "anyone can sign up" on public.signups;
create policy "anyone can sign up"
  on public.signups for insert
  with check (true);

drop policy if exists "organizers read signups for their events" on public.signups;
create policy "organizers read signups for their events"
  on public.signups for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = signups.event_id
        and e.organizer_id = auth.uid()
    )
  );

-- Keep the public headcount in step with the private list.
create or replace function public.bump_going_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.events
       set going_count = going_count + new.party_size
     where id = new.event_id;
  elsif tg_op = 'DELETE' then
    update public.events
       set going_count = greatest(1, going_count - old.party_size)
     where id = old.event_id;
  end if;
  return null;
end;
$$;

drop trigger if exists signups_bump_going on public.signups;
create trigger signups_bump_going
  after insert or delete on public.signups
  for each row execute function public.bump_going_count();
