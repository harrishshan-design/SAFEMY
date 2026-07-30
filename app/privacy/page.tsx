import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { DraftNotice } from "../components/DraftNotice";

export default function PrivacyPage() {
  return (
    <main>
      <SiteNav />
      <section className="shell doc-page">
        <span className="kicker">LEGAL</span>
        <h1>Privacy policy</h1>
        <DraftNotice />

        <h2>What we collect</h2>
        <p>To operate the Klang Valley pilot, SafeMY collects the personal data you provide directly, including your name, phone number, email address, and details of a protection request (service type, location, date and time). If you use live journey sharing or an active protection assignment, we collect precise location data for the duration of that journey or assignment. If you apply as a provider, we collect your agency&apos;s registration and licence details and your personnel&apos;s identity and credential information for verification.</p>

        <h2>Why we collect it</h2>
        <p>We use this data to process protection requests, match them with a licensed partner agency, keep you and your chosen guardians informed during an active journey or assignment, verify provider eligibility, and respond to enquiries. This is processing for a commercial transaction under Malaysia&apos;s Personal Data Protection Act 2010 (PDPA), and we handle it accordingly.</p>

        <h2>Who sees your data</h2>
        <p>Location and assignment data is only shared with the guardians you choose to add and, once a request is accepted, the assigned licensed agency and its personnel for the duration of that job. SafeMY staff can access submitted data to review and process requests. We do not sell personal data to third parties.</p>

        <h2>Location data specifically</h2>
        <p>Live location sharing is opt-in per journey or assignment and stops automatically when that journey or assignment ends, or immediately if you turn it off. See our <a href="/location-data-policy">location data policy</a> for detail.</p>

        <h2>How long we keep it</h2>
        <p>We retain request and assignment records for as long as needed to operate the service, resolve disputes and meet legal obligations, and we are working to define fixed retention periods before public launch. Live location history is retained only briefly after a journey ends unless needed for a safety investigation.</p>

        <h2>Your rights</h2>
        <p>Under the PDPA, you can request access to, or correction of, the personal data we hold about you, and you can withdraw consent for optional processing (such as future marketing) at any time. Contact us via the details on our <a href="/contact">contact page</a> to exercise these rights.</p>

        <h2>Security</h2>
        <p>We restrict access to submitted data to staff who need it to operate the pilot, and we are formalising our security practices (encryption in transit, access controls, incident response) ahead of public launch.</p>

        <h2>Changes to this policy</h2>
        <p>We will update this page as the platform grows past the pilot stage, and note the date of the most recent revision here.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
