import { requireAdmin } from "../../../../../db/require-admin";
import { notify } from "../../../../../db/notify";

const VALID_STATUSES = ["pending_review", "approved", "rejected", "suspended"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireAdmin();
  if (!profile) return Response.json({ error: "Not authorized" }, { status: 403 });

  const payload = (await request.json()) as Record<string, unknown>;
  const status = String(payload.status ?? "");
  const statusNote = String(payload.statusNote ?? "");
  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("safemy_provider_applications")
    .update({ status, status_note: statusNote })
    .eq("id", id)
    .select("reference, agency_name, contact_email")
    .single();
  if (error || !data) return Response.json({ error: error?.message ?? "Update failed" }, { status: 400 });

  const statusCopy: Record<string, string> = {
    approved: "has been approved. You can now sign in to the partner portal to see jobs assigned to you.",
    rejected: "was not approved" + (statusNote ? `: ${statusNote}` : "."),
    suspended: "has been suspended" + (statusNote ? `: ${statusNote}` : "."),
    pending_review: "is back under review.",
  };

  await notify({
    to: data.contact_email,
    subject: `Your SafeMY partner application ${data.reference}`,
    body: `Your application for ${data.agency_name} (reference ${data.reference}) ${statusCopy[status] ?? `is now: ${status}`}`,
    category: "provider_status_changed",
    relatedTable: "safemy_provider_applications",
    relatedId: id,
  });

  return Response.json({ ok: true });
}
