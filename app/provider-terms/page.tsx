import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { DraftNotice } from "../components/DraftNotice";

export default function ProviderTermsPage() {
  return (
    <main>
      <SiteNav />
      <section className="shell doc-page">
        <span className="kicker">FOR LICENSED SECURITY AGENCIES</span>
        <h1>Provider terms</h1>
        <DraftNotice />

        <h2>Eligibility</h2>
        <p>To become a SafeMY partner, your agency must hold a valid licence under the Private Agencies Act 1971 issued by the Ministry of Home Affairs (KDN), current company registration with the Companies Commission of Malaysia (SSM), and appropriate insurance coverage for your personnel and operations. See <a href="/how-we-verify">how we verify providers</a>.</p>

        <h2>What SafeMY is, in this relationship</h2>
        <p>SafeMY acts as a platform connecting customer requests to your agency. Your agency remains the employer and licensed operator of your personnel, and is responsible for their conduct, training and licensing on each assignment. SafeMY does not become the employer of your personnel.</p>

        <h2>Application and verification</h2>
        <p>Every application is reviewed manually. We check your company registration and KDN licence status, and may request supporting documents. No agency is marked as verified or shown to customers until this process is complete.</p>

        <h2>Fees</h2>
        <p>Commission and fee structure for confirmed assignments will be confirmed directly with your agency before you are onboarded to the live pilot, and published here once finalised.</p>

        <h2>Conduct and suspension</h2>
        <p>Agencies and personnel are expected to comply with all applicable licensing and conduct requirements. We may suspend or remove an agency from the platform if a licence lapses, a serious complaint is substantiated, or these terms are breached, and we will work with you on a fair process for that review.</p>

        <h2>Liability</h2>
        <p>Your agency is responsible for the services it delivers and for maintaining appropriate insurance. SafeMY&apos;s role is to facilitate the connection between you and the customer.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
