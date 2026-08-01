import { createSupabaseAnonClient } from "../../../db/supabase-anon";

// Requires BOTH the reference and the email on the request, matching
// safemy_track_request's SECURITY DEFINER check — a reference alone (which
// could leak via a shared link) is not enough to look up a job.
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const reference = String(payload.reference ?? "").trim();
    const email = String(payload.email ?? "").trim();

    if (!reference || !email) {
      return Response.json({ error: "Reference and email are required" }, { status: 400 });
    }

    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.rpc("safemy_track_request", {
      p_reference: reference,
      p_email: email,
    });

    if (error) return Response.json({ error: error.message }, { status: 400 });
    if (!data || data.length === 0) {
      return Response.json({ error: "No matching request found. Check your reference and email." }, { status: 404 });
    }

    return Response.json({ request: data[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
