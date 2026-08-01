import { requireAgency } from "../../../../../../db/require-agency";
import { createSupabaseServiceClient } from "../../../../../../db/supabase-service";
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

  const service = createSupabaseServiceClient();
  const updatedAt = new Date().toISOString();
  const { error } = await service.from("safemy_job_locations").upsert(
    {
      request_id: job.id,
      actor_type: "personnel",
      personnel_id: job.assigned_personnel_id,
      lat: point.lat,
      lng: point.lng,
      accuracy_m: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
      updated_at: updatedAt,
    },
    { onConflict: "request_id,actor_type" },
  );
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (job.assigned_personnel_id) {
    await service.from("safemy_personnel").update({ last_lat: point.lat, last_lng: point.lng, location_updated_at: updatedAt, updated_at: updatedAt }).eq("id", job.assigned_personnel_id).eq("agency_id", agency.id);
  }

  return Response.json({ ok: true, serverTime: updatedAt });
}
