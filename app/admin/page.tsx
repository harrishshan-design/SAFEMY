import { desc } from "drizzle-orm";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { getDb } from "../../db";
import { protectionRequests, pilotSignups, providerApplications, businessEnquiries } from "../../db/schema";

export const dynamic = "force-dynamic";

// Server-side allowlist. SIWC only proves identity, not that this person
// should see submitted PII — see README's "Workspace Auth Headers" section.
const ADMIN_EMAILS = ["harrishg.amk@gmail.com"];

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return (
      <main className="shell admin-denied">
        <h1>Not authorized</h1>
        <p>{user.email} is signed in but is not on the SafeMY admin allowlist.</p>
        <a href={chatGPTSignOutPath("/")}>Sign out</a>
      </main>
    );
  }

  const db = await getDb();
  const [requests, pilots, applications, enquiries] = await Promise.all([
    db.select().from(protectionRequests).orderBy(desc(protectionRequests.createdAt)).limit(50),
    db.select().from(pilotSignups).orderBy(desc(pilotSignups.createdAt)).limit(50),
    db.select().from(providerApplications).orderBy(desc(providerApplications.createdAt)).limit(50),
    db.select().from(businessEnquiries).orderBy(desc(businessEnquiries.createdAt)).limit(50),
  ]);

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY ADMIN · INTERNAL</span><h1>Submissions</h1></div>
        <div><span>{user.displayName}</span><a href={chatGPTSignOutPath("/admin")}>Sign out</a></div>
      </div>
      <p className="form-note">Reviewing and assigning requests to a licensed partner agency is a manual step for now — nothing here auto-dispatches anyone.</p>

      <AdminSection title="Protection requests" rows={requests} columns={["id", "createdAt", "status", "name", "phone", "email", "serviceType", "location", "startDate", "startTime", "durationHours", "professionalsCount"]} />
      <AdminSection title="Pilot signups" rows={pilots} columns={["id", "createdAt", "name", "email", "phone", "interest", "area"]} />
      <AdminSection title="Provider applications" rows={applications} columns={["id", "createdAt", "status", "agencyName", "registrationNumber", "kdnLicenceNumber", "contactName", "contactEmail", "contactPhone", "coverageAreas"]} />
      <AdminSection title="Business enquiries" rows={enquiries} columns={["id", "createdAt", "status", "companyName", "contactName", "contactEmail", "teamSize"]} />
    </main>
  );
}

function AdminSection({ title, rows, columns }: { title: string; rows: Record<string, unknown>[]; columns: string[] }) {
  return (
    <section className="admin-section">
      <h2>{title} <span>({rows.length})</span></h2>
      {rows.length === 0 ? (
        <p className="form-note">No submissions yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>{columns.map((c) => <td key={c}>{String(row[c] ?? "")}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
