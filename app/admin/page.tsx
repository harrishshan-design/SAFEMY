import { getChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { SUPABASE_DASHBOARD_URL } from "../../db/supabase";

export const dynamic = "force-dynamic";

// Server-side allowlist. Identity headers only exist on the workspace
// deployment; on other hosts (e.g. Vercel) this page degrades to an
// informational panel and never exposes submissions.
const ADMIN_EMAILS = ["harrishg.amk@gmail.com"];

export default async function AdminPage() {
  const user = await getChatGPTUser();

  if (!user) {
    return (
      <main className="shell admin-page">
        <span className="kicker">SAFEMY ADMIN · INTERNAL</span>
        <h1>Admin access</h1>
        <p className="form-note" style={{ maxWidth: 560 }}>
          Sign-in for this page is only available on the SafeMY workspace
          deployment. Submissions are reviewed in the Supabase dashboard
          (safemy_* tables), which requires its own login. Nothing is shown
          here without authentication.
        </p>
      </main>
    );
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return (
      <main className="shell admin-denied">
        <h1>Not authorized</h1>
        <p>{user.email} is signed in but is not on the SafeMY admin allowlist.</p>
        <a href={chatGPTSignOutPath("/")}>Sign out</a>
      </main>
    );
  }

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY ADMIN · INTERNAL</span><h1>Submissions</h1></div>
        <div><span>{user.displayName}</span><a href={chatGPTSignOutPath("/admin")}>Sign out</a></div>
      </div>
      <p className="form-note" style={{ maxWidth: 620 }}>
        Intake submissions are stored in Supabase with insert-only public
        access — reviewing them requires the Supabase dashboard login. Open the
        table editor below and work through the safemy_* tables:
        protection requests, pilot signups, provider applications and business
        enquiries. Reviewing and assigning requests to a licensed partner
        agency is a manual step — nothing auto-dispatches anyone.
      </p>
      <p>
        <a href={SUPABASE_DASHBOARD_URL} target="_blank" rel="noreferrer">
          Open the Supabase table editor →
        </a>
      </p>
    </main>
  );
}
