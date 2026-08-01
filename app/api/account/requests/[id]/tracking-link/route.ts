import { createSupabaseServerClient } from "../../../../../../db/supabase-server";
import { hashTrackingToken, makeTrackingToken } from "../../../../../../db/matching";

// Mints a fresh private tracking link for a request the logged-in customer
// owns. Regenerating invalidates any link they'd previously shared — the raw
// token is never stored server-side, only its hash, so this is the only way
// to get a usable link back if the original was lost.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const token = makeTrackingToken();
  const tokenHash = await hashTrackingToken(token);
  const { data: updated, error } = await supabase.rpc("safemy_customer_set_tracking_token", {
    p_request_id: Number(id),
    p_token_hash: tokenHash,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!updated) return Response.json({ error: "Request not found or not yours" }, { status: 404 });

  return Response.json({ token });
}
