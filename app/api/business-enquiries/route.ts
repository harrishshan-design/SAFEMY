import { saveSubmission } from "../../../db/supabase";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const companyName = String(payload.companyName ?? "").trim();
    const contactName = String(payload.contactName ?? "").trim();
    const contactEmail = String(payload.contactEmail ?? "").trim();
    const contactPhone = String(payload.contactPhone ?? "").trim();
    const teamSize = String(payload.teamSize ?? "").trim();
    const message = String(payload.message ?? "").trim();

    const missing = [
      !companyName && "companyName",
      !contactName && "contactName",
      !contactEmail && "contactEmail",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const reference = await saveSubmission("safemy_business_enquiries", {
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      team_size: teamSize,
      message,
    });

    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
