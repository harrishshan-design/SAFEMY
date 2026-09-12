import { requirePersonnel } from "../../../../../../db/require-personnel";
import { validCoordinates } from "../../../../../../db/matching";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, personnel } = await requirePersonnel();
  if (!personnel) return Response.json({ error: "Not authorized" }, { status: 403 });

  const payload = (await request.json()) as Record<string, unknown>;
  const point = validCoordinates(payload.lat, payload.lng);
  const accuracy = Number(payload.accuracy ?? 0);
  const heading = Number(payload.heading);
  const speed = Number(payload.speed);
  const battery = Number(payload.battery);
  if (!point) return Response.json({ error: "Invalid coordinates" }, { status: 400 });

  const { data: updated, error } = await supabase.rpc("safemy_personnel_self_update_location", {
    p_request_id: Number(id),
    p_lat: point.lat,
    p_lng: point.lng,
    p_accuracy_m: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
    p_battery_percent: Number.isFinite(battery) && battery >= 0 && battery <= 100 ? battery : null,
    p_heading_deg: Number.isFinite(heading) && heading >= 0 && heading <= 360 ? heading : null,
    p_speed_mps: Number.isFinite(speed) && speed >= 0 ? speed : null,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!updated) return Response.json({ error: "Live tracking is not active for this assignment" }, { status: 409 });

  return Response.json({ ok: true, serverTime: new Date().toISOString() });
}
