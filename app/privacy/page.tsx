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
        <p>To operate the Klang Valley pilot, SafeMY collects the personal data you submit for a protection request, including your name, phone number, email address, service type, location, date, and time. The free Safe Journey tool keeps trusted-person details and location snapshots in your browser and does not upload them to SafeMY. During an accepted protection assignment, SafeMY collects precise location only while a participant has enabled assignment tracking. Provider applications include agency registration, licence, identity, and credential information for verification.</p>

        <h2>Why we collect it</h2>
        <p>We use submitted data to process protection requests, match them with a licensed partner agency, operate accepted assignments, verify provider eligibility, and respond to enquiries. This is processing for a commercial transaction under Malaysia&apos;s Personal Data Protection Act 2010 (PDPA), and we handle it accordingly.</p>

        <h2>Who sees your data</h2>
        <p>SafeMY cannot see the trusted people or location snapshots in your free Safe Journey. People receive those details only when you choose to send a message. Once a protection request is accepted, the assigned licensed agency and personnel can access the job data needed for that assignment. Authorised SafeMY staff can access submitted data to review, operate, and support the pilot. We do not sell personal data to third parties.</p>

        <h2>Location data specifically</h2>
        <p>The free journey feature takes a location snapshot only when you tap and does not provide background or automatic live sharing. Protection-assignment location is opt-in and limited to an active accepted job. See our <a href="/location-data-policy">location data policy</a> for detail.</p>

        <h2>Mapping services</h2>
        <p>We use Google Maps to display locations and open directions. Google processes the map coordinates and related technical information needed to provide that service under the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and <a href="https://maps.google.com/help/terms_maps/">Google Maps Terms</a>. We do not include your name, phone number or email address in Google Maps URLs.</p>

        <h2>How long we keep it</h2>
        <p>SafeMY retains request and assignment records for as long as needed to operate the service, resolve disputes, and meet legal obligations, and is defining fixed retention periods before the pilot expands. SafeMY retains no server copy of free Safe Journey locations or trusted-person details.</p>

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
