import { requireAgency } from "../../../../../../db/require-agency";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, agency } = await requireAgency();
  if (!agency || agency.status !== "approved") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const lat = Number(payload.lat);
  const lng = Number(payload.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  // RLS also restricts this update to rows assigned to this agency; the
  // .eq() filter here just avoids a confusing silent "0 rows" success.
  const { error, count } = await supabase
    .from("safemy_protection_requests")
    .update({ live_lat: lat, live_lng: lng, live_updated_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", id)
    .eq("assigned_agency_id", agency.id)
    .in("status", ["accepted", "in_progress"]);

  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!count) return Response.json({ error: "Job not found, not assigned to you, or not active" }, { status: 404 });

  return Response.json({ ok: true });
}

// Explicit "stop sharing" — clears the position rather than just letting it
// go silently stale, so the customer's tracking view can say "sharing
// stopped" instead of showing an old pin with no explanation.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, agency } = await requireAgency();
  if (!agency || agency.status !== "approved") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("safemy_protection_requests")
    .update({ live_lat: null, live_lng: null, live_updated_at: null })
    .eq("id", id)
    .eq("assigned_agency_id", agency.id);

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
