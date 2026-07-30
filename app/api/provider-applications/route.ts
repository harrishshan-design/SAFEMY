import { saveSubmission } from "../../../db/supabase";
import { notify, ADMIN_NOTIFY_EMAIL } from "../../../db/notify";
import { createSupabaseAnonClient } from "../../../db/supabase-anon";

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
    const password = String(payload.password ?? "");

    const missing = [
      !agencyName && "agencyName",
      !registrationNumber && "registrationNumber",
      !kdnLicenceNumber && "kdnLicenceNumber",
      !contactName && "contactName",
      !contactEmail && "contactEmail",
      !contactPhone && "contactPhone",
      !servicesOffered && "servicesOffered",
      !coverageAreas && "coverageAreas",
      !(password.length >= 8) && "password",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing or invalid: ${missing.join(", ")}` }, { status: 400 });
    }

    const supabase = createSupabaseAnonClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: contactEmail,
      password,
    });
    if (signUpError || !signUpData.user) {
      return Response.json(
        { error: signUpError?.message ?? "Could not create your account. Please try again." },
        { status: 400 },
      );
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
      user_id: signUpData.user.id,
    });

    await notify({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New provider application: ${agencyName}`,
      body: `${agencyName} (${contactName}, ${contactEmail}, ${contactPhone}) applied to become a partner agency.\n\nSSM: ${registrationNumber}\nKDN licence: ${kdnLicenceNumber}\nServices: ${servicesOffered}\nCoverage: ${coverageAreas}\n\nReview in the admin dashboard.`,
      category: "new_provider_application",
      relatedTable: "safemy_provider_applications",
      relatedId: reference,
    });

    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
