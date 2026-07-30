import Link from "next/link";
import { requireAgency } from "../../db/require-agency";
import { AgencyDashboard } from "./AgencyDashboard";

export const dynamic = "force-dynamic";

export default async function AgencyPage() {
  const { user, agency } = await requireAgency();

  if (!user) {
    return (
      <main className="shell admin-denied">
        <h1>Not signed in</h1>
        <p><Link href="/agency/login">Sign in</Link> to continue.</p>
      </main>
    );
  }

  if (!agency) {
    return (
      <main className="shell admin-denied">
        <h1>No application on file</h1>
        <p>{user.email} is signed in, but we don&apos;t have a provider application linked to this account. <Link href="/providers/apply">Apply as a provider</Link>.</p>
      </main>
    );
  }

  if (agency.status !== "approved") {
    const statusCopy: Record<string, string> = {
      pending_review: "is still pending review. We manually verify your company registration and KDN licence before approving partner accounts — we'll email you once this changes.",
      rejected: "was not approved. Contact us if you believe this is a mistake.",
      suspended: "has been suspended. Contact us for details.",
    };
    return (
      <main className="shell admin-denied">
        <h1>{agency.agency_name}</h1>
        <p>Application reference <b>{agency.reference}</b> {statusCopy[agency.status] ?? `has status: ${agency.status}`}</p>
      </main>
    );
  }

  return <AgencyDashboard agencyId={agency.id} agencyName={agency.agency_name} />;
}
