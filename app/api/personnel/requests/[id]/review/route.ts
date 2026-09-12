import { requirePersonnel } from "../../../../../../db/require-personnel";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, personnel } = await requirePersonnel();
  if (!user || !personnel) return Response.json({ error: "Sign in required" }, { status: 401 });
  const payload = await request.json() as Record<string, unknown>;
  const rating = Number(payload.rating ?? 0);
  const comment = String(payload.comment ?? "").trim().slice(0, 500);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  const { data: job } = await supabase.from("safemy_protection_requests").select("id, status, assigned_personnel_id").eq("id", id).eq("assigned_personnel_id", personnel.id).single();
  if (!job || job.status !== "completed") return Response.json({ error: "Only completed jobs can be reviewed" }, { status: 409 });
  const { error } = await supabase.from("safemy_assignment_reviews").insert({ request_id: Number(id), reviewer_type: "personnel", reviewer_user_id: user.id, rating, comment });
  if (error) return Response.json({ error: error.code === "23505" ? "This job has already been reviewed" : error.message }, { status: 400 });
  return Response.json({ ok: true });
}
