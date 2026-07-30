import { saveSubmission } from "../../../db/supabase";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const agencyName = String(payload.agencyName ?? "").trim();
    const registrationNumber = String(payload.registrationNumber ?? "").trim();
    const kdnLicenceNumber = String(payload.kdnLicenceNumber ?? "").trim();
    const contactName = String(payload.contactName ?? "").trim();
    const contactEmail = String(payload.contactEmail ?? "").trim();
    const contactPhone = String(payload.contactPhone ?? "").trim();
    const servicesOffered = String(payload.servicesOffered ?? "").trim();
    const coverageAreas = String(payload.coverageAreas ?? "").trim();
    const headcount = String(payload.headcount ?? "").trim();

    const missing = [
      !agencyName && "agencyName",
      !registrationNumber && "registrationNumber",
      !kdnLicenceNumber && "kdnLicenceNumber",
      !contactName && "contactName",
      !contactEmail && "contactEmail",
      !contactPhone && "contactPhone",
      !servicesOffered && "servicesOffered",
      !coverageAreas && "coverageAreas",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const reference = await saveSubmission("safemy_provider_applications", {
      agency_name: agencyName,
      registration_number: registrationNumber,
      kdn_licence_number: kdnLicenceNumber,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      services_offered: servicesOffered,
      coverage_areas: coverageAreas,
      headcount,
    });

    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
