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
        <p>SafeMY only collects precise location data when you actively turn on journey sharing, or during an active protection assignment. We do not track your location in the background or outside of those windows.</p>

        <h2>Who can see it</h2>
        <p>Live location is visible only to the guardians you choose to share it with and, during an active assignment, the assigned agency and personnel. SafeMY staff can access it if needed to support you or investigate a safety concern.</p>

        <h2>Google Maps</h2>
        <p>SafeMY uses Google Maps to display pickup positions and directions between the assigned personnel and customer. When you load an embedded map or choose to open a location or route in Google Maps, the coordinates needed for that map are handled by Google under the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and <a href="https://maps.google.com/help/terms_maps/">Google Maps Terms</a>. SafeMY does not add your name, phone number or email address to the Google Maps link.</p>

        <h2>When it stops</h2>
        <p>Location sharing stops automatically when the journey or assignment ends, or immediately if you turn it off yourself. We do not continue sharing your location after either of those points.</p>

        <h2>Retention</h2>
        <p>We keep a short history of a completed journey&apos;s location trail briefly for safety and support purposes, then delete it, except where it is needed for an active safety investigation or a legal obligation.</p>

        <h2>What we don&apos;t do</h2>
        <p>We do not sell your location data, and we do not share it with advertisers. We are formalising the technical safeguards around this data (encryption, access logging) ahead of public launch.</p>

        <h2>Your controls</h2>
        <p>You can stop sharing your location at any time from within the app, and you can ask us to delete historical location data associated with your account via our <a href="/contact">contact page</a>.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
