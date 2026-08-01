alter table public.safemy_protection_requests
  add column if not exists customer_gender text not null default 'prefer_not_to_say',
  add column if not exists personnel_gender_preference text not null default 'same_gender',
  add column if not exists pickup_lat double precision,
  add column if not exists pickup_lng double precision,
  add column if not exists tracking_token_hash text,
  add column if not exists tracking_enabled boolean not null default false,
  add column if not exists tracking_started_at timestamptz,
  add column if not exists tracking_ended_at timestamptz,
  add column if not exists assigned_personnel_id bigint,
  add column if not exists assigned_personnel_name text not null default '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'safemy_protection_requests_customer_gender_check' and conrelid = 'public.safemy_protection_requests'::regclass) then
    alter table public.safemy_protection_requests add constraint safemy_protection_requests_customer_gender_check check (customer_gender in ('female', 'male', 'non_binary', 'prefer_not_to_say'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'safemy_protection_requests_gender_preference_check' and conrelid = 'public.safemy_protection_requests'::regclass) then
    alter table public.safemy_protection_requests add constraint safemy_protection_requests_gender_preference_check check (personnel_gender_preference in ('same_gender', 'female', 'male', 'no_preference'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'safemy_protection_requests_pickup_coordinates_check' and conrelid = 'public.safemy_protection_requests'::regclass) then
    alter table public.safemy_protection_requests add constraint safemy_protection_requests_pickup_coordinates_check check ((pickup_lat is null and pickup_lng is null) or (pickup_lat between -90 and 90 and pickup_lng between -180 and 180));
  end if;
end $$;

create unique index if not exists safemy_protection_requests_tracking_token_hash_idx on public.safemy_protection_requests (tracking_token_hash) where tracking_token_hash is not null;

create table if not exists public.safemy_personnel (
  id bigint generated always as identity primary key,
  agency_id bigint not null references public.safemy_provider_applications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  gender text not null,
  role text not null,
  service_types text[] not null default '{}',
  verified boolean not null default false,
  available boolean not null default true,
  rating numeric(2,1) not null default 5.0,
  years_experience integer not null default 0,
  last_lat double precision,
  last_lng double precision,
  location_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint safemy_personnel_gender_check check (gender in ('female', 'male', 'non_binary')),
  constraint safemy_personnel_rating_check check (rating between 0 and 5),
  constraint safemy_personnel_experience_check check (years_experience >= 0),
  constraint safemy_personnel_coordinates_check check ((last_lat is null and last_lng is null) or (last_lat between -90 and 90 and last_lng between -180 and 180))
);

create index if not exists safemy_personnel_agency_available_idx on public.safemy_personnel (agency_id, available);
create index if not exists safemy_personnel_user_id_idx on public.safemy_personnel (user_id) where user_id is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'safemy_protection_requests_assigned_personnel_id_fkey' and conrelid = 'public.safemy_protection_requests'::regclass) then
    alter table public.safemy_protection_requests add constraint safemy_protection_requests_assigned_personnel_id_fkey foreign key (assigned_personnel_id) references public.safemy_personnel(id) on delete set null;
  end if;
end $$;

create index if not exists safemy_protection_requests_assigned_personnel_idx on public.safemy_protection_requests (assigned_personnel_id) where assigned_personnel_id is not null;

create table if not exists public.safemy_job_locations (
  request_id bigint not null references public.safemy_protection_requests(id) on delete cascade,
  actor_type text not null,
  personnel_id bigint references public.safemy_personnel(id) on delete set null,
  lat double precision not null,
  lng double precision not null,
  accuracy_m numeric(8,2),
  updated_at timestamptz not null default now(),
  primary key (request_id, actor_type),
  constraint safemy_job_locations_actor_type_check check (actor_type in ('customer', 'personnel')),
  constraint safemy_job_locations_coordinates_check check (lat between -90 and 90 and lng between -180 and 180)
);

create index if not exists safemy_job_locations_personnel_id_idx on public.safemy_job_locations (personnel_id) where personnel_id is not null;
create index if not exists safemy_job_locations_updated_at_idx on public.safemy_job_locations (updated_at desc);

alter table public.safemy_personnel enable row level security;
alter table public.safemy_job_locations enable row level security;

grant select, insert, update on public.safemy_personnel to authenticated;
grant usage, select on sequence public.safemy_personnel_id_seq to authenticated;
revoke all on public.safemy_job_locations from anon, authenticated;

drop policy if exists "agency reads own personnel" on public.safemy_personnel;
create policy "agency reads own personnel" on public.safemy_personnel for select to authenticated using (agency_id in (select id from public.safemy_provider_applications where user_id = (select auth.uid()) and status = 'approved'));

drop policy if exists "agency adds own personnel" on public.safemy_personnel;
create policy "agency adds own personnel" on public.safemy_personnel for insert to authenticated with check (agency_id in (select id from public.safemy_provider_applications where user_id = (select auth.uid()) and status = 'approved'));

drop policy if exists "agency updates own personnel" on public.safemy_personnel;
create policy "agency updates own personnel" on public.safemy_personnel for update to authenticated using (agency_id in (select id from public.safemy_provider_applications where user_id = (select auth.uid()) and status = 'approved')) with check (agency_id in (select id from public.safemy_provider_applications where user_id = (select auth.uid()) and status = 'approved'));
