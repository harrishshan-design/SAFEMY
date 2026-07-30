import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-env";

// A plain (non-cookie) Supabase client for one-off server-side auth calls
// (e.g. signing up a new agency account) where no browser session needs to
// be persisted. Uses the same publishable key as everything else — access
// control comes from Postgres RLS, not this key.
export function createSupabaseAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
}
