import Link from "next/link";
import { createSupabaseServerClient } from "../../db/supabase-server";
import { AccountDashboard } from "./AccountDashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="shell admin-denied">
        <h1>Not signed in</h1>
        <p><Link href="/account/login">Sign in</Link> to see your requests.</p>
      </main>
    );
  }

  return <AccountDashboard email={user.email ?? ""} />;
}
