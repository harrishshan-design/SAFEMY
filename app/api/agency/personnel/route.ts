import { requireAgency } from "../../../../db/require-agency";
import { notify } from "../../../../db/notify";
import { makeTrackingToken, hashTrackingToken } from "../../../../db/matching";

const VALID_GENDERS = ["female", "male", "non_binary"];

export async function POST(request: Request) {
  const { supabase, agency } = await requireAgency();
  if (!agency || agency.status !== "approved") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const fullName = String(payload.fullName ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const gender = String(payload.gender ?? "");
  const role = String(payload.role ?? "").trim();
  const serviceType = String(payload.serviceType ?? "").trim();
  const experience = Number(payload.experience ?? 0);

  const missing = [
    !fullName && "fullName",
    !email && "email",
    !VALID_GENDERS.includes(gender) && "gender",
    !role && "role",
    !serviceType && "serviceType",
  ].filter(Boolean);
  if (missing.length > 0) {
    return Response.json({ error: `Missing or invalid: ${missing.join(", ")}` }, { status: 400 });
  }

  const inviteToken = makeTrackingToken();
  const inviteTokenHash = await hashTrackingToken(inviteToken);

  const { data: created, error } = await supabase
    .from("safemy_personnel")
    .insert({
      agency_id: agency.id,
      full_name: fullName,
      email,
      gender,
      role,
      service_types: [serviceType],
      years_experience: Number.isFinite(experience) && experience >= 0 ? experience : 0,
      verified: true,
      available: true,
      invite_token_hash: inviteTokenHash,
      invited_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) return Response.json({ error: error?.message ?? "Could not add personnel" }, { status: 400 });

  const inviteUrl = `${new URL(request.url).origin}/personnel/signup?token=${encodeURIComponent(inviteToken)}`;
  const { sent } = await notify({
    to: email,
    subject: `${agency.agency_name} invited you to SafeMY`,
    body: `${agency.agency_name} added you as ${role} on SafeMY. Set up your account to see assigned jobs and share your live location during active assignments:\n\n${inviteUrl}\n\nUse this exact email address (${email}) when creating your account.`,
    category: "personnel_invited",
    relatedTable: "safemy_personnel",
    relatedId: created.id,
  });

  return Response.json({ ok: true, id: created.id, invited: sent }, { status: 201 });
}
