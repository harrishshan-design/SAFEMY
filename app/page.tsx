import Link from "next/link";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";

const services = [
  {
    code: "BG",
    name: "Personal bodyguard",
    query: "Personal Bodyguard",
    detail: "Close protection for personal movement, private occasions and VIP support.",
    price: "Illustrative estimate from RM100/hour per professional",
  },
  {
    code: "SD",
    name: "Security driver",
    query: "Security Driver",
    detail: "A security-trained driver for point-to-point travel. Vehicle arrangements are quoted separately.",
    price: "Illustrative estimate from RM750 per 8-hour assignment",
  },
  {
    code: "ES",
    name: "Event security",
    query: "Event Security",
    detail: "Licensed teams for weddings, launches, conferences and private events.",
    price: "Custom quote based on headcount, hours and venue",
  },
  {
    code: "FP",
    name: "Female protection",
    query: "Female Protection",
    detail: "Female personnel prioritised for discreet personal accompaniment and close protection.",
    price: "Illustrative estimate from RM110/hour per professional",
  },
];

const bookingSteps = [
  ["01", "Request a quote", "Choose the service, date, time, pickup point, number of personnel and gender preference."],
  ["02", "SafeMY reviews", "We check the request and approach a licensed agency covering the location. A request is not a confirmed booking."],
  ["03", "Agency confirms", "The agency confirms availability, assigned personnel, final price, deposit and its cancellation terms."],
  ["04", "Track the assignment", "After acceptance, SafeMY Live Assignment shows customer and personnel location, freshness, distance and ETA for that job only."],
];

const statusGroups = [
  {
    status: "Available now",
    tone: "available",
    items: ["Safety check-ins", "Guardian list", "Emergency directory", "Protection quote requests"],
  },
  {
    status: "Pilot",
    tone: "pilot",
    items: ["Agency acceptance", "Personnel assignment", "Assignment-only live tracking", "Same-gender and nearest-personnel priority"],
  },
  {
    status: "Later",
    tone: "later",
    items: ["Live journey sharing outside assignments", "Community safety reports", "AI matching and incident reports", "Public-agency workflow integrations"],
  },
];

const faqs = [
  {
    q: "Is SafeMY an emergency service?",
    a: "No. SafeMY does not dispatch police, ambulance or fire services. In immediate danger, call 999. The free toolkit and protection-request workflow are additional safety tools, not replacements for government emergency services.",
  },
  {
    q: "Who actually provides the protection service?",
    a: "The accepted assignment is delivered by an independently operated Malaysian security agency holding the licences required for that work. SafeMY is the booking, verification and assignment layer; it is not the security agency and does not employ the agency's personnel.",
  },
  {
    q: "How does gender and distance matching work?",
    a: "We first prioritise the customer's requested gender, including a same-gender preference. Among eligible verified and available personnel, the nearest suitable person is ranked first. A preference is a priority, not a guarantee, and the customer can decline the proposed assignment.",
  },
  {
    q: "When does live tracking start and stop?",
    a: "Tracking stays off while a request is pending. It starts only for an accepted active assignment, requires location permission from each participant and stops when the assignment is completed or cancelled. The 2D live map is primary; satellite and optional Google Earth area views are supporting tools.",
  },
  {
    q: "Does SafeMY take payment?",
    a: "Not during the current pilot. SafeMY takes no online payment or deposit. Any agency fee, deposit, transport charge, surcharge and cancellation term must be confirmed directly with the assigned agency before the customer accepts its quote.",
  },
  {
    q: "Where can I verify a partner agency's licence?",
    a: "SafeMY will publish the agency name, KDN licence number, coverage, services and last verification date for every public partner profile. The official KDN eSIMS public search remains the source customers should use to independently check current licence status.",
  },
];

