import { getDb } from "../../../db";
import { pilotSignups } from "../../../db/schema";
import { toRouteErrorMessage } from "../../../db/route-error";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim();
    const email = String(payload.email ?? "").trim();
    const phone = String(payload.phone ?? "").trim();
    const interest = String(payload.interest ?? "").trim();
    const area = String(payload.area ?? "").trim();

    const missing = [!name && "name", !email && "email", !interest && "interest"].filter(Boolean);
    if (missing.length > 0) {
      return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const db = await getDb();
    const [row] = await db
      .insert(pilotSignups)
      .values({ name, email, phone, interest, area })
      .returning();

    return Response.json({ signup: row }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error, "pilot_signups") },
      { status: 500 },
    );
  }
}
