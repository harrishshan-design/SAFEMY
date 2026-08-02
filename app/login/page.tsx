import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

export default function LoginChooserPage() {
  return (
    <main>
      <SiteNav />
      <section className="form-hero shell">
        <span className="kicker">SAFEMY SIGN IN</span>
        <h1>Who&apos;s signing in?</h1>
        <p>Choose the right account so we can take you to the correct portal.</p>
      </section>

      <section className="shell form-shell">
        <div className="role-picker">
          <Link href="/account/login" className="role-picker-card">
            <span className="role-picker-avatar">U</span>
            <b>Customer</b>
            <small>Track your requests and manage your account. An account is optional — you can also book without one.</small>
          </Link>
          <Link href="/personnel/login" className="role-picker-card">
            <span className="role-picker-avatar">P</span>
            <b>Personnel</b>
            <small>View jobs your agency assigned to you and share your live location during active jobs.</small>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
