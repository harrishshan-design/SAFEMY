-- Token-gated tracking RPCs let the Next.js server use the publishable key
-- while keeping location tables inaccessible through the public API.
create or replace function public.safemy_tracking_snapshot(p_token_hash text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
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
      'start_time', request_row.start_time
    ),
    'locations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'actor_type', location_row.actor_type,
        'lat', location_row.lat,
        'lng', location_row.lng,
        'accuracy_m', location_row.accuracy_m,
        'updated_at', location_row.updated_at
      ))
      from public.safemy_job_locations as location_row
      where location_row.request_id = request_row.id
    ), '[]'::jsonb)
  )
  from public.safemy_protection_requests as request_row
  where request_row.tracking_token_hash = p_token_hash
  limit 1;
$$;

revoke all on function public.safemy_tracking_snapshot(text) from public;
grant execute on function public.safemy_tracking_snapshot(text) to anon;

create or replace function public.safemy_customer_update_location(
  p_token_hash text,
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m numeric
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  matched_request_id bigint;
begin
  select request_row.id
    into matched_request_id
  from public.safemy_protection_requests as request_row
  where request_row.tracking_token_hash = p_token_hash
    and request_row.tracking_enabled
    and request_row.status in ('accepted', 'in_progress');

  if matched_request_id is null then
    return false;
  end if;

  insert into public.safemy_job_locations (
    request_id, actor_type, lat, lng, accuracy_m, updated_at
  ) values (
    matched_request_id, 'customer', p_lat, p_lng, p_accuracy_m, now()
  )
  on conflict (request_id, actor_type) do update
    set lat = excluded.lat,
        lng = excluded.lng,
        accuracy_m = excluded.accuracy_m,
        updated_at = excluded.updated_at;

  return true;
end;
$$;

revoke all on function public.safemy_customer_update_location(text, double precision, double precision, numeric) from public;
grant execute on function public.safemy_customer_update_location(text, double precision, double precision, numeric) to anon;

create or replace function public.safemy_agency_update_location(
  p_request_id bigint,
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m numeric
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  matched_personnel_id bigint;
  matched_agency_id bigint;
begin
  select request_row.assigned_personnel_id, request_row.assigned_agency_id
    into matched_personnel_id, matched_agency_id
  from public.safemy_protection_requests as request_row
  join public.safemy_provider_applications as agency_row
    on agency_row.id = request_row.assigned_agency_id
  where request_row.id = p_request_id
    and request_row.tracking_enabled
    and request_row.status in ('accepted', 'in_progress')
    and agency_row.status = 'approved'
    and agency_row.user_id = (select auth.uid());

  if matched_agency_id is null or matched_personnel_id is null then
    return false;
  end if;

  insert into public.safemy_job_locations (
    request_id, actor_type, personnel_id, lat, lng, accuracy_m, updated_at
  ) values (
    p_request_id, 'personnel', matched_personnel_id, p_lat, p_lng, p_accuracy_m, now()
  )
  on conflict (request_id, actor_type) do update
    set personnel_id = excluded.personnel_id,
        lat = excluded.lat,
        lng = excluded.lng,
        accuracy_m = excluded.accuracy_m,
        updated_at = excluded.updated_at;

  update public.safemy_personnel
  set last_lat = p_lat,
      last_lng = p_lng,
      location_updated_at = now(),
      updated_at = now()
  where id = matched_personnel_id
    and agency_id = matched_agency_id;

  return true;
end;
$$;

revoke all on function public.safemy_agency_update_location(bigint, double precision, double precision, numeric) from public;
grant execute on function public.safemy_agency_update_location(bigint, double precision, double precision, numeric) to authenticated;
