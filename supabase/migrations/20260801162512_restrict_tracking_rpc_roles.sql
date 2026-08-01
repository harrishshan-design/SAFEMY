-- Supabase grants new public-schema functions to both API roles through
-- default privileges. Narrow each tracking RPC to its intended caller.
revoke execute on function public.safemy_tracking_snapshot(text) from authenticated;
revoke execute on function public.safemy_customer_update_location(text, double precision, double precision, numeric) from authenticated;
revoke execute on function public.safemy_agency_update_location(bigint, double precision, double precision, numeric) from anon;
