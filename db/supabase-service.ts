import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./supabase-env";

// Service-role client — bypasses row-level security entirely. Used ONLY by
// the cron route (db/../app/api/cron/advance-statuses), which has no logged-in
// user to authorize it via RLS and runs solely on a trusted schedule behind a
// secret header. Never import this into client-facing code or a route a
// browser can reach with user-supplied auth.
export function createSupabaseServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}
