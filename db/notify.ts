// Email notifications. If RESEND_API_KEY is configured, this actually sends
// the email via Resend's API. If it isn't, the message is still written to
// safemy_email_log (sent=false) instead of silently disappearing — nothing
// claims to have notified anyone when it hasn't.
const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://gbxgqmsnuczblclrplyw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_xs9eBqRtn7it0TmjVQXlyQ_cEFBPFR7";
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const NOTIFY_FROM = process.env.NOTIFY_FROM_EMAIL ?? "SafeMY <onboarding@resend.dev>";
export const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "harrishg.amk@gmail.com";

export type EmailCategory =
  | "new_protection_request"
  | "new_provider_application"
  | "new_business_enquiry"
  | "new_partner_enquiry"
  | "request_status_changed"
  | "provider_status_changed"
  | "agency_assigned"
  | "personnel_invited";

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  category: EmailCategory;
  relatedTable?: string;
  relatedId?: string | number;
}

export async function notify({ to, subject, body, category, relatedTable = "", relatedId = "" }: SendEmailInput) {
  let sent = false;
  let error = "";

  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: NOTIFY_FROM,
          to,
          subject,
          text: body,
        }),
      });
      if (res.ok) {
        sent = true;
      } else {
        error = `Resend API returned ${res.status}: ${(await res.text()).slice(0, 300)}`;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error sending email";
    }
  } else {
    error = "RESEND_API_KEY not configured — queued only, not sent.";
  }

  // Log via the public REST endpoint using the anon key, exactly like the
  // public intake forms do — this file runs in both public API routes
  // (no admin session) and admin-only routes, so it can't depend on RLS
  // policies that require an authenticated admin.
  await fetch(`${SUPABASE_URL}/rest/v1/safemy_email_log`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      to_email: to,
      subject,
      body,
      category,
      related_table: relatedTable,
      related_id: String(relatedId),
      sent,
      error,
    }),
  }).catch(() => {
    // Best-effort logging only — never let a logging failure break the
    // caller's actual request (form submission, status update, etc.).
  });

  return { sent, error };
}
