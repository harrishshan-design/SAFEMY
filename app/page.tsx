import Link from "next/link";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";

const services = [
  {
    code: "BG",
    name: "Personal bodyguard",
    query: "Personal Bodyguard",
    detail: "Planned close protection through a licensed Malaysian security agency.",
  },
  {
    code: "SD",
    name: "Protective driver",
    query: "Security Driver",
    detail: "A security-trained driver using the customer’s vehicle during the pilot. This is not an e-hailing service.",
  },
  {
    code: "ES",
    name: "Event security",
    query: "Event Security",
    detail: "Licensed personnel for weddings, launches, conferences, and private events.",
  },
];

const faqs = [
  {
    q: "Is somebody at SafeMY watching my journey?",
    a: "No. Phase 1 is self-managed. Your timer runs in the open browser tab, and SafeMY does not monitor you or automatically contact anyone. You decide when to share a Google Maps pin, WhatsApp, or SMS message.",
  },
  {
    q: "What happens if I am in immediate danger?",
    a: "Call 999. SafeMY is a personal safety tool and planned-protection request platform, not a police, ambulance, fire, or emergency dispatch service.",
  },
  {
    q: "Who provides a bodyguard or event-security service?",
    a: "Only an independently operated Malaysian security agency holding the licences required for that work can deliver an accepted assignment. SafeMY is the request, verification, and assignment layer during the pilot.",
  },
  {
    q: "How are personnel suggested?",
    a: "The customer’s gender preference is considered first. Among eligible, verified, and available personnel, the nearest suitable person is prioritised. The agency makes the final assignment, and the customer can decline it.",
  },
];

export default function Home() {
  return (
    <main>
      <SiteNav />

      <section className="launch-hero shell phase-one-hero">
        <div className="launch-hero-copy">
          <span className="eyebrow"><span className="live-dot" /> Free Safe Journey · Klang Valley pilot</span>
          <h1>A quiet safety layer for getting there.</h1>
          <p>Share a Google Maps location, set an arrival check-in, and keep one trusted person informed. If you need planned protection, request a quote from a licensed agency.</p>
          <p className="launch-boundary">No fear tactics and no fake emergency promises. SafeMY does not monitor journeys or replace <a href="tel:999">999</a>.</p>
        </div>
        <div className="launch-actions" aria-label="Choose what you need">
          <Link href="/safety#check-in" className="launch-action primary"><small>Free · no account</small><b>Start a Safe Journey</b><span>Add destination, arrival time, location, and a trusted person →</span></Link>
          <Link href="/request" className="launch-action"><small>Planned protection</small><b>Request a quote</b><span>Bodyguard, protective driver, or event security →</span></Link>
          <a href="tel:999" className="launch-action emergency-action"><small>Immediate danger</small><b>Call 999</b><span>Police, fire and rescue, or ambulance →</span></a>
        </div>
      </section>

      <section className="phase-one-strip">
        <div className="shell phase-one-strip-grid">
          <span><b>Free to use</b>No subscription in Phase 1</span>
          <span><b>Private by default</b>Trusted contacts stay on your device</span>
          <span><b>Google Maps</b>Share a pin or open a route</span>
          <span><b>Clear limits</b>No automatic emergency dispatch</span>
        </div>
      </section>

      <section className="launch-section shell" id="phase-one">
        <div className="launch-heading">
          <div><span className="kicker">PHASE 1</span><h2>Two useful things, done properly.</h2></div>
          <p>SafeMY is starting with repeatable everyday safety and a carefully controlled protection pilot—not a long list of unproven features.</p>
        </div>
        <div className="phase-one-grid">
          <article className="phase-feature available">
            <span className="phase-badge">Available now</span>
            <h3>Safe Journey</h3>
            <p>For walking home, taking an e-hailing ride, meeting someone new, or travelling after dark.</p>
            <ul>
              <li>Save trusted people on your own device</li>
              <li>Set a destination and expected arrival</li>
              <li>Capture a location with browser permission</li>
              <li>Open the route and pin in Google Maps</li>
              <li>Share updates through WhatsApp, SMS, or your phone</li>
            </ul>
            <Link href="/safety#check-in">Start in under a minute →</Link>
          </article>
          <article className="phase-feature pilot">
            <span className="phase-badge">Controlled pilot</span>
            <h3>Verified protection request</h3>
            <p>For protection that can be planned in advance and confirmed by a licensed provider.</p>
            <ul>
              <li>Same-gender personnel preference</li>
              <li>Nearest suitable verified personnel priority</li>
              <li>Written agency quote before acceptance</li>
              <li>Private two-way tracking after assignment</li>
              <li>Timestamped arrival, duty, and completion status</li>
            </ul>
            <Link href="/request">Request a reviewed quote →</Link>
          </article>
        </div>
      </section>

      <section className="launch-process" id="services">
        <div className="shell">
          <div className="launch-heading inverse">
            <div><span className="kicker">PLANNED PROTECTION</span><h2>Only services we can verify and explain.</h2></div>
            <p>A request is not a booking. A licensed partner agency must confirm availability, scope, personnel, price, and terms.</p>
          </div>
          <div className="phase-service-grid">
            {services.map((service) => (
              <Link key={service.name} href={`/request?service=${encodeURIComponent(service.query)}`} className="phase-service-card">
                <span>{service.code}</span>
                <h3>{service.name}</h3>
                <p>{service.detail}</p>
                <b>Request this service →</b>
              </Link>
            ))}
          </div>
          <div className="legal-scope-note">
            <b>Phase 1 boundaries</b>
            <span>No armed-service selector. No instant dispatch claim. No SafeMY payment collection. Protective-driver requests use the customer&apos;s vehicle during the pilot and are not presented as e-hailing.</span>
            <Link href="/how-we-verify">How SafeMY verifies agencies →</Link>
          </div>
        </div>
      </section>

      <section className="launch-section shell phase-control-section">
        <div className="launch-heading">
          <div><span className="kicker">YOUR CONTROL</span><h2>Trust comes from visible controls.</h2></div>
          <p>Location and protection data should have a clear reason, a clear audience, and a clear stopping point.</p>
        </div>
        <div className="phase-control-grid">
          <article><span>01</span><h3>Permission first</h3><p>Your browser asks before reading location. SafeMY&apos;s free journey tool does not upload your trusted contacts.</p></article>
          <article><span>02</span><h3>Share deliberately</h3><p>A journey message opens only when you tap. You still choose the recipient and press send.</p></article>
          <article><span>03</span><h3>Track only the job</h3><p>Protection tracking starts after acceptance and location permission, then stops when the assignment ends.</p></article>
        </div>
      </section>

      <section className="launch-faq shell" id="faq">
        <div><span className="kicker">GOOD TO KNOW</span><h2>Clear answers before you use it.</h2></div>
        <div>{faqs.map((faq) => <details key={faq.q}><summary>{faq.q}<span>+</span></summary><p>{faq.a}</p></details>)}</div>
      </section>

      <section className="launch-final shell phase-one-final">
        <span className="kicker">USE WHAT EXISTS TODAY</span>
        <h2>Start one Safe Journey. Add the rest only when SafeMY can deliver it responsibly.</h2>
        <div><Link className="hero-btn primary" href="/safety#check-in">Start a Safe Journey</Link><Link className="hero-btn secondary" href="/request">Request protection</Link></div>
      </section>

      <SiteFooter />
    </main>
  );
}
