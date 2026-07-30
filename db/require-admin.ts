import { createSupabaseServerClient } from "./supabase-server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null } as const;

  const { data: profile } = await supabase
    .from("safemy_admin_profiles")
    .select("email, role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile } as const;
}
