import { getDb } from "../../../db";
import { providerApplications } from "../../../db/schema";
import { toRouteErrorMessage } from "../../../db/route-error";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const agencyName = String(payload.agencyName ?? "").trim();
    const registrationNumber = String(payload.registrationNumber ?? "").trim();
    const kdnLicenceNumber = String(payload.kdnLicenceNumber ?? "").trim();
    const contactName = String(payload.contactName ?? "").trim();
    const contactEmail = String(payload.contactEmail ?? "").trim();
    const contactPhone = String(payload.contactPhone ?? "").trim();
    const servicesOffered = String(payload.servicesOffered ?? "").trim();
    const coverageAreas = String(payload.coverageAreas ?? "").trim();
    const headcount = String(payload.headcount ?? "").trim();

    const missing = [
      !agencyName && "agencyName",
      !registrationNumber && "registrationNumber",
      !kdnLicenceNumber && "kdnLicenceNumber",
      !contactName && "contactName",
      !contactEmail && "contactEmail",
      !contactPhone && "contactPhone",
      !servicesOffered && "servicesOffered",
      !coverageAreas && "coverageAreas",
    ].filter(Boolean);

    if (missing.length > 0) {
      return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const db = await getDb();
    const [row] = await db
      .insert(providerApplications)
      .values({
        agencyName,
        registrationNumber,
        kdnLicenceNumber,
        contactName,
        contactEmail,
        contactPhone,
        servicesOffered,
        coverageAreas,
        headcount,
      })
      .returning();

    return Response.json({ application: row }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error, "provider_applications") },
      { status: 500 },
    );
  }
}
