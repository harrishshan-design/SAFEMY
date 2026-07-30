import { getDb } from "../../../db";
import { businessEnquiries } from "../../../db/schema";
import { toRouteErrorMessage } from "../../../db/route-error";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const companyName = String(payload.companyName ?? "").trim();
    const contactName = String(payload.contactName ?? "").trim();
    const contactEmail = String(payload.contactEmail ?? "").trim();
    const contactPhone = String(payload.contactPhone ?? "").trim();
    const teamSize = String(payload.teamSize ?? "").trim();
    const message = String(payload.message ?? "").trim();

    const missing = [
      !companyName && "companyName",
      !contactName && "contactName",
      !contactEmail && "contactEmail",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const db = await getDb();
    const [row] = await db
      .insert(businessEnquiries)
      .values({ companyName, contactName, contactEmail, contactPhone, teamSize, message })
      .returning();

    return Response.json({ enquiry: row }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error, "business_enquiries") },
      { status: 500 },
    );
  }
}
