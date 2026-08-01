import { saveSubmission } from "../../../db/supabase";
import { notify, ADMIN_NOTIFY_EMAIL } from "../../../db/notify";
import { hashTrackingToken, makeTrackingToken, validCoordinates } from "../../../db/matching";
import { createSupabaseServerClient } from "../../../db/supabase-server";

const VALID_GENDERS = ["female", "male", "non_binary", "prefer_not_to_say"];
const VALID_GENDER_PREFERENCES = ["same_gender", "female", "male", "no_preference"];

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
    const customerGender = String(payload.customerGender ?? "prefer_not_to_say");
    const personnelGenderPreference = String(payload.personnelGenderPreference ?? "same_gender");
    const pickup = validCoordinates(payload.pickupLat, payload.pickupLng);
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
      !VALID_GENDERS.includes(customerGender) && "customerGender",
      !VALID_GENDER_PREFERENCES.includes(personnelGenderPreference) && "personnelGenderPreference",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing or invalid: ${missing.join(", ")}` }, { status: 400 });
    }

    // Server-verified session lookup — never trust a client-supplied
    // customer id, or anyone could claim ownership of someone else's request.
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const trackingToken = makeTrackingToken();
    const trackingTokenHash = await hashTrackingToken(trackingToken);
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
      customer_gender: customerGender,
      personnel_gender_preference: personnelGenderPreference,
      pickup_lat: pickup?.lat ?? null,
      pickup_lng: pickup?.lng ?? null,
      tracking_token_hash: trackingTokenHash,
      customer_user_id: user?.id ?? null,
      notes,
    });

    await notify({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New protection request: ${reference}`,
      body: `${name} (${phone}, ${email}) requested ${serviceType} at ${location} on ${startDate} ${startTime} for ${durationHours}h, ${professionalsCount} professional(s).\n\nCustomer gender: ${customerGender}\nPersonnel preference: ${personnelGenderPreference}\nPickup GPS: ${pickup ? "provided" : "not provided"}\nNotes: ${notes || "(none)"}\n\nReview in the admin dashboard.`,
      category: "new_protection_request",
      relatedTable: "safemy_protection_requests",
      relatedId: reference,
    });

    return Response.json({ reference, trackingToken }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
