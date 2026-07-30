import { saveSubmission } from "../../../db/supabase";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const organisationName = String(payload.organisationName ?? "").trim();
    const organisationType = String(payload.organisationType ?? "").trim();
    const contactName = String(payload.contactName ?? "").trim();
    const contactEmail = String(payload.contactEmail ?? "").trim();
    const contactPhone = String(payload.contactPhone ?? "").trim();
    const peopleServed = String(payload.peopleServed ?? "").trim();
    const interest = String(payload.interest ?? "").trim();

    const missing = [
      !organisationName && "organisationName",
      !organisationType && "organisationType",
      !contactName && "contactName",
      !contactEmail && "contactEmail",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const reference = await saveSubmission("safemy_partner_enquiries", {
      organisation_name: organisationName,
      organisation_type: organisationType,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      people_served: peopleServed,
      interest,
    });

    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
