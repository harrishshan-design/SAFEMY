import { createSupabaseAnonClient } from "../../../../db/supabase-anon";

export async function GET() {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("safemy_public_provider_profiles")
    .select("provider_application_id, agency_name, registration_number, kdn_licence_number, services_offered, coverage_areas, verification_date, kdn_check_url")
    .eq("published", true)
    .order("agency_name", { ascending: true });

  if (error) {
    return Response.json({ providers: [], error: "The public register is temporarily unavailable." }, { status: 200 });
  }
  return Response.json({ providers: data ?? [] }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
