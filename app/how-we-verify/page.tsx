import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

const checks = [
  { title: "Agency name & company registration", detail: "We confirm the agency is a legitimate, currently registered company with the Companies Commission of Malaysia (SSM)." },
  { title: "Active KDN licence status", detail: "We confirm the agency holds a current licence under the Private Agencies Act 1971, issued by the Ministry of Home Affairs (KDN), and check it isn't lapsed or suspended." },
  { title: "Personnel identity checks", detail: "We confirm the identity of personnel the agency puts forward for assignments against government-issued ID." },
  { title: "Training and credential checks", detail: "We review the training and certifications the agency states its personnel hold, relevant to the services they offer." },
  { title: "Insurance status", detail: "We confirm the agency carries appropriate insurance for its personnel and operations." },
  { title: "Complaint and suspension process", detail: "We keep a record of substantiated complaints against an agency and can suspend or remove access to the platform if licensing lapses or standards aren't met." },
];

export default function HowWeVerifyPage() {
  return (
    <main>
      <SiteNav />
      <section className="form-hero shell">
        <span className="kicker">TRUST &amp; SAFETY</span>
        <h1>How we verify providers.</h1>
        <p>Malaysia&apos;s private security industry is regulated under the Private Agencies Act 1971. SafeMY onboards licensed agencies — not independent individuals — and every partner agency goes through the checks below before it appears as verified to customers.</p>
      </section>

      <section className="shell doc-page">
        <p className="form-note">As we build out the Klang Valley pilot, no agency is shown as verified on SafeMY until it has completed every check below. If you don&apos;t see a specific number of verified partners elsewhere on this site, that&apos;s because we haven&apos;t published one — we&apos;ll only claim coverage we can back up.</p>

        <h2>Public partner register</h2>
        <div className="honesty-note"><b>No approved agency profile has been published publicly yet.</b><br />Every public profile must show the registered agency name, SSM number, KDN licence number, coverage, services, last SafeMY verification date and a link to the official government check. A generic “verified” badge is not enough.</div>
        <p><a href="https://esims.moha.gov.my/semakan/main/search" target="_blank" rel="noreferrer">Open the official KDN eSIMS public licence search ↗</a></p>

        <div className="verify-grid">
          {checks.map((c) => (
            <div key={c.title} className="verify-card">
              <h3>{c.title}</h3>
              <p>{c.detail}</p>
            </div>
          ))}
        </div>

        <h2>Are you a licensed agency?</h2>
        <p><Link href="/providers/apply">Apply to become a SafeMY partner →</Link> Read our <Link href="/provider-terms">provider terms</Link> first.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
