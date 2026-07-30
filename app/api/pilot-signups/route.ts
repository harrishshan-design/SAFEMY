import { saveSubmission } from "../../../db/supabase";

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

    const reference = await saveSubmission("safemy_pilot_signups", {
      name,
      email,
      phone,
      interest,
      area,
    });

    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
