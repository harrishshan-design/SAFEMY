import { createSupabaseServiceClient } from "../../../../db/supabase-service";
import { notify } from "../../../../db/notify";

// Called on a schedule (see vercel.json) to move accepted jobs into
// "in_progress" once their start time arrives, and into "completed" once
// their end time passes — the only automation that doesn't need a human to
// click anything. Guarded by CRON_SECRET so it can't be triggered publicly.
export async function GET(request: Request) {
  const providedSecret = request.headers.get("authorization")?.replace("Bearer ", "");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();

  const { data: startingNow, error: startError } = await supabase
    .from("safemy_protection_requests")
    .update({ status: "in_progress" })
    .eq("status", "accepted")
    .lte("start_at", nowIso)
    .select("id, reference");
  if (startError) return Response.json({ error: startError.message }, { status: 500 });

  const { data: completingNow, error: completeError } = await supabase
    .from("safemy_protection_requests")
    .update({ status: "completed" })
    .in("status", ["accepted", "in_progress"])
    .lte("end_at", nowIso)
    .select("id, reference, email, service_type");
  if (completeError) return Response.json({ error: completeError.message }, { status: 500 });

  for (const row of completingNow ?? []) {
    await notify({
      to: row.email,
      subject: `Your SafeMY assignment ${row.reference} is complete`,
      body: `Your ${row.service_type} assignment (${row.reference}) has ended. Thanks for using SafeMY — this is an early-access pilot, so we'd welcome any feedback.`,
      category: "request_status_changed",
      relatedTable: "safemy_protection_requests",
      relatedId: row.id,
    });
  }

  return Response.json({
    startedCount: startingNow?.length ?? 0,
    completedCount: completingNow?.length ?? 0,
  });
}
