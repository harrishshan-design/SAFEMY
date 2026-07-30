import { createSupabaseServerClient } from "./supabase-server";

export async function requireAgency() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, agency: null } as const;

  const { data: agency } = await supabase
    .from("safemy_provider_applications")
    .select("id, reference, agency_name, status, contact_email")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, agency } as const;
}
