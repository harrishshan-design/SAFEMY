import { requireAgency } from "../../../../../../db/require-agency";
import { notify } from "../../../../../../db/notify";
import { makeTrackingToken, hashTrackingToken } from "../../../../../../db/matching";

// Re-sends an invite for personnel who haven't claimed their account yet —
// e.g. they lost the original email. Refuses once claimed_at is set, since
// re-inviting a linked account would silently reassign it to someone else.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, agency } = await requireAgency();
  if (!agency || agency.status !== "approved") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: person, error: fetchError } = await supabase
    .from("safemy_personnel")
    .select("id, full_name, role, email, claimed_at")
    .eq("id", id)
    .eq("agency_id", agency.id)
    .single();
  if (fetchError || !person) return Response.json({ error: "Personnel not found" }, { status: 404 });
  if (person.claimed_at) return Response.json({ error: "This personnel has already set up their account" }, { status: 409 });
  if (!person.email) return Response.json({ error: "No email on file for this personnel" }, { status: 400 });

  const inviteToken = makeTrackingToken();
  const inviteTokenHash = await hashTrackingToken(inviteToken);
  const { error: updateError } = await supabase
    .from("safemy_personnel")
    .update({ invite_token_hash: inviteTokenHash, invited_at: new Date().toISOString() })
    .eq("id", id)
    .eq("agency_id", agency.id);
  if (updateError) return Response.json({ error: updateError.message }, { status: 400 });

  const inviteUrl = `${new URL(request.url).origin}/personnel/signup?token=${encodeURIComponent(inviteToken)}`;
  const { sent } = await notify({
    to: person.email,
    subject: `${agency.agency_name} invited you to SafeMY`,
    body: `${agency.agency_name} added you as ${person.role} on SafeMY. Set up your account to see assigned jobs and share your live location during active assignments:\n\n${inviteUrl}\n\nUse this exact email address (${person.email}) when creating your account.`,
    category: "personnel_invited",
    relatedTable: "safemy_personnel",
    relatedId: id,
  });

  return Response.json({ ok: true, invited: sent });
}
