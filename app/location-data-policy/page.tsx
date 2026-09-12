import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { DraftNotice } from "../components/DraftNotice";

export default function LocationDataPolicyPage() {
  return (
    <main>
      <SiteNav />
      <section className="shell doc-page">
        <span className="kicker">TRUST &amp; SAFETY</span>
        <h1>Location data policy</h1>
        <DraftNotice />

        <h2>When we collect location</h2>
        <p>The free Safe Journey tool reads a location snapshot only after you approve the browser permission. That snapshot stays in the open browser page and is not uploaded to SafeMY. Separately, an accepted protection assignment can send location to SafeMY only while a customer or assigned professional has actively enabled assignment tracking.</p>

        <h2>Who can see it</h2>
        <p>For a free Safe Journey, only people you deliberately message can receive the Google Maps pin; SafeMY cannot see it. During an accepted protection assignment, the participating customer, assigned personnel, assigned agency, and authorised SafeMY support staff can access the job location when required to operate or support that assignment.</p>

        <h2>Google Maps</h2>
        <p>SafeMY uses Google Maps to display pickup positions and directions between the assigned personnel and customer. When you load an embedded map or choose to open a location or route in Google Maps, the coordinates needed for that map are handled by Google under the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and <a href="https://maps.google.com/help/terms_maps/">Google Maps Terms</a>. SafeMY does not add your name, phone number or email address to the Google Maps link.</p>

        <h2>When it stops</h2>
        <p>The free Safe Journey is not a background location-sharing service: it takes a new snapshot only when you tap the location button. Assignment tracking stops when the assignment ends or when a participant turns off location sharing.</p>

        <h2>Retention</h2>
        <p>SafeMY keeps no server copy of free Safe Journey locations or trusted-person details. Protection-assignment location records may be retained for a limited period for safety, support, disputes, and legal obligations; a fixed production retention schedule will be published before the pilot expands.</p>

        <h2>What we don&apos;t do</h2>
        <p>We do not sell your location data, and we do not share it with advertisers. We are formalising the technical safeguards around this data (encryption, access logging) ahead of public launch.</p>

        <h2>Your controls</h2>
        <p>You control whether to capture or share each free-journey location. You can turn off assignment tracking from the assignment page, and you can ask us to delete eligible account or assignment data via our <a href="/contact">contact page</a>.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
