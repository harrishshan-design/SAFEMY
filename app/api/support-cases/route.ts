import { saveSubmission } from "../../../db/supabase";
import { ADMIN_NOTIFY_EMAIL, notify } from "../../../db/notify";
import { createSupabaseServerClient } from "../../../db/supabase-server";

const CATEGORIES = ["booking_issue", "safety_concern", "billing_question", "provider_concern", "privacy_request", "other"];

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const bookingReference = String(payload.bookingReference ?? "").trim().slice(0, 80);
    const contactEmail = String(payload.contactEmail ?? "").trim().slice(0, 160);
    const category = String(payload.category ?? "other");
    const message = String(payload.message ?? "").trim().slice(0, 4000);
    if (!CATEGORIES.includes(category) || message.length < 10) return Response.json({ error: "Choose a category and include at least 10 characters." }, { status: 400 });
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return Response.json({ error: "Enter a valid email address or leave it blank." }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const reference = await saveSubmission("safemy_support_cases", {
      customer_user_id: user?.id ?? null,
      booking_reference: bookingReference,
      contact_email: contactEmail,
      category,
      message,
    });
    await notify({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `SafeMY support case ${reference}`,
      body: `A new support case was opened.\n\nReference: ${reference}\nBooking: ${bookingReference || "not supplied"}\nCategory: ${category}\nContact: ${contactEmail || "not supplied"}\n\n${message}`,
      category: "support_case_created",
      relatedTable: "safemy_support_cases",
      relatedId: reference,
    });
    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Couldn't open a support case." }, { status: 500 });
  }
}
