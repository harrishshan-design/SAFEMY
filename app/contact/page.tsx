import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { EmergencyBanner } from "../components/EmergencyBanner";

export default function ContactPage() {
  return (
    <main>
      <SiteNav />
      <section className="form-hero shell">
        <span className="kicker">CONTACT</span>
        <h1>Contact SafeMY.</h1>
        <p>The fastest way to reach us depends on what you need.</p>
      </section>

      <section className="shell doc-page">
        <EmergencyBanner />

        <div className="verify-grid">
          <div className="verify-card">
            <h3>Need protection services?</h3>
            <p>Submit a request and our team will follow up directly.</p>
            <Link href="/request">Request protection →</Link>
          </div>
          <div className="verify-card">
            <h3>Run a licensed security agency?</h3>
            <p>Apply to become a verified SafeMY partner.</p>
            <Link href="/providers/apply">Register as a provider →</Link>
          </div>
          <div className="verify-card">
            <h3>Business or partnership enquiry?</h3>
            <p>Tell us about your company and what you&apos;re looking for.</p>
            <Link href="/business">Contact SafeMY for Business →</Link>
          </div>
        </div>

        <h2>General enquiries</h2>
        <p>Email: <em>[SafeMY contact email — to be added before public launch]</em><br />Phone: <em>[SafeMY contact number — to be added before public launch]</em></p>

        <h2>Registered company details</h2>
        <p>Company registration number: <em>to be added before public launch</em>.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
