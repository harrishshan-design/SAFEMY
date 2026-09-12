import { requireAdmin } from "../../../../../db/require-admin";
import { notify } from "../../../../../db/notify";

const VALID_STATUSES = ["pending_review", "assigned", "accepted", "in_progress", "completed", "declined", "cancelled"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireAdmin();
  if (!profile) return Response.json({ error: "Not authorized" }, { status: 403 });

  const payload = (await request.json()) as Record<string, unknown>;
  const action = String(payload.action ?? "");

  if (action === "status") {
    const status = String(payload.status ?? "");
    if (!VALID_STATUSES.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    const trackingEnded = ["completed", "declined", "cancelled"].includes(status);
    const now = new Date().toISOString();
    const milestone = status === "completed" ? { completed_at: now } : status === "declined" ? { declined_at: now } : status === "cancelled" ? { cancelled_at: now } : status === "accepted" ? { accepted_at: now } : status === "assigned" ? { assigned_at: now } : status === "pending_review" ? { reviewed_at: now } : {};
    const { data, error } = await supabase
      .from("safemy_protection_requests")
      .update({
        status,
        ...milestone,
        ...(trackingEnded ? { tracking_enabled: false, tracking_ended_at: new Date().toISOString() } : {}),
      })
      .eq("id", id)
      .select("reference, email, service_type")
      .single();
    if (error || !data) return Response.json({ error: error?.message ?? "Update failed" }, { status: 400 });

    await supabase.from("safemy_booking_events").insert({
      request_id: Number(id), actor_type: "admin", actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      event_type: "status_changed", label: `Status changed to ${status.replace("_", " ")}`,
      metadata: { status },
    });

    await notify({
      to: data.email,
      subject: `Your SafeMY request ${data.reference} is now "${status.replace("_", " ")}"`,
      body: `Your request for ${data.service_type} (reference ${data.reference}) has been updated to: ${status.replace("_", " ")}.\n\nThis is an early-access pilot — reply to this email if you have questions.`,
      category: "request_status_changed",
      relatedTable: "safemy_protection_requests",
      relatedId: id,
    });

    return Response.json({ ok: true });
  }

  if (action === "assign") {
    const agencyId = Number(payload.agencyId ?? 0);
    const agencyName = String(payload.agencyName ?? "").trim();
    if (!agencyId || !agencyName) return Response.json({ error: "Missing agencyId or agencyName" }, { status: 400 });

    const { data: agency } = await supabase
      .from("safemy_provider_applications")
      .select("contact_email")
      .eq("id", agencyId)
      .single();

    const { data, error } = await supabase
      .from("safemy_protection_requests")
      .update({ assigned_agency_id: agencyId, assigned_agency_name: agencyName, status: "assigned" })
      .eq("id", id)
      .select("reference, service_type, location, start_date, start_time")
      .single();
    if (error || !data) return Response.json({ error: error?.message ?? "Assignment failed" }, { status: 400 });

    await supabase.from("safemy_booking_events").insert({
      request_id: Number(id), actor_type: "admin", actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      event_type: "agency_assigned", label: `Assigned to ${agencyName}`,
      metadata: { agency_id: agencyId, agency_name: agencyName },
    });

    if (agency?.contact_email) {
      await notify({
        to: agency.contact_email,
        subject: `New job assigned: ${data.reference}`,
        body: `You've been assigned a ${data.service_type} job at ${data.location} on ${data.start_date} ${data.start_time}.\n\nSign in to the partner portal to accept or decline: https://www.safemy.org/agency`,
        category: "agency_assigned",
        relatedTable: "safemy_protection_requests",
        relatedId: id,
      });
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
