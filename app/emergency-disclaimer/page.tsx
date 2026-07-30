import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { EmergencyBanner } from "../components/EmergencyBanner";

export default function EmergencyDisclaimerPage() {
  return (
    <main>
      <SiteNav />
      <section className="shell doc-page">
        <span className="kicker">TRUST &amp; SAFETY</span>
        <h1>Emergency disclaimer</h1>
        <EmergencyBanner />

        <h2>SafeMY is not an emergency service</h2>
        <p>Malaysia&apos;s official emergency number, 999, coordinates the police, ambulance and fire services. SafeMY is not connected to that dispatch system and cannot send police, ambulance or firefighters to you. If you are in immediate danger or need urgent medical help, call 999 directly first.</p>

        <h2>What SafeMY&apos;s SOS feature actually does</h2>
        <p>Our SOS feature is designed to help you quickly notify the guardians you&apos;ve added and prepare a clear summary of your situation. During the pilot, this does not include automatic dispatch to any government agency or licensed security personnel unless you have an active protection assignment in progress. Treat it as a way to alert people who care about you, not as a replacement for 999.</p>

        <h2>No guaranteed response time</h2>
        <p>Because SafeMY is an early-access pilot connecting you with independent guardians and, where applicable, a third-party agency, we cannot guarantee how quickly anyone will see or respond to an SOS alert.</p>

        <h2>During an active protection assignment</h2>
        <p>If you have an active assignment with a licensed partner agency, their assigned personnel may also be notified through the platform as part of that engagement. This is separate from, and does not replace, government emergency services.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
