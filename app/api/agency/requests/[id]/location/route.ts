import { requireAgency } from "../../../../../../db/require-agency";
import { validCoordinates } from "../../../../../../db/matching";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, agency } = await requireAgency();
  if (!agency || agency.status !== "approved") return Response.json({ error: "Not authorized" }, { status: 403 });

  const { data: job } = await supabase
    .from("safemy_protection_requests")
    .select("id, status, tracking_enabled, assigned_personnel_id")
    .eq("id", id)
    .eq("assigned_agency_id", agency.id)
    .single();
  if (!job) return Response.json({ error: "Assignment not found" }, { status: 404 });
  if (!job.tracking_enabled || !["accepted", "in_progress"].includes(job.status)) {
    return Response.json({ error: "Live tracking is not active" }, { status: 409 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const point = validCoordinates(payload.lat, payload.lng);
  const accuracy = Number(payload.accuracy ?? 0);
  if (!point) return Response.json({ error: "Invalid coordinates" }, { status: 400 });

  const updatedAt = new Date().toISOString();
  const { data: updated, error } = await supabase.rpc("safemy_agency_update_location", {
    p_request_id: job.id,
    p_lat: point.lat,
    p_lng: point.lng,
    p_accuracy_m: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!updated) return Response.json({ error: "Live tracking is no longer active" }, { status: 409 });

  return Response.json({ ok: true, serverTime: updatedAt });
}
