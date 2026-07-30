import { saveSubmission } from "../../../db/supabase";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim();
    const phone = String(payload.phone ?? "").trim();
    const email = String(payload.email ?? "").trim();
    const serviceType = String(payload.serviceType ?? "").trim();
    const location = String(payload.location ?? "").trim();
    const startDate = String(payload.startDate ?? "").trim();
    const startTime = String(payload.startTime ?? "").trim();
    const durationHours = Number(payload.durationHours ?? 0);
    const professionalsCount = Number(payload.professionalsCount ?? 0);
    const notes = String(payload.notes ?? "").trim();

    const missing = [
      !name && "name",
      !phone && "phone",
      !email && "email",
      !serviceType && "serviceType",
      !location && "location",
      !startDate && "startDate",
      !startTime && "startTime",
      !(durationHours > 0) && "durationHours",
      !(professionalsCount > 0) && "professionalsCount",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing or invalid: ${missing.join(", ")}` }, { status: 400 });
    }

    const reference = await saveSubmission("safemy_protection_requests", {
      name,
      phone,
      email,
      service_type: serviceType,
      location,
      start_date: startDate,
      start_time: startTime,
      duration_hours: durationHours,
      professionals_count: professionalsCount,
      notes,
    });

    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
