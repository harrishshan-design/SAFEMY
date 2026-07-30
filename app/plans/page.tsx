import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

export default function PlansPage() {
  return (
    <main>
      <SiteNav />

      <section className="mission-band">
        <div className="shell">
          <span className="kicker">SAFETY FOR EVERYONE</span>
          <p className="mission-quote">Everyone deserves to feel safe, regardless of their income.</p>
          <p>SafeMY is built as three layers on one platform: safety tools that are free for everyone, affordable services for daily situations, and premium protection for those who need or can fund more. Premium and corporate work is what makes the free layer possible to sustain — that&apos;s the commitment, not a claim about revenue we&apos;ve already earned. We&apos;re an early-access Klang Valley pilot, so most of what&apos;s below is what we&apos;re building toward, clearly marked.</p>
        </div>
      </section>

      <section className="tiers-section shell">
        <div className="section-heading">
          <div><span className="kicker">THREE LAYERS, ONE PLATFORM</span><h2>Safety shouldn&apos;t depend<br />on what you can pay.</h2></div>
          <p>Every tier sits on the same platform and the same trust standards. What changes is what&apos;s free, what&apos;s affordable, and what&apos;s premium.</p>
        </div>

        <div className="tiers-grid">
          <div className="tier-card free">
            <span className="tier-badge">Tier 1</span>
            <h3>Free</h3>
            <div className="tier-price">RM0, for everyone</div>
            <p>The safety tools that matter most shouldn&apos;t sit behind a paywall. These are free, permanently — with or without a SafeMY account.</p>
            <ul className="tier-list">
              <li>Guardian list &amp; safety check-in timer — live today, works in your browser</li>
              <li>Emergency directory — live today</li>
              <li>Basic safety tips — live today</li>
              <li className="soon">One-tap SOS as a live alert (today it previews the flow — see the emergency disclaimer)</li>
              <li className="soon">Live location sharing — roadmap</li>
              <li className="soon">Community hazard alerts — roadmap</li>
              <li className="soon">Nearby police stations &amp; hospitals directory — roadmap</li>
            </ul>
            <Link className="tier-cta solid" href="/safety">Open the free toolkit →</Link>
          </div>

          <div className="tier-card">
            <span className="tier-badge">Tier 2</span>
            <h3>Affordable</h3>
            <div className="tier-price">Priced for everyday situations</div>
            <p>Optional services for moments that call for more than a check-in — priced to be reachable, not a luxury. Delivered by the same licensed agencies as Tier 3, at lower-touch service levels.</p>
            <ul className="tier-list">
              <li className="soon">Verified ride home after dark — roadmap, pending licensed-partner coverage</li>
              <li className="soon">Walking companion, where appropriate and safe — roadmap</li>
              <li className="soon">Event safety escort (small gatherings) — roadmap</li>
              <li className="soon">Family safety monitoring — roadmap</li>
            </ul>
            <p className="form-note" style={{ margin: "0 0 20px" }}>None of this is live yet. We&apos;re not publishing prices for services no agency has confirmed — join the pilot and we&apos;ll tell you first when it opens.</p>
            <Link className="tier-cta" href="/pilot">Join the pilot →</Link>
          </div>

          <div className="tier-card premium">
            <span className="tier-badge">Tier 3</span>
            <h3>Premium</h3>
            <div className="tier-price">Est. from RM100/hr per professional</div>
            <p>Personal bodyguards, security drivers and event security are requestable today, reviewed manually and matched with a licensed Malaysian agency. Executive protection, secure convoy and residential security planning are roadmap — not yet requestable.</p>
            <ul className="tier-list">
              <li>Personal bodyguard &amp; female protection — request today</li>
              <li>Security driver — request today</li>
              <li>Event security — request today</li>
              <li className="soon">Executive protection — roadmap</li>
              <li className="soon">Secure convoy services — roadmap</li>
              <li className="soon">Residential security planning — roadmap</li>
            </ul>
            <Link className="tier-cta" href="/request">Request protection →</Link>
          </div>
        </div>

        <div className="subsidy-note">
          <span>↻</span>
          <p><b>How the cross-subsidy is meant to work:</b> premium bookings and corporate contracts (Tier 3) are priced to cover their own cost and generate a margin. That margin is what&apos;s meant to fund keeping Tier 1 free and Tier 2 affordable — the same model libraries, freemium software and many co-ops use. Right now, in the pilot, there isn&apos;t yet meaningful Tier 3 revenue to redistribute — this is the model we&apos;re building toward, not a result we&apos;ve achieved. <Link href="/partners">Organisations</Link> that subsidise access for their own people are the other half of making Tier 1 and 2 reach further.</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
