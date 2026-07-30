import { requireAgency } from "../../../../../db/require-agency";
import { notify } from "../../../../../db/notify";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, agency } = await requireAgency();
  if (!agency || agency.status !== "approved") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const action = String(payload.action ?? "");
  if (action !== "accept" && action !== "decline") {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }
  const status = action === "accept" ? "accepted" : "declined";

  // RLS also enforces this (agencies can only update rows assigned to them),
  // this filter just keeps a mismatched request from producing a confusing
  // "0 rows updated" success response.
  const { data, error } = await supabase
    .from("safemy_protection_requests")
    .update({ status })
    .eq("id", id)
    .eq("assigned_agency_id", agency.id)
    .select("reference, email, service_type")
    .single();

  if (error || !data) return Response.json({ error: error?.message ?? "Update failed" }, { status: 400 });

  await notify({
    to: data.email,
    subject: `Your SafeMY request ${data.reference}: agency ${action === "accept" ? "confirmed" : "declined"}`,
    body:
      action === "accept"
        ? `${agency.agency_name} has confirmed your ${data.service_type} request (${data.reference}).`
        : `${agency.agency_name} was unable to take your ${data.service_type} request (${data.reference}). Our team will find another agency and follow up.`,
    category: "request_status_changed",
    relatedTable: "safemy_protection_requests",
    relatedId: id,
  });

  return Response.json({ ok: true });
}
