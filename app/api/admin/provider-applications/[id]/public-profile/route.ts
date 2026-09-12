import { requireAdmin } from "../../../../../../db/require-admin";

const KDN_CHECK_URL = "https://esims.moha.gov.my/semakan/main/search";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireAdmin();
  if (!profile) return Response.json({ error: "Not authorized" }, { status: 403 });

  const { data: provider, error: providerError } = await supabase
    .from("safemy_provider_applications")
    .select("id, agency_name, registration_number, kdn_licence_number, services_offered, coverage_areas, status")
    .eq("id", id)
    .single();
  if (providerError || !provider) return Response.json({ error: providerError?.message ?? "Provider not found" }, { status: 404 });
  if (provider.status !== "approved") return Response.json({ error: "Only approved agencies can be published" }, { status: 409 });

  const { error } = await supabase.from("safemy_public_provider_profiles").upsert({
    provider_application_id: provider.id,
    agency_name: provider.agency_name,
    registration_number: provider.registration_number,
    kdn_licence_number: provider.kdn_licence_number,
    services_offered: provider.services_offered,
    coverage_areas: provider.coverage_areas,
    verification_date: new Date().toISOString().slice(0, 10),
    kdn_check_url: KDN_CHECK_URL,
    published: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "provider_application_id" });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireAdmin();
  if (!profile) return Response.json({ error: "Not authorized" }, { status: 403 });
  const { error } = await supabase.from("safemy_public_provider_profiles").update({ published: false }).eq("provider_application_id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
