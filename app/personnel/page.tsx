import Link from "next/link";
import { requirePersonnel } from "../../db/require-personnel";
import { PersonnelDashboard } from "./PersonnelDashboard";

export const dynamic = "force-dynamic";

export default async function PersonnelPage() {
  const { user, personnel } = await requirePersonnel();

  if (!user) {
    return (
      <main className="shell admin-denied">
        <h1>Not signed in</h1>
        <p><Link href="/personnel/login">Sign in</Link> to continue.</p>
      </main>
    );
  }

  if (!personnel) {
    return (
      <main className="shell admin-denied">
        <h1>No personnel profile linked</h1>
        <p>{user.email} is signed in, but isn&apos;t linked to a personnel profile. Ask your agency to invite you from their partner portal, then use the link in that email to link this account.</p>
      </main>
    );
  }

  return <PersonnelDashboard personnelId={personnel.id} fullName={personnel.full_name} />;
}
