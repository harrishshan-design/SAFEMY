// SafeMY submission storage — Supabase REST (PostgREST).
//
// The publishable key is safe to ship in source: it identifies the project and
// carries the `anon` role, which row-level security restricts to INSERT-only
// on the safemy_* tables. Reads happen in the Supabase dashboard.
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://gbxgqmsnuczblclrplyw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_xs9eBqRtn7it0TmjVQXlyQ_cEFBPFR7";

export const SUPABASE_DASHBOARD_URL =
  "https://supabase.com/dashboard/project/gbxgqmsnuczblclrplyw/editor";

export type SubmissionTable =
  | "safemy_protection_requests"
  | "safemy_pilot_signups"
  | "safemy_provider_applications"
  | "safemy_business_enquiries";

function makeReference(): string {
  return "SM-" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

// Inserts a row and returns the human-readable reference code. RLS blocks the
// anon role from reading anything back, so we generate the reference ourselves
// rather than asking the database to return the inserted row.
export async function saveSubmission(
  table: SubmissionTable,
  row: Record<string, string | number>,
): Promise<string> {
  const reference = makeReference();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ ...row, reference }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Submission storage failed (${res.status}). Please try again shortly.` +
        (detail ? ` [${detail.slice(0, 200)}]` : ""),
    );
  }

  return reference;
}
