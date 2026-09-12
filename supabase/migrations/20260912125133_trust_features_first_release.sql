-- SafeMY first-release trust surfaces: transparent quote state, immutable-ish
-- booking milestones, public provider proof, reviews and support cases.

alter table public.safemy_protection_requests
  add column if not exists quote_status text not null default 'pending',
  add column if not exists quote_currency text not null default 'MYR',
  add column if not exists quote_amount numeric(10,2),
  add column if not exists quote_breakdown jsonb not null default '[]'::jsonb,
  add column if not exists quote_issued_at timestamptz,
  add column if not exists quote_expires_at timestamptz,
  add column if not exists quote_accepted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists assigned_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists declined_at timestamptz,
  add column if not exists cancelled_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'safemy_protection_requests_quote_status_check' and conrelid = 'public.safemy_protection_requests'::regclass) then
    alter table public.safemy_protection_requests add constraint safemy_protection_requests_quote_status_check check (quote_status in ('pending', 'issued', 'accepted', 'declined', 'expired'));
  end if;
end $$;

alter table public.safemy_job_locations
  add column if not exists battery_percent numeric(5,2),
  add column if not exists heading_deg numeric(6,2),
  add column if not exists speed_mps numeric(8,2);

create table if not exists public.safemy_booking_events (
  id bigint generated always as identity primary key,
  request_id bigint not null references public.safemy_protection_requests(id) on delete cascade,
  actor_type text not null check (actor_type in ('system', 'customer', 'agency', 'personnel', 'admin')),
  actor_id uuid,
  event_type text not null,
  label text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists safemy_booking_events_request_idx on public.safemy_booking_events (request_id, created_at);

create or replace function public.safemy_record_request_received()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.safemy_booking_events (request_id, actor_type, event_type, label, metadata)
  values (new.id, 'system', 'request_received', 'Request received', jsonb_build_object('reference', new.reference));
  return new;
end;
$$;
drop trigger if exists safemy_request_received_event on public.safemy_protection_requests;
create trigger safemy_request_received_event after insert on public.safemy_protection_requests for each row execute function public.safemy_record_request_received();

alter table public.safemy_booking_events enable row level security;
grant select, insert on public.safemy_booking_events to authenticated;
grant usage, select on sequence public.safemy_booking_events_id_seq to authenticated;

drop policy if exists "participants read booking events" on public.safemy_booking_events;
create policy "participants read booking events" on public.safemy_booking_events for select to authenticated using (
  public.safemy_is_admin()
  or exists (select 1 from public.safemy_protection_requests r where r.id = request_id and r.customer_user_id = (select auth.uid()))
  or exists (select 1 from public.safemy_protection_requests r join public.safemy_provider_applications a on a.id = r.assigned_agency_id where r.id = request_id and a.user_id = (select auth.uid()))
  or exists (select 1 from public.safemy_protection_requests r join public.safemy_personnel p on p.id = r.assigned_personnel_id where r.id = request_id and p.user_id = (select auth.uid()))
);

drop policy if exists "participants add booking events" on public.safemy_booking_events;
create policy "participants add booking events" on public.safemy_booking_events for insert to authenticated with check (
  (actor_id = (select auth.uid())) and (
    (actor_type = 'admin' and public.safemy_is_admin())
    or
    (actor_type = 'customer' and exists (select 1 from public.safemy_protection_requests r where r.id = request_id and r.customer_user_id = (select auth.uid())))
    or (actor_type = 'agency' and exists (select 1 from public.safemy_protection_requests r join public.safemy_provider_applications a on a.id = r.assigned_agency_id where r.id = request_id and a.user_id = (select auth.uid())))
    or (actor_type = 'personnel' and exists (select 1 from public.safemy_protection_requests r join public.safemy_personnel p on p.id = r.assigned_personnel_id where r.id = request_id and p.user_id = (select auth.uid())))
  )
);

create table if not exists public.safemy_assignment_reviews (
  id bigint generated always as identity primary key,
  request_id bigint not null references public.safemy_protection_requests(id) on delete cascade,
  reviewer_type text not null check (reviewer_type in ('customer', 'personnel')),
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (request_id, reviewer_type)
);

create index if not exists safemy_assignment_reviews_request_idx on public.safemy_assignment_reviews (request_id);
alter table public.safemy_assignment_reviews enable row level security;
grant select, insert on public.safemy_assignment_reviews to authenticated;
grant usage, select on sequence public.safemy_assignment_reviews_id_seq to authenticated;

drop policy if exists "participants read reviews" on public.safemy_assignment_reviews;
create policy "participants read reviews" on public.safemy_assignment_reviews for select to authenticated using (
  public.safemy_is_admin()
  or exists (select 1 from public.safemy_protection_requests r where r.id = request_id and r.customer_user_id = (select auth.uid()))
  or exists (select 1 from public.safemy_protection_requests r join public.safemy_personnel p on p.id = r.assigned_personnel_id where r.id = request_id and p.user_id = (select auth.uid()))
);

drop policy if exists "participants write reviews" on public.safemy_assignment_reviews;
create policy "participants write reviews" on public.safemy_assignment_reviews for insert to authenticated with check (
  reviewer_user_id = (select auth.uid()) and (
    (reviewer_type = 'customer' and exists (select 1 from public.safemy_protection_requests r where r.id = request_id and r.customer_user_id = (select auth.uid()) and r.status = 'completed'))
    or (reviewer_type = 'personnel' and exists (select 1 from public.safemy_protection_requests r join public.safemy_personnel p on p.id = r.assigned_personnel_id where r.id = request_id and r.status = 'completed' and p.user_id = (select auth.uid())))
  )
);

create table if not exists public.safemy_public_provider_profiles (
  provider_application_id bigint primary key references public.safemy_provider_applications(id) on delete cascade,
  agency_name text not null,
  registration_number text not null,
  kdn_licence_number text not null,
  services_offered text not null default '',
  coverage_areas text not null default '',
  verification_date date not null default current_date,
  kdn_check_url text not null default 'https://esims.moha.gov.my/semakan/main/search',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.safemy_public_provider_profiles enable row level security;
grant select on public.safemy_public_provider_profiles to anon, authenticated;
grant insert, update, delete on public.safemy_public_provider_profiles to authenticated;

drop policy if exists "public register reads published profiles" on public.safemy_public_provider_profiles;
create policy "public register reads published profiles" on public.safemy_public_provider_profiles for select using (published = true);
drop policy if exists "admins manage public profiles" on public.safemy_public_provider_profiles;
create policy "admins manage public profiles" on public.safemy_public_provider_profiles for all to authenticated using (public.safemy_is_admin()) with check (public.safemy_is_admin());

create table if not exists public.safemy_support_cases (
  id bigint generated always as identity primary key,
  reference text not null unique,
  customer_user_id uuid references auth.users(id) on delete set null,
  booking_reference text not null default '',
  contact_email text not null default '',
  category text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.safemy_support_cases enable row level security;
grant insert on public.safemy_support_cases to anon, authenticated;
grant select, update on public.safemy_support_cases to authenticated;

drop policy if exists "anyone can open support case" on public.safemy_support_cases;
create policy "anyone can open support case" on public.safemy_support_cases for insert to anon, authenticated with check (true);
drop policy if exists "customers read own support cases" on public.safemy_support_cases;
create policy "customers read own support cases" on public.safemy_support_cases for select to authenticated using (public.safemy_is_admin() or customer_user_id = (select auth.uid()));
drop policy if exists "admins update support cases" on public.safemy_support_cases;
create policy "admins update support cases" on public.safemy_support_cases for update to authenticated using (public.safemy_is_admin()) with check (public.safemy_is_admin());

-- The original migration created the tracking snapshot before quote and
-- milestone columns existed. Rebuild it here so the private token view is
-- still the single source of truth for the customer, agency and personnel.
create or replace function public.safemy_tracking_snapshot(p_token_hash text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'job', jsonb_build_object(
      'id', request_row.id,
      'reference', request_row.reference,
      'service_type', request_row.service_type,
      'location', request_row.location,
      'status', request_row.status,
      'assigned_agency_name', request_row.assigned_agency_name,
      'assigned_personnel_name', request_row.assigned_personnel_name,
      'tracking_enabled', request_row.tracking_enabled,
      'tracking_started_at', request_row.tracking_started_at,
      'tracking_ended_at', request_row.tracking_ended_at,
      'start_date', request_row.start_date,
      'start_time', request_row.start_time,
      'quote_status', request_row.quote_status,
      'quote_currency', request_row.quote_currency,
      'quote_amount', request_row.quote_amount,
      'quote_breakdown', request_row.quote_breakdown,
      'quote_issued_at', request_row.quote_issued_at,
      'quote_expires_at', request_row.quote_expires_at,
      'reviewed_at', request_row.reviewed_at,
      'accepted_at', request_row.accepted_at,
      'assigned_at', request_row.assigned_at,
      'completed_at', request_row.completed_at,
      'declined_at', request_row.declined_at,
      'cancelled_at', request_row.cancelled_at
    ),
    'locations', coalesce((select jsonb_agg(jsonb_build_object(
      'actor_type', location_row.actor_type,
      'lat', location_row.lat,
      'lng', location_row.lng,
      'accuracy_m', location_row.accuracy_m,
      'battery_percent', location_row.battery_percent,
      'heading_deg', location_row.heading_deg,
      'speed_mps', location_row.speed_mps,
      'updated_at', location_row.updated_at
    )) from public.safemy_job_locations location_row where location_row.request_id = request_row.id), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object(
      'event_type', event_row.event_type,
      'label', event_row.label,
      'metadata', event_row.metadata,
      'created_at', event_row.created_at
    ) order by event_row.created_at) from public.safemy_booking_events event_row where event_row.request_id = request_row.id), '[]'::jsonb)
  )
  from public.safemy_protection_requests request_row
  where request_row.tracking_token_hash = p_token_hash
  limit 1;
$$;

revoke all on function public.safemy_tracking_snapshot(text) from public;
grant execute on function public.safemy_tracking_snapshot(text) to anon;

-- Personnel location sharing was referenced by the app but was not present in
-- the original migration. This function keeps the assignment and user checks
-- inside Postgres and accepts optional device telemetry for the live map.
create or replace function public.safemy_personnel_self_update_location(
  p_request_id bigint,
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m numeric,
  p_battery_percent numeric default null,
  p_heading_deg numeric default null,
  p_speed_mps numeric default null
)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare matched_personnel_id bigint;
begin
  select p.id into matched_personnel_id
  from public.safemy_protection_requests r
  join public.safemy_personnel p on p.id = r.assigned_personnel_id
  where r.id = p_request_id and r.tracking_enabled and r.status in ('accepted', 'in_progress') and p.user_id = (select auth.uid());
  if matched_personnel_id is null then return false; end if;
  insert into public.safemy_job_locations (request_id, actor_type, personnel_id, lat, lng, accuracy_m, battery_percent, heading_deg, speed_mps, updated_at)
  values (p_request_id, 'personnel', matched_personnel_id, p_lat, p_lng, p_accuracy_m, p_battery_percent, p_heading_deg, p_speed_mps, now())
  on conflict (request_id, actor_type) do update set personnel_id = excluded.personnel_id, lat = excluded.lat, lng = excluded.lng, accuracy_m = excluded.accuracy_m, battery_percent = excluded.battery_percent, heading_deg = excluded.heading_deg, speed_mps = excluded.speed_mps, updated_at = excluded.updated_at;
  update public.safemy_personnel set last_lat = p_lat, last_lng = p_lng, location_updated_at = now(), updated_at = now() where id = matched_personnel_id;
  return true;
end;
$$;

revoke all on function public.safemy_personnel_self_update_location(bigint, double precision, double precision, numeric, numeric, numeric, numeric) from public;
grant execute on function public.safemy_personnel_self_update_location(bigint, double precision, double precision, numeric, numeric, numeric, numeric) to authenticated;
