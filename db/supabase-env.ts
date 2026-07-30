// Shared Supabase project coordinates. The publishable/anon key is safe to
// ship in source — it's the same key already used in db/supabase.ts. Auth
// operations rely on Postgres row-level security (see the migration in
// db/schema.ts comments), never a service-role key, so no secret credential
// is required here.
export const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://gbxgqmsnuczblclrplyw.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_xs9eBqRtn7it0TmjVQXlyQ_cEFBPFR7";
