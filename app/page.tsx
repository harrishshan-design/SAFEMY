"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";
import { EmergencyBanner } from "./components/EmergencyBanner";

const incidents = [
  { icon: "🚗", label: "Road accident", tone: "amber" },
  { icon: "💡", label: "Streetlight out", tone: "blue" },
  { icon: "🌧️", label: "Flash flood", tone: "cyan" },
];

const mapPins = [
  { label: "Flooding", className: "pin flood", style: { left: "23%", top: "34%" } },
  { label: "Accident", className: "pin accident", style: { left: "58%", top: "27%" } },
  { label: "Light out", className: "pin light", style: { left: "70%", top: "61%" } },
  { label: "You", className: "pin you", style: { left: "44%", top: "55%" } },
];

const protectionServices = [
  { code: "BG", name: "Personal Bodyguard", detail: "Close protection for daily life, VIP movement and private occasions.", rate: "Est. from RM100/hr per professional", tone: "dark" },
  { code: "SD", name: "Security Driver", detail: "Trained protection professionals for secure point-to-point travel.", rate: "Est. from RM750/day per professional", tone: "coral" },
  { code: "ES", name: "Event Security", detail: "Licensed teams for weddings, launches, conferences and private events.", rate: "Custom quote from your agency", tone: "mint" },
  { code: "FE", name: "Female Protection", detail: "Licensed female professionals for discreet personal accompaniment.", rate: "Est. from RM110/hr per professional", tone: "sand" },
];

const dutySteps = ["Assigned", "En route", "Arrived", "On duty", "Completed"];

const tierTeasers = [
  {
    tier: "Tier 1", title: "Free", price: "RM0, for everyone", tone: "free",
    points: ["Guardians & safety check-in — live today", "Emergency directory & safety tips — live today"],
    cta: { href: "/safety", label: "Open the free toolkit →" },
  },
  {
    tier: "Tier 2", title: "Affordable", price: "Priced for everyday situations", tone: "",
    points: ["Verified ride home after dark — roadmap", "Walking companion & family monitoring — roadmap"],
    cta: { href: "/pilot", label: "Join the pilot →" },
  },
  {
    tier: "Tier 3", title: "Premium", price: "Est. from RM100/hr per professional", tone: "premium",
    points: ["Bodyguards, drivers & event security — request today", "Executive protection & convoy — roadmap"],
    cta: { href: "/request", label: "Request protection →" },
  },
];

const proofGoals = [
  { value: "Klang Valley", label: "First pilot region" },
  { value: "Licensed only", label: "Every partner agency KDN-checked" },
  { value: "999", label: "Always the right call in an emergency" },
  { value: "Manual review", label: "A person checks every request" },
];

const activityFeed = [
  "🛡️ Example: agency accepts a 6-hour protection detail in KLCC",
  "📍 Example: guardian alert resolved near Bangsar",
  "✅ Example: partner agency completes KDN licence verification",
  "🚧 Example: flash flood report confirmed in Shah Alam",
  "🔒 Example: wedding protection request submitted in Petaling Jaya",
];

const testimonials = [
  { persona: "Prospective customer", role: "Petaling Jaya", quote: "When I feel unsafe walking home, I want one tap to get a guardian tracking me live — not to explain everything to a stranger first." },
  { persona: "Event organiser", role: "Bangsar", quote: "I've booked security through phone calls and group chats before. I'd rather see a licensed agency's profile, an ETA and a status I can check myself." },
  { persona: "Parent", role: "Subang Jaya", quote: "I want to see my daughter's campus-to-home journey and her battery status, so I'm not calling her every ten minutes to check she's okay." },
  { persona: "Security agency operator", role: "Kuala Lumpur", quote: "Running officers across the city usually means six different group chats. A single live board with duty status would save us hours a week." },
];

