import { createSupabaseAnonClient } from "../../../../db/supabase-anon";
import { hashTrackingToken, validCoordinates } from "../../../../db/matching";

interface TrackingSnapshot {
  job: {
    id: number;
    status: string;
    tracking_enabled: boolean;
  };
  locations: Array<Record<string, unknown>>;
}

async function findSnapshot(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const supabase = createSupabaseAnonClient();
  const tokenHash = await hashTrackingToken(token);
  const { data, error } = await supabase.rpc("safemy_tracking_snapshot", { p_token_hash: tokenHash });
  if (error) throw error;
  return (data as TrackingSnapshot | null) ?? null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const snapshot = await findSnapshot(token);
  if (!snapshot) return Response.json({ error: "Tracking link not found" }, { status: 404 });

  return Response.json(
    { ...snapshot, serverTime: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}

export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const snapshot = await findSnapshot(token);
  if (!snapshot) return Response.json({ error: "Tracking link not found" }, { status: 404 });
  if (!snapshot.job.tracking_enabled || !["accepted", "in_progress"].includes(snapshot.job.status)) {
    return Response.json({ error: "Live tracking is not active for this assignment" }, { status: 409 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const point = validCoordinates(payload.lat, payload.lng);
  const accuracy = Number(payload.accuracy ?? 0);
  if (!point) return Response.json({ error: "Invalid coordinates" }, { status: 400 });

  const supabase = createSupabaseAnonClient();
  const tokenHash = await hashTrackingToken(token);
  const updatedAt = new Date().toISOString();
  const { data: updated, error } = await supabase.rpc("safemy_customer_update_location", {
    p_token_hash: tokenHash,
    p_lat: point.lat,
    p_lng: point.lng,
    p_accuracy_m: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!updated) return Response.json({ error: "Live tracking is no longer active" }, { status: 409 });
  return Response.json({ ok: true, serverTime: updatedAt });
}
