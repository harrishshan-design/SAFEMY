import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-env";

// Server-side Supabase client for Server Components and Route Handlers.
// Runs with the same publishable key as the public forms — access to
// protected data comes from Postgres row-level security matching the
// logged-in user's session, never from an elevated key.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component that can't set cookies — the
          // middleware below refreshes the session on every request instead.
        }
      },
    },
  });
}
