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
        <p>Use the route that matches what you need. SafeMY is still an early-access pilot and does not yet publish staffed general-support contacts.</p>
      </section>

      <section className="shell doc-page">
        <EmergencyBanner />

        <div className="verify-grid">
          <div className="verify-card">
            <h3>Need protection services?</h3>
            <p>Submit a quote request and the pilot team will follow up through the contact details you provide.</p>
            <Link href="/request">Request a quote →</Link>
          </div>
          <div className="verify-card">
            <h3>Run a licensed security agency?</h3>
            <p>Apply with your SSM and KDN details for manual review.</p>
            <Link href="/providers/apply">Register as a provider →</Link>
          </div>
          <div className="verify-card">
            <h3>Business or partnership enquiry?</h3>
            <p>Tell us about your organisation and the pilot you want to explore.</p>
            <Link href="/business">Contact SafeMY for Business →</Link>
          </div>
        </div>

        <h2>Public launch disclosure</h2>
        <div className="honesty-note">
          SafeMY is not accepting platform payments during this pilot. A paid public launch is blocked until the registered legal entity name, SSM number, Malaysian address, staffed support email, staffed support phone and payment entity are published here and in the applicable customer terms.
        </div>
        <p>Those details are not available in the current project records, so they have not been guessed or replaced with non-working contact information.</p>

        <h2>Service-provider responsibility</h2>
        <p>SafeMY is the booking, verification and assignment layer. An accepted protection service is delivered by the independently operated licensed security agency named in the confirmed assignment—not by SafeMY itself.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
