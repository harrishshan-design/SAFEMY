-- Keep anonymous booking submission available while removing unnecessary
-- direct table privileges. Customer tracking is served by token-protected API
-- routes and personnel data is available only to authenticated agencies.
revoke all on public.safemy_personnel from anon;
revoke delete, references, trigger, truncate on public.safemy_personnel from authenticated;
grant select, insert, update on public.safemy_personnel to authenticated;

revoke all on public.safemy_protection_requests from anon;
grant insert on public.safemy_protection_requests to anon;
revoke all on public.safemy_protection_requests from authenticated;
grant select, update on public.safemy_protection_requests to authenticated;

drop policy if exists "admins read protection_requests" on public.safemy_protection_requests;
create policy "admins read protection_requests"
  on public.safemy_protection_requests
  for select
  to authenticated
  using (public.safemy_is_admin());

drop policy if exists "admins update protection_requests" on public.safemy_protection_requests;
create policy "admins update protection_requests"
  on public.safemy_protection_requests
  for update
  to authenticated
  using (public.safemy_is_admin())
  with check (public.safemy_is_admin());

drop policy if exists "agency reads assigned requests" on public.safemy_protection_requests;
create policy "agency reads assigned requests"
  on public.safemy_protection_requests
  for select
  to authenticated
  using (
    assigned_agency_id in (
      select id
      from public.safemy_provider_applications
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "agency responds to assigned requests" on public.safemy_protection_requests;
create policy "agency responds to assigned requests"
  on public.safemy_protection_requests
  for update
  to authenticated
  using (
    assigned_agency_id in (
      select id
      from public.safemy_provider_applications
      where user_id = (select auth.uid())
    )
  )
  with check (
    assigned_agency_id in (
      select id
      from public.safemy_provider_applications
      where user_id = (select auth.uid())
    )
  );

create index if not exists safemy_protection_requests_assigned_agency_idx
  on public.safemy_protection_requests (assigned_agency_id)
  where assigned_agency_id is not null;
