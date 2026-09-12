import { requireAgency } from "../../../../../db/require-agency";
import { notify } from "../../../../../db/notify";
import { rankPersonnel, type PersonnelGenderPreference, type SafeMyGender } from "../../../../../db/matching";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, agency } = await requireAgency();
  if (!agency || agency.status !== "approved") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const action = String(payload.action ?? "");
  if (action !== "accept" && action !== "decline" && action !== "issue_quote") {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }
  const { data: currentJob, error: jobError } = await supabase
    .from("safemy_protection_requests")
    .select("id, reference, email, service_type, customer_gender, personnel_gender_preference, pickup_lat, pickup_lng, duration_hours, professionals_count")
    .eq("id", id)
    .eq("assigned_agency_id", agency.id)
    .single();
  if (jobError || !currentJob) return Response.json({ error: jobError?.message ?? "Request not found" }, { status: 404 });

  if (action === "issue_quote") {
    const amount = Number(payload.amount ?? 0);
    const breakdown = Array.isArray(payload.breakdown)
      ? payload.breakdown.map((item) => String(item).trim()).filter(Boolean).slice(0, 12)
      : [];
    if (!Number.isFinite(amount) || amount < 0 || breakdown.length === 0) return Response.json({ error: "Add a valid quote amount and at least one breakdown line." }, { status: 400 });
    const expiresAt = String(payload.expiresAt ?? "").trim() || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from("safemy_protection_requests").update({
      quote_status: "issued", quote_currency: "MYR", quote_amount: amount,
      quote_breakdown: breakdown, quote_issued_at: new Date().toISOString(), quote_expires_at: expiresAt,
    }).eq("id", id).eq("assigned_agency_id", agency.id).select("reference, email, service_type").single();
    if (error || !data) return Response.json({ error: error?.message ?? "Could not issue quote" }, { status: 400 });
    await supabase.from("safemy_booking_events").insert({
      request_id: Number(id), actor_type: "agency", actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      event_type: "quote_issued", label: `Quote issued: MYR ${amount.toFixed(2)}`,
      metadata: { amount, currency: "MYR", breakdown, expires_at: expiresAt },
    });
    await notify({ to: data.email, subject: `Your SafeMY quote is ready: ${data.reference}`, body: `${agency.agency_name} issued a MYR ${amount.toFixed(2)} quote for ${data.service_type} (${data.reference}). Review the transparent breakdown in your private tracking link.`, category: "request_status_changed", relatedTable: "safemy_protection_requests", relatedId: id });
    return Response.json({ ok: true, quoteAmount: amount });
  }

  let matchedPersonnel: { id: number; full_name: string; distance_km: number | null; gender_priority: boolean } | null = null;
  if (action === "accept") {
    const { data: roster, error: rosterError } = await supabase
      .from("safemy_personnel")
      .select("id, full_name, gender, rating, service_types, last_lat, last_lng")
      .eq("agency_id", agency.id)
      .eq("verified", true)
      .eq("available", true);
    if (rosterError) return Response.json({ error: rosterError.message }, { status: 400 });

    const eligible = (roster ?? []).filter((personnel) => personnel.service_types.includes(currentJob.service_type));
    const pickup = currentJob.pickup_lat !== null && currentJob.pickup_lng !== null
      ? { lat: Number(currentJob.pickup_lat), lng: Number(currentJob.pickup_lng) }
      : null;
    const ranked = rankPersonnel(
      eligible.map((personnel) => ({ ...personnel, rating: Number(personnel.rating) })),
      currentJob.customer_gender as SafeMyGender,
      currentJob.personnel_gender_preference as PersonnelGenderPreference,
      pickup,
    );
    matchedPersonnel = ranked[0] ?? null;
    if (!matchedPersonnel) {
      return Response.json({ error: `No verified available personnel in your roster currently offer ${currentJob.service_type}. Add or update personnel before accepting this job.` }, { status: 409 });
    }
  }

  const now = new Date().toISOString();
  const update = action === "accept"
    ? {
        status: "accepted",
        assigned_personnel_id: matchedPersonnel?.id ?? null,
        assigned_personnel_name: matchedPersonnel?.full_name ?? "",
        tracking_enabled: true,
        tracking_started_at: now,
        tracking_ended_at: null,
        accepted_at: now,
        assigned_at: now,
      }
    : { status: "declined", tracking_enabled: false, tracking_ended_at: now, declined_at: now };

  // RLS also enforces that an agency can update only requests assigned to it.
  const { data, error } = await supabase
    .from("safemy_protection_requests")
    .update(update)
    .eq("id", id)
    .eq("assigned_agency_id", agency.id)
    .select("reference, email, service_type")
    .single();

  if (error || !data) return Response.json({ error: error?.message ?? "Update failed" }, { status: 400 });

  await supabase.from("safemy_booking_events").insert({
    request_id: Number(id), actor_type: "agency", actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
    event_type: action === "accept" ? "accepted" : "declined",
    label: action === "accept" ? `Accepted by ${agency.agency_name}` : `Declined by ${agency.agency_name}`,
    metadata: matchedPersonnel ? { personnel_id: matchedPersonnel.id, personnel_name: matchedPersonnel.full_name } : {},
  });

  await notify({
    to: data.email,
    subject: `Your SafeMY request ${data.reference}: agency ${action === "accept" ? "confirmed" : "declined"}`,
    body:
      action === "accept"
        ? `${agency.agency_name} has confirmed your ${data.service_type} request (${data.reference}).${matchedPersonnel ? ` ${matchedPersonnel.full_name} was prioritised using your gender preference and nearest available live location.` : " The agency will confirm the assigned personnel shortly."} Open the private tracking link you received when submitting your request; it is now active.`
        : `${agency.agency_name} was unable to take your ${data.service_type} request (${data.reference}). Our team will find another agency and follow up.`,
    category: "request_status_changed",
    relatedTable: "safemy_protection_requests",
    relatedId: id,
  });

  return Response.json({ ok: true, matchedPersonnel });
}
