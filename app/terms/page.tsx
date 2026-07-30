import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { DraftNotice } from "../components/DraftNotice";

export default function TermsPage() {
  return (
    <main>
      <SiteNav />
      <section className="shell doc-page">
        <span className="kicker">LEGAL</span>
        <h1>Terms of service</h1>
        <DraftNotice />

        <h2>What SafeMY is</h2>
        <p>SafeMY is a platform that connects customers with independently owned and licensed Malaysian security agencies, and lets guardians follow an active protection assignment or shared journey. SafeMY is not itself a licensed security agency, does not employ protection personnel, and does not dispatch police, ambulance or fire services.</p>

        <h2>Requests are not confirmed bookings</h2>
        <p>Submitting a protection request through SafeMY does not guarantee that a professional will be assigned. Every request is reviewed by our team and, where possible, matched with a licensed partner agency, which then confirms availability, personnel and final pricing directly with you.</p>

        <h2>Pricing</h2>
        <p>Prices shown on SafeMY are estimates only, provided to help you plan. Final pricing is confirmed by the assigned agency before work begins and may differ based on requirements, timing and availability.</p>

        <h2>Your responsibilities</h2>
        <p>You agree to provide accurate information when submitting a request, to use the platform lawfully, and not to misuse the SOS or reporting features. Location sharing you enable is your choice and can be turned off at any time.</p>

        <h2>No warranty</h2>
        <p>The pilot is provided on an early-access, &quot;as available&quot; basis. We do not guarantee uninterrupted availability, a specific response time, or that a licensed professional will be available in your area at any given time.</p>

        <h2>Limitation of liability</h2>
        <p>To the extent permitted by Malaysian law, SafeMY&apos;s liability for issues arising from a protection assignment is limited, since the assignment is carried out by an independently licensed third-party agency and its personnel, not by SafeMY directly. Nothing here limits liability that cannot lawfully be limited.</p>

        <h2>Emergencies</h2>
        <p>SafeMY is not a substitute for calling 999. See our <a href="/emergency-disclaimer">emergency disclaimer</a>.</p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Malaysia.</p>

        <h2>Changes</h2>
        <p>We may update these terms as the pilot evolves and will note the date of the most recent revision here.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
