import { requireAdmin } from "../../../../../../db/require-admin";

const TABLES: Record<string, string> = {
  business: "safemy_business_enquiries",
  partner: "safemy_partner_enquiries",
};
const VALID_STATUSES = ["new", "contacted", "closed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> },
) {
  const { table, id } = await params;
  const tableName = TABLES[table];
  if (!tableName) return Response.json({ error: "Unknown table" }, { status: 400 });

  const { supabase, profile } = await requireAdmin();
  if (!profile) return Response.json({ error: "Not authorized" }, { status: 403 });

  const payload = (await request.json()) as Record<string, unknown>;
  const status = String(payload.status ?? "");
  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase.from(tableName).update({ status }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ ok: true });
}