export default function Home() {
  return (
    <main>
      <SiteNav />

      <section className="launch-hero shell">
        <div className="launch-hero-copy">
          <span className="eyebrow"><span className="live-dot" /> Klang Valley · early-access pilot</span>
          <h1>Protection, clearly arranged.</h1>
          <p>SafeMY helps customers request quotes from licensed Malaysian security agencies, follow accepted assignments and keep the booking record in one place.</p>
          <p className="launch-boundary">SafeMY is not a security agency or emergency dispatcher. For immediate danger, call <a href="tel:999">999</a>.</p>
        </div>
        <div className="launch-actions" aria-label="Choose what you need">
          <Link href="/request" className="launch-action primary"><small>Need protection</small><b>Request a quote</b><span>Bodyguard, driver or event security →</span></Link>
          <Link href="/safety" className="launch-action"><small>Want free safety tools</small><b>Open the toolkit</b><span>Check-ins, guardians and emergency directory →</span></Link>
          <Link href="/providers/apply" className="launch-action"><small>Licensed agency</small><b>Become a partner</b><span>Submit SSM and KDN details for review →</span></Link>
        </div>
      </section>

      <section id="services" className="launch-section shell">
        <div className="launch-heading">
          <div><span className="kicker">FOUR STARTING SERVICES</span><h2>Ask for the support the situation needs.</h2></div>
          <p>Each request is reviewed manually. Coverage, personnel and final pricing are confirmed by the assigned licensed agency before a booking exists.</p>
        </div>
        <div className="launch-services">
          {services.map((service) => (
            <Link key={service.name} href={`/request?service=${encodeURIComponent(service.query)}`} className="launch-service-card">
              <span>{service.code}</span><h3>{service.name}</h3><p>{service.detail}</p><small>{service.price}</small><b>Request this service →</b>
            </Link>
          ))}
        </div>
      </section>

      <section id="how-booking-works" className="launch-process">
        <div className="shell">
          <div className="launch-heading inverse">
            <div><span className="kicker">HOW BOOKING WORKS</span><h2>From request to one live assignment.</h2></div>
            <p>Gender preference is considered first, then nearest suitable verified personnel. The agency—not an algorithm—confirms the assignment.</p>
          </div>
          <div className="launch-steps">
            {bookingSteps.map(([number, title, detail]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></article>)}
          </div>
          <div className="live-assignment-callout">
            <div><span className="kicker">SAFEMY LIVE ASSIGNMENT</span><h3>Three views, one assignment record.</h3></div>
            <p><b>Customer:</b> assigned personnel, ETA, route and status.</p>
            <p><b>Personnel:</b> travel, arrival and location-sharing controls.</p>
            <p><b>Agency:</b> job status and location freshness for its active team.</p>
          </div>
        </div>
      </section>

      <section id="verification" className="launch-section shell">
        <div className="launch-heading">
          <div><span className="kicker">TRUST MUST BE CHECKABLE</span><h2>A badge is not proof.</h2></div>
          <p>SafeMY only calls an agency verified after reviewing its company and licence information. Customers should still independently check current licence status.</p>
        </div>
        <div className="verification-register">
          <div className="verification-status">
            <span className="status-pill pending">PUBLIC PARTNER REGISTER</span>
            <h3>No agency profile is publicly verified on this page yet.</h3>
            <p>We will not invent partner names, licence numbers, coverage or testimonials. Public profiles will appear only after approval and permission to publish.</p>
            <a href="https://esims.moha.gov.my/semakan/main/search" target="_blank" rel="noreferrer">Check a licence in the official KDN eSIMS search ↗</a>
          </div>
          <div className="verification-fields">
            <h3>Every published partner profile must show</h3>
            <ul>
              <li>Registered agency name and SSM number</li>
              <li>KDN licence number and current status</li>
              <li>Coverage area and offered services</li>
              <li>SafeMY verification date</li>
              <li>Direct link to the official KDN check</li>
            </ul>
            <Link href="/how-we-verify">Read the verification process →</Link>
          </div>
        </div>
      </section>

      <section className="launch-status-section">
        <div className="shell">
          <div className="launch-heading"><div><span className="kicker">ONE PRODUCT STATUS</span><h2>What works now, what is piloting, and what comes later.</h2></div><p>No scattered “coming soon” labels and no future capability presented as a live service.</p></div>
          <div className="launch-status-grid">
            {statusGroups.map((group) => <article key={group.status} className={group.tone}><span>{group.status}</span><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
          </div>
          <Link className="launch-text-link" href="/plans">See the full product and pricing status →</Link>
        </div>
      </section>

      <section id="free-toolkit" className="toolkit-promo shell">
        <div><span className="kicker">FREE SAFETY TOOLKIT</span><h2>Useful before you ever book protection.</h2><p>Save trusted guardians, start a timed check-in and reach Malaysia’s emergency contacts from one browser-based toolkit. No paid plan is required.</p><Link href="/safety">Open the free toolkit →</Link></div>
        <div className="toolkit-list"><span>Available now</span><b>Safety check-in timer</b><b>Guardian list</b><b>Emergency directory</b><small>SOS is a guardian-alert preview during the pilot and never replaces 999.</small></div>
      </section>

      <section id="pricing" className="launch-section shell">
        <div className="launch-heading">
          <div><span className="kicker">PRICING EXAMPLES</span><h2>Understand the estimate before requesting.</h2></div>
          <p>These are illustrations, not offers. The agency’s written quote is the final source for scope, price and terms.</p>
        </div>
        <div className="pricing-examples">
          <article><small>Personal bodyguard</small><b>RM500 example</b><p>1 professional × 5 hours × RM100</p></article>
          <article><small>Female protection</small><b>RM550 example</b><p>1 professional × 5 hours × RM110</p></article>
          <article><small>Security driver</small><b>RM750 example</b><p>1 professional · up to 8 hours · vehicle excluded</p></article>
          <article><small>Wedding security</small><b>RM1,200 example</b><p>2 professionals × 6 hours × RM100</p></article>
        </div>
        <div className="pricing-boundaries">
          <b>Pilot request minimum: 5 hours.</b>
          <span>Transport, tolls, parking, vehicle hire, late-night work and specialist requirements may cost extra and must be itemised by the agency.</span>
          <span>SafeMY takes no payment or deposit in the pilot. If no agency accepts, there is no SafeMY charge. Confirm agency cancellation and refund terms before accepting.</span>
          <Link href="/cancellation-refund-policy">Read cancellation and payment boundaries →</Link>
        </div>
      </section>

      <section id="faq" className="launch-faq shell">
        <div><span className="kicker">GOOD TO KNOW</span><h2>Clear answers before you request.</h2></div>
        <div>{faqs.map((faq) => <details key={faq.q}><summary>{faq.q}<span>+</span></summary><p>{faq.a}</p></details>)}</div>
      </section>

      <section className="launch-final shell">
        <span className="kicker">CHOOSE YOUR NEXT STEP</span>
        <h2>Request protection, use the free tools, or bring your agency onto SafeMY.</h2>
        <div><Link className="hero-btn primary" href="/request">Request a quote</Link><Link className="hero-btn secondary" href="/safety">Open free toolkit</Link><Link className="hero-btn secondary" href="/providers/apply">Become a partner</Link></div>
      </section>

      <SiteFooter />
    </main>
  );
}
