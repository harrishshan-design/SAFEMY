import { createSupabaseServiceClient } from "../../../../db/supabase-service";
import { hashTrackingToken, validCoordinates } from "../../../../db/matching";

async function findRequest(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const supabase = createSupabaseServiceClient();
  const tokenHash = await hashTrackingToken(token);
  const { data } = await supabase
    .from("safemy_protection_requests")
    .select("id, reference, service_type, location, status, assigned_agency_name, assigned_personnel_id, assigned_personnel_name, tracking_enabled, tracking_started_at, tracking_ended_at, start_date, start_time")
    .eq("tracking_token_hash", tokenHash)
    .single();
  return data ?? null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const job = await findRequest(token);
  if (!job) return Response.json({ error: "Tracking link not found" }, { status: 404 });

  const supabase = createSupabaseServiceClient();
  const { data: locations, error } = await supabase
    .from("safemy_job_locations")
    .select("actor_type, lat, lng, accuracy_m, updated_at")
    .eq("request_id", job.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(
    { job, locations: locations ?? [], serverTime: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}

export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const job = await findRequest(token);
  if (!job) return Response.json({ error: "Tracking link not found" }, { status: 404 });
  if (!job.tracking_enabled || !["accepted", "in_progress"].includes(job.status)) {
    return Response.json({ error: "Live tracking is not active for this assignment" }, { status: 409 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const point = validCoordinates(payload.lat, payload.lng);
  const accuracy = Number(payload.accuracy ?? 0);
  if (!point) return Response.json({ error: "Invalid coordinates" }, { status: 400 });

  const supabase = createSupabaseServiceClient();
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("safemy_job_locations").upsert(
    {
      request_id: job.id,
      actor_type: "customer",
      lat: point.lat,
      lng: point.lng,
      accuracy_m: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
      updated_at: updatedAt,
    },
    { onConflict: "request_id,actor_type" },
  );
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, serverTime: updatedAt });
}
