import { createSupabaseServerClient } from "./supabase-server";

export async function requirePersonnel() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, personnel: null } as const;

  const { data: personnel } = await supabase
    .from("safemy_personnel")
    .select("id, agency_id, full_name, gender, role, service_types, verified, available")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, personnel } as const;
}
