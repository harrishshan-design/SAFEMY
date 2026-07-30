import Link from "next/link";
import { createSupabaseServerClient } from "../../db/supabase-server";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="shell admin-denied">
        <h1>Not signed in</h1>
        <p><Link href="/admin/login">Sign in</Link> to continue.</p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("safemy_admin_profiles")
    .select("email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="shell admin-denied">
        <h1>Not authorized</h1>
        <p>{user.email} is signed in but has no staff invite on file. Ask an existing admin to invite this email, then reload this page.</p>
      </main>
    );
  }

  return <AdminDashboard email={profile.email} role={profile.role} />;
}