const faqs = [
  { q: "Is any of this actually free?", a: "Yes. Your guardian list, safety check-in timer, emergency directory and safety tips are free permanently, work today in your browser, and need no account. See the free safety toolkit and our plans breakdown." },
  { q: "How fast does SOS actually respond?", a: "Our goal is to notify the guardians you've added within moments of tapping SOS. During this early pilot we don't have verified response-time data to share yet, and SOS does not replace calling 999 — in immediate danger, always call 999 first." },
  { q: "Are protection professionals really verified?", a: "SafeMY onboards licensed agencies, not independent individuals. Every partner agency we onboard is checked against company registration, KDN licence status, personnel identity, training and insurance before it appears as verified. See how we verify providers." },
  { q: "Can I cancel or change a booking?", a: "SafeMY doesn't process payments directly yet, so cancellation terms for a confirmed job are set by your assigned agency. See our cancellation and refund policy for how this works during the pilot." },
  { q: "What happens to my location data?", a: "Location is only shared with the guardians you choose and, during an active assignment, the assigned agency. Sharing stops automatically when your journey or assignment ends. See our location data policy." },
  { q: "Is SafeMY available outside Malaysia?", a: "We're starting with a limited pilot in the Klang Valley and plan to expand as we onboard more verified partner agencies. Join the pilot list to be notified as coverage grows." },
];

export default function Home() {
  const [panel, setPanel] = useState<"none" | "sos" | "report">("none");
  const [toasts, setToasts] = useState<{ id: number; icon: string; title: string; message: string }[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const toastId = useRef(0);

  function addToast(icon: string, title: string, message: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, icon, title, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  }

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <main>
      <SiteNav />

      <section id="top" className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Klang Valley pilot · early access</div>
          <h1>Protection for<br />life in motion.</h1>
          <p>Request protection services from licensed Malaysian security agencies, track assignments in real time and keep trusted contacts informed.</p>
          <div className="hero-actions">
            <Link className="hero-btn primary" href="/request">Request Protection</Link>
            <Link className="hero-btn secondary" href="/safety">Open the Free Safety Toolkit</Link>
          </div>
          <p className="hero-disclaimer">Early-access platform. Service availability depends on verified partner coverage. For emergencies, call 999 — SafeMY does not replace police, ambulance or fire services.</p>
          <button className="text-book" onClick={() => setPanel("sos")}>Preview the SOS &amp; guardian experience <span>→</span></button>
          <p className="pilot-line"><b>Everyone deserves to feel safe, regardless of their income.</b><br /><Link href="/plans">See the free, affordable and premium tiers →</Link></p>
        </div>

        <div className="phone-wrap" aria-label="SafeMY app preview">
          <div className="phone">
            <div className="phone-top"><b>9:41</b><span>● ◒ ▰</span></div>
            <div className="phone-head">
              <div><small>Good evening,</small><strong>Amira</strong></div><button aria-label="Notifications">●</button>
            </div>
            <div className="status-card">
              <div><span className="pulse-icon">✓</span><p><b>You&apos;re in a safe area</b><small>Petaling Jaya · Example</small></p></div>
              <span className="score">86</span>
            </div>
            <div className="mini-map">
              <span className="road r1" /><span className="road r2" /><span className="road r3" />
              <span className="me">●</span><span className="tiny-pin p1">!</span><span className="tiny-pin p2">!</span>
            </div>
            <button className="phone-sos" onClick={() => setPanel("sos")}><b>SOS</b><small>Hold for emergency</small></button>
            <div className="quick-title"><b>Quick actions</b><span>View all</span></div>
            <div className="quick-grid"><button>⌖<span>Safe Walk</span></button><button>⚑<span>Report</span></button><button>♧<span>Guardians</span></button></div>
          </div>
          <div className="float-alert"><span>✓</span><p><b>Guardian notified</b><small>Example journey preview</small></p></div>
        </div>
      </section>
      <small className="preview-caption shell">App preview — illustrative mockup, not live data.</small>

      <div className="demo-strip"><p className="shell">Interactive product demonstration. SafeMY is preparing for its Klang Valley pilot.</p></div>

      <section className="proof-goals reveal"><div className="shell proof-goals-grid">
        {proofGoals.map((g) => (
          <div key={g.label}><b>{g.value}</b><span>{g.label}</span></div>
        ))}
      </div></section>

      <p className="ticker-caption shell">Preview — the kind of activity feed customers and agencies will see once the pilot is live.</p>
      <section className="ticker-bar" aria-label="Example activity feed">
        <div className="ticker-track">
          {[...activityFeed, ...activityFeed].map((item, i) => <span key={i} className="ticker-item">{item}</span>)}
        </div>
      </section>

      <section className="tiers-section shell reveal">
        <div className="section-heading">
          <div><span className="kicker">SAFETY FOR EVERYONE</span><h2>Free for everyone.<br />More when you need it.</h2></div>
          <p>Everyone deserves to feel safe, regardless of their income. One platform, three layers — a free toolkit for everyone, affordable services on the roadmap, and premium protection you can request today.</p>
        </div>
        <div className="tiers-grid">
          {tierTeasers.map((t) => (
            <div key={t.tier} className={`tier-card ${t.tone}`}>
              <span className="tier-badge">{t.tier}</span>
              <h3>{t.title}</h3>
              <div className="tier-price">{t.price}</div>
              <ul className="tier-list">
                {t.points.map((p) => <li key={p} className={p.includes("roadmap") ? "soon" : ""}>{p}</li>)}
              </ul>
              <Link className={`tier-cta ${t.tone === "free" ? "solid" : ""}`} href={t.cta.href}>{t.cta.label}</Link>
            </div>
          ))}
        </div>
        <p className="form-note" style={{ textAlign: "center", marginTop: 26 }}>
          <Link href="/plans">See the full breakdown of what&apos;s live and what&apos;s roadmap →</Link>
        </p>
      </section>

      <section id="protection" className="protection-section shell">
        <div className="protection-head">
          <div><span className="kicker">PROTECTION, ON YOUR TERMS</span><h2>Professional support.<br />Precisely when you need it.</h2></div>
          <p>Choose the service you need and submit a request. SafeMY&apos;s team reviews it and works to match it with a licensed partner agency. Prices below are platform estimates — your agency confirms the final quote.</p>
        </div>
        <div className="service-grid">
          {protectionServices.map((service) => (
            <Link key={service.name} href={`/request?service=${encodeURIComponent(service.name)}`} className="service-card reveal">
              <span className={`service-code ${service.tone}`}>{service.code}</span>
              <span className="service-arrow">↗</span>
              <strong>{service.name}</strong><small>{service.detail}</small><b>{service.rate}</b>
            </Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="booking-showcase reveal">
        <div className="shell booking-showcase-grid">
          <div className="booking-copy"><span className="kicker">HOW IT WORKS</span><h2>From request to<br />protected—step by step.</h2><p>Submit a request, our team verifies it, a licensed agency accepts the job, and you see who&apos;s assigned. Live tracking runs only while the assignment is active, and closes automatically once it&apos;s done.</p>
            <div className="booking-example"><span>Example estimate</span><div><b>Wedding protection</b><small>2 guards · Plain clothes · 6 hours</small></div><strong>Est. RM1,200</strong></div>
            <Link href="/request">Start a request →</Link>
          </div>
          <div className="assignment-card">
            <div className="assignment-top"><span>EXAMPLE ASSIGNMENT VIEW</span><span className="demo-badge">Illustrative</span></div>
            <div className="pro-card"><div className="pro-photo">JL</div><div><small>Example lead professional</small><h3>Agency-assigned officer</h3><p>Close Protection · Licensed agency</p></div><em>Example</em></div>
            <div className="arrival"><div><span className="radar-dot"/><p><small>Current status</small><b>En route to KLCC (example)</b></p></div><strong>18<small>min ETA</small></strong></div>
            <div className="duty-line">{dutySteps.map((step, index) => <div key={step} className={index < 2 ? "active" : ""}><i>{index < 2 ? "✓" : index + 1}</i><span>{step}</span></div>)}</div>
            <div className="assignment-actions"><button disabled>Message</button><button className="track" disabled>View live location</button></div>
          </div>
        </div>
      </section>

      <section id="features" className="features shell">
        <div className="section-heading"><div><span className="kicker">BUILT FOR REAL LIFE</span><h2>Safety that moves<br />at your speed.</h2></div><p>Some of this is part of the initial pilot; the rest is on our roadmap and rolls out after the core request-and-track workflow is reliable.</p></div>
        <div className="feature-grid">
          <article className="feature feature-main reveal"><span className="feature-num">01</span><div className="ai-orb">✦</div><h3>SOS &amp; guardian alerts</h3><p>Tap SOS to notify the guardians you&apos;ve added and prepare a clear summary of your situation. This does not replace calling 999.</p><button onClick={() => setPanel("sos")}>See how it works →</button></article>
          <article className="feature reveal"><span className="feature-num">02</span><div className="feature-icon coral">⌖</div><h3>Live journey sharing<span className="roadmap-tag">Roadmap</span></h3><p>Your guardians see your route, ETA and battery status—without needing to keep asking if you&apos;re okay.</p><div className="journey"><span>Home</span><i /><span>Campus</span><b>12 min</b></div></article>
          <article className="feature reveal"><span className="feature-num">03</span><div className="feature-icon mint">⚑</div><h3>Community safety map<span className="roadmap-tag">Roadmap</span></h3><p>Broken lights, flash floods or dangerous roads. Report what you see — we&apos;re building the routing to local authorities after the core pilot is reliable.</p><div className="incident-chips">{incidents.map(x => <span key={x.label} className={x.tone}>{x.icon} {x.label}</span>)}</div></article>
        </div>
      </section>

      <section id="professionals" className="trust-section shell">
        <div className="trust-card reveal">
          <div className="trust-copy"><span className="kicker">LICENSING IS VISIBLE</span><h2>Know exactly who<br />is protecting you.</h2><p>Malaysia&apos;s private security industry is regulated under the Private Agencies Act 1971. SafeMY onboards licensed agencies, not independent individuals — every partner agency goes through the checks below before appearing as verified. Read the full process on <Link href="/how-we-verify">how we verify providers</Link>.</p>
            <div className="checks"><span>Identity verified</span><span>Licence checked</span><span>Background screened</span><span>Training recorded</span><span>Insurance status</span><span>Customer rated</span></div>
          </div>
          <div className="credential-card"><span className="demo-badge">Example profile</span><span className="verified-label">CREDENTIAL CARD PREVIEW</span><div className="credential-person"><i>NA</i><div><h3>Example officer</h3><p>Licensed Protection Officer</p></div></div><hr/><div className="credential-stats"><span><small>Experience</small><b>7 years</b></span><span><small>Languages</small><b>BM · EN · CN</b></span><span><small>Rating</small><b>Not yet rated</b></span></div><div className="credential-tags"><span>VIP protection</span><span>Female clients</span><span>Events</span></div></div>
        </div>
        <div className="match-card reveal"><div className="match-orb">AI</div><div><span className="kicker">SMARTER MATCHING <span className="roadmap-tag">Roadmap</span></span><h3>Not a directory. A recommendation.</h3><p>We plan for SafeMY to consider distance, availability, experience, languages, event type and response history to suggest the right agency for each job. During the pilot, matching is done manually by our team.</p></div></div>
      </section>

      <section className="testimonials shell reveal">
        <div className="section-heading"><div><span className="kicker">WHAT WE&apos;RE HEARING</span><h2>What Klang Valley residents<br />have told us they need.</h2></div><p>Illustrative scenarios based on user research — not verified customer reviews.</p></div>
        <div className="testimonial-card">
          <span className="quote-mark" aria-hidden="true">&ldquo;</span>
          <p className="testimonial-quote">{testimonials[activeTestimonial].quote}</p>
          <div className="testimonial-person">
            <i>{testimonials[activeTestimonial].persona.split(" ").map((w) => w[0]).slice(0, 2).join("")}</i>
            <div><b>{testimonials[activeTestimonial].persona}</b><small>{testimonials[activeTestimonial].role}</small></div>
          </div>
        </div>
        <div className="testimonial-dots">
          {testimonials.map((t, i) => (
            <button key={t.persona} className={i === activeTestimonial ? "active" : ""} aria-label={`Show scenario: ${t.persona}`} onClick={() => setActiveTestimonial(i)} />
          ))}
        </div>
      </section>

      <section id="map" className="map-section reveal">
        <div className="shell map-grid">
          <div className="map-copy"><span className="kicker">ROADMAP <span className="roadmap-tag">After the pilot</span></span><h2>Your neighbourhood,<br />made visible.</h2><p>Once the core request-and-track workflow is reliable, we plan a map of hazards residents report — flooding, broken streetlighting, road hazards — shown as reported, with no area given a safety score or rating. Reports route toward the relevant local council, in the spirit of KPKT&apos;s Program Bandar Selamat.</p><ul><li><b>Hazard reports</b><span>Flooding, broken lights and road hazards, shown as reported and dated.</span></li><li><b>No area scores</b><span>We won&apos;t rate or rank neighbourhoods — that data doesn&apos;t exist responsibly in Malaysia today.</span></li><li><b>Your own journey, always</b><span>Live journey sharing and check-ins with your guardians, wherever you are.</span></li></ul><Link href="/pilot">Join the pilot to get notified →</Link></div>
          <div className="big-map">
            <span className="demo-badge">Preview — not live</span>
            <span className="map-road mr1"/><span className="map-road mr2"/><span className="map-road mr3"/><span className="map-road mr4"/>
            {mapPins.map(pin => <span key={pin.label} className={pin.className} style={pin.style}>{pin.label === "You" ? "●" : "!"}<em>{pin.label}</em></span>)}
            <div className="map-score"><span>Reported hazards</span><b>3</b><i>Illustrative — as reported, not verified</i></div>
          </div>
        </div>
      </section>

      <section className="prevention-section reveal">
        <div className="shell prevention-grid">
          <div className="prevention-copy">
            <span className="kicker">PREVENTION <span className="roadmap-tag">Roadmap</span></span>
            <h2>The biggest opportunity<br />may not be bodyguards.</h2>
            <p>Responding after something goes wrong matters — but helping someone avoid a bad situation in the first place could help far more people, at far lower cost. We want SafeMY to nudge people toward safer choices before they need an SOS at all.</p>
            <ul className="prevention-points">
              <li><b>We won&apos;t score or rank neighbourhoods.</b>Malaysia has no reliable street-level incident or lighting data today, and area &quot;danger&quot; labels have a documented history of unfairly targeting lower-income neighbourhoods elsewhere. We&apos;re not building that.</li>
              <li><b>We&apos;ll report hazards, not rate places.</b>A broken streetlight or flooded road, reported and dated — aligned with KPKT&apos;s Program Bandar Selamat crime-prevention-through-design approach — is useful and defensible. A secret safety score is neither.</li>
              <li><b>Your journey stays yours.</b>Guardians and a safety check-in timer are free and working today, whatever any map says about where you are. Live location sharing is roadmap.</li>
            </ul>
            <Link href="/pilot">Join the pilot to help shape this →</Link>
          </div>
          <div>
            <div className="nudge-phone">
              <span className="nudge-time">11:32 PM · illustrative</span>
              <div className="nudge-bubble">
                <p>You&apos;re on a check-in with Mak. Want to share your live route until you arrive?</p>
                <p>We won&apos;t tell you a street is &quot;dangerous&quot; — we don&apos;t have data we&apos;d trust for that. This keeps someone you chose in the loop instead.</p>
              </div>
              <div className="nudge-actions">
                <span>Share route</span>
                <span>Start check-in</span>
              </div>
            </div>
            <small className="nudge-caption">Illustrative — not a live feature. Concept only, pending the pilot.</small>
          </div>
        </div>
      </section>

      <section id="community" className="cta-section shell reveal">
        <div><span className="kicker">SAFER, TOGETHER</span><h2>It starts with<br />someone looking out.</h2><p>Join the pilot list to help shape SafeMY as we launch in the Klang Valley.</p><Link href="/pilot">Join the Klang Valley pilot →</Link></div>
        <div className="network" aria-hidden="true"><i className="n1">👩🏽</i><i className="n2">👨🏻</i><i className="n3">👩🏻</i><i className="n4">👨🏽</i><span>Safe<b>MY</b></span></div>
      </section>

      <section className="business-section reveal">
        <div className="shell business-grid"><div><span className="kicker">SAFEMY FOR BUSINESS <span className="roadmap-tag">Roadmap</span></span><h2>One command centre<br />for every assignment.</h2><p>We plan for security companies to manage staff, shifts, assignments and customer feedback from a single operations view, after the Klang Valley pilot proves out the core workflow.</p><Link href="/business">Contact SafeMY for Business →</Link></div><div className="ops-card"><div className="ops-head"><b>Example operations dashboard</b><span className="demo-badge">Illustrative</span></div><div className="ops-stats"><span><small>On duty</small><b>—</b></span><span><small>En route</small><b>—</b></span><span><small>Open jobs</small><b>—</b></span></div><div className="ops-job"><i>#</i><div><b>Wedding · KLCC</b><small>Example · 18:00–00:00</small></div><span>Example</span></div><div className="ops-job"><i>#</i><div><b>Security driver · Bangsar</b><small>Example · 16:00–23:00</small></div><span className="route">Example</span></div></div></div>
      </section>

      <section id="faq" className="faq-section shell reveal">
        <div className="section-heading"><div><span className="kicker">GOOD TO KNOW</span><h2>Frequently asked<br />questions.</h2></div></div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={faq.q} className={`faq-item ${openFaq === i ? "open" : ""}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{faq.q}</span><i aria-hidden="true">{openFaq === i ? "−" : "+"}</i>
              </button>
              {openFaq === i && <p className="faq-answer">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />

      {panel !== "none" && <div className="modal-backdrop" onMouseDown={() => setPanel("none")}><div className="modal" onMouseDown={e => e.stopPropagation()}>
        <button className="close" onClick={() => setPanel("none")}>×</button>
        {panel === "sos" ? <>
          <span className="modal-icon emergency">SOS</span><small>SOS PREVIEW</small><h2>Are you in immediate danger?</h2>
          <EmergencyBanner />
          <p>This previews how SafeMY&apos;s SOS flow will work. If you are in immediate danger, call 999 right now — do not wait for this app.</p>
          <div className="modal-actions">
            <button className="danger" onClick={() => { addToast("🆘", "Guardians notified (preview)", "In a real emergency, call 999 immediately — SafeMY does not dispatch police, ambulance or fire services."); setPanel("none"); }}>Alert my guardians now</button>
            <button onClick={() => setPanel("report")}>No, I need to report something</button>
          </div>
        </> : <>
          <span className="modal-icon">✦</span><small>SMART INCIDENT REPORT — PREVIEW</small><h2>What happened?</h2>
          <p>Describe the situation naturally. This is a preview: automatic routing to local authorities isn&apos;t live in this pilot yet.</p>
          <textarea autoFocus placeholder="e.g. A large tree has fallen across Jalan 14/22..." />
          <div className="modal-actions"><button className="primary" onClick={() => { addToast("📝", "Report saved (preview)", "Automatic routing to local authorities isn't live yet in this pilot."); setPanel("none"); }}>Continue report →</button><button onClick={() => setPanel("none")}>Cancel</button></div>
        </>}
      </div></div>}

      <div className="assistant-wrap">
        {assistantOpen && (
          <div className="assistant-panel">
            <div className="assistant-head">
              <span className="assistant-orb">✦</span>
              <div><b>Quick actions</b><small>SOS, report or request</small></div>
              <button onClick={() => setAssistantOpen(false)} aria-label="Close quick actions">×</button>
            </div>
            <div className="assistant-quick">
              <button onClick={() => { setPanel("sos"); setAssistantOpen(false); }}>🆘 Preview SOS</button>
              <button onClick={() => { setPanel("report"); setAssistantOpen(false); }}>⚑ Report an incident</button>
              <Link href="/request" onClick={() => setAssistantOpen(false)}>🛡️ Request protection</Link>
            </div>
          </div>
        )}
        <button className="assistant-fab" onClick={() => setAssistantOpen(!assistantOpen)} aria-label="Open quick actions">{assistantOpen ? "×" : "✦"}</button>
      </div>

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast"><span>{t.icon}</span><div><b>{t.title}</b><small>{t.message}</small></div></div>
        ))}
      </div>
    </main>
  );
}
