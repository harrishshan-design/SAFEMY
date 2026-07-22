"use client";

import { useState } from "react";

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
  { code: "BG", name: "Personal Bodyguard", detail: "Close protection for daily life, VIP movement and private occasions.", rate: "From RM100/hr", tone: "dark" },
  { code: "SD", name: "Security Driver", detail: "Trained protection professionals for secure point-to-point travel.", rate: "From RM750/day", tone: "coral" },
  { code: "ES", name: "Event Security", detail: "Licensed teams for weddings, launches, conferences and private events.", rate: "Custom quote", tone: "mint" },
  { code: "FE", name: "Female Protection", detail: "Licensed female professionals for discreet personal accompaniment.", rate: "From RM110/hr", tone: "sand" },
];

const dutySteps = ["Assigned", "En route", "Arrived", "On duty", "Completed"];

export default function Home() {
  const [panel, setPanel] = useState<"none" | "sos" | "report" | "booking">("none");
  const [shared, setShared] = useState(false);
  const [selectedService, setSelectedService] = useState("Personal Bodyguard");
  const [bookingStep, setBookingStep] = useState(1);

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="SafeMY home">
          <span className="brand-mark">S</span><span>Safe<span>MY</span></span>
        </a>
        <div className="nav-links">
          <a href="#protection">Protection</a><a href="#map">Safety map</a><a href="#professionals">Professionals</a>
        </div>
        <button className="nav-cta nav-book" onClick={() => setPanel("booking")}>Book protection</button>
      </nav>

      <section id="top" className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Malaysia&apos;s personal safety platform</div>
          <h1>Protection for<br />life in motion.</h1>
          <p>Emergency help, trusted protection professionals and community intelligence—connected in one platform.</p>
          <div className="hero-actions">
            <button className="sos-button" onClick={() => setPanel("sos")} aria-label="Start emergency SOS">
              <span className="sos-rings"><b>SOS</b></span>
              <span>Hold for emergency</span>
            </button>
            <button className={`share-button ${shared ? "done" : ""}`} onClick={() => setShared(!shared)}>
              <span>{shared ? "✓" : "⌖"}</span>{shared ? "Location shared" : "Share my location"}
            </button>
          </div>
          <button className="text-book" onClick={() => setPanel("booking")}>Book a verified professional <span>→</span></button>
          <div className="trust-row">
            <div className="avatars"><i>AZ</i><i>MK</i><i>JL</i><i>+8</i></div>
            <span><b>12,400+ Malaysians</b><br />looking out for one another</span>
          </div>
        </div>

        <div className="phone-wrap" aria-label="SafeMY app preview">
          <div className="phone">
            <div className="phone-top"><b>9:41</b><span>● ◒ ▰</span></div>
            <div className="phone-head">
              <div><small>Good evening,</small><strong>Amira</strong></div><button aria-label="Notifications">●</button>
            </div>
            <div className="status-card">
              <div><span className="pulse-icon">✓</span><p><b>You&apos;re in a safe area</b><small>Petaling Jaya · Updated now</small></p></div>
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
          <div className="float-alert"><span>✓</span><p><b>Guardian notified</b><small>Mak is following your journey</small></p></div>
          <div className="float-response"><span>03:42</span><p><b>Average response</b><small>in your area</small></p></div>
        </div>
      </section>

      <section className="proof"><div className="shell proof-grid">
        <div><b>24/7</b><span>Emergency assistance</span></div><div><b>100%</b><span>Identity-verified professionals</span></div><div><b>Live</b><span>Duty tracking and timestamps</span></div><div><b>14 states</b><span>Growing across Malaysia</span></div>
      </div></section>

      <section id="protection" className="protection-section shell">
        <div className="protection-head">
          <div><span className="kicker">PROTECTION, ON YOUR TERMS</span><h2>Professional support.<br />Precisely when you need it.</h2></div>
          <p>Choose the service, time and level of support. SafeMY finds suitable licensed professionals and keeps every stage visible.</p>
        </div>
        <div className="service-grid">
          {protectionServices.map((service) => (
            <button key={service.name} className="service-card" onClick={() => { setSelectedService(service.name); setBookingStep(1); setPanel("booking"); }}>
              <span className={`service-code ${service.tone}`}>{service.code}</span>
              <span className="service-arrow">↗</span>
              <strong>{service.name}</strong><small>{service.detail}</small><b>{service.rate}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="booking-showcase">
        <div className="shell booking-showcase-grid">
          <div className="booking-copy"><span className="kicker">A CLEARER WAY TO BOOK</span><h2>From request to<br />protected—in minutes.</h2><p>Plan a wedding, a secure transfer or a full day of personal protection with upfront details and no uncertainty.</p>
            <div className="booking-example"><span>Example booking</span><div><b>Wedding protection</b><small>2 guards · Plain clothes · 6 hours</small></div><strong>RM600</strong></div>
            <button onClick={() => setPanel("booking")}>Start a booking →</button>
          </div>
          <div className="assignment-card">
            <div className="assignment-top"><span>PROTECTION ASSIGNED</span><b>Job #204</b></div>
            <div className="pro-card"><div className="pro-photo">JL</div><div><small>Your lead professional</small><h3>John Lim <i>✓</i></h3><p>Close Protection · 8 years</p><b>★★★★★ <span>4.9</span></b></div><em>Verified</em></div>
            <div className="arrival"><div><span className="radar-dot"/><p><small>Current status</small><b>En route to KLCC</b></p></div><strong>18<small>min ETA</small></strong></div>
            <div className="duty-line">{dutySteps.map((step, index) => <div key={step} className={index < 2 ? "active" : ""}><i>{index < 2 ? "✓" : index + 1}</i><span>{step}</span></div>)}</div>
            <div className="assignment-actions"><button>Message</button><button className="track">View live location</button></div>
          </div>
        </div>
      </section>

      <section id="features" className="features shell">
        <div className="section-heading"><div><span className="kicker">BUILT FOR REAL LIFE</span><h2>Safety that moves<br />at your speed.</h2></div><p>From an uncertain walk home to a road hazard on your street, SafeMY gets the right information to the right people—fast.</p></div>
        <div className="feature-grid">
          <article className="feature feature-main"><span className="feature-num">01</span><div className="ai-orb">✦</div><h3>AI-guided emergency help</h3><p>Tell us what happened in your own words. SafeMY identifies the emergency, gathers the essentials and prepares a clear report.</p><button onClick={() => setPanel("sos")}>See how it works →</button></article>
          <article className="feature"><span className="feature-num">02</span><div className="feature-icon coral">⌖</div><h3>Live journey sharing</h3><p>Your guardians see your route, ETA and battery status—without needing to keep asking if you&apos;re okay.</p><div className="journey"><span>Home</span><i /><span>Campus</span><b>12 min</b></div></article>
          <article className="feature"><span className="feature-num">03</span><div className="feature-icon mint">⚑</div><h3>Report what you see</h3><p>Broken lights, flash floods or dangerous roads. Snap it once and we route it to the right local authority.</p><div className="incident-chips">{incidents.map(x => <span key={x.label} className={x.tone}>{x.icon} {x.label}</span>)}</div></article>
        </div>
      </section>

      <section id="professionals" className="trust-section shell">
        <div className="trust-card">
          <div className="trust-copy"><span className="kicker">TRUST IS THE PRODUCT</span><h2>Know exactly who<br />is protecting you.</h2><p>Every professional profile brings credentials, experience and service history into one clear view.</p>
            <div className="checks"><span>Identity verified</span><span>Licence checked</span><span>Background screened</span><span>Training recorded</span><span>Insurance status</span><span>Customer rated</span></div>
          </div>
          <div className="credential-card"><span className="verified-label">SAFEMY VERIFIED</span><div className="credential-person"><i>NA</i><div><h3>Nur Aisyah</h3><p>Licensed Protection Officer</p></div><b>✓</b></div><hr/><div className="credential-stats"><span><small>Experience</small><b>7 years</b></span><span><small>Languages</small><b>BM · EN · CN</b></span><span><small>Rating</small><b>4.9 / 5</b></span></div><div className="credential-tags"><span>VIP protection</span><span>Female clients</span><span>Events</span></div></div>
        </div>
        <div className="match-card"><div className="match-orb">AI</div><div><span className="kicker">SMARTER MATCHING</span><h3>Not a directory. A recommendation.</h3><p>SafeMY considers distance, availability, experience, languages, event type and response history to suggest the right professional for each job.</p></div><div className="match-score"><small>Match confidence</small><b>96%</b><span>Best fit available</span></div></div>
      </section>

      <section id="map" className="map-section">
        <div className="shell map-grid">
          <div className="map-copy"><span className="kicker">KNOW BEFORE YOU GO</span><h2>Your neighbourhood,<br />made visible.</h2><p>A living safety map built from verified community reports, road conditions, lighting and flood risk.</p><ul><li><b>Real-time local alerts</b><span>See what&apos;s happening around you now.</span></li><li><b>AI Safety Score</b><span>Understand an area at a glance.</span></li><li><b>Community verified</b><span>Useful updates from people nearby.</span></li></ul><button onClick={() => document.getElementById("top")?.scrollIntoView({ behavior: "smooth" })}>Explore your area →</button></div>
          <div className="big-map">
            <span className="map-road mr1"/><span className="map-road mr2"/><span className="map-road mr3"/><span className="map-road mr4"/>
            {mapPins.map(pin => <span key={pin.label} className={pin.className} style={pin.style}>{pin.label === "You" ? "●" : "!"}<em>{pin.label}</em></span>)}
            <div className="map-score"><span>Area safety score</span><b>86<small>/100</small></b><i>Low risk · Live</i></div>
          </div>
        </div>
      </section>

      <section id="community" className="cta-section shell">
        <div><span className="kicker">SAFER, TOGETHER</span><h2>It starts with<br />someone looking out.</h2><p>Join a growing network of Malaysians making every neighbourhood safer.</p><button onClick={() => setPanel("report")}>Join the community →</button></div>
        <div className="network" aria-hidden="true"><i className="n1">👩🏽</i><i className="n2">👨🏻</i><i className="n3">👩🏻</i><i className="n4">👨🏽</i><span>Safe<b>MY</b></span></div>
      </section>

      <section className="business-section">
        <div className="shell business-grid"><div><span className="kicker">SAFEMY FOR BUSINESS</span><h2>One command centre<br />for every assignment.</h2><p>Security companies manage staff, shifts, earnings, assignments, performance and customer feedback from a single operations view.</p><button>Explore business solutions →</button></div><div className="ops-card"><div className="ops-head"><b>Operations overview</b><span>Live · Kuala Lumpur</span></div><div className="ops-stats"><span><small>On duty</small><b>18</b></span><span><small>En route</small><b>6</b></span><span><small>Open jobs</small><b>4</b></span></div><div className="ops-job"><i>204</i><div><b>Wedding · KLCC</b><small>2 officers · 18:00–00:00</small></div><span>On duty</span></div><div className="ops-job"><i>205</i><div><b>Security driver · Bangsar</b><small>1 officer · 16:00–23:00</small></div><span className="route">En route</span></div></div></div>
      </section>

      <footer className="shell"><a className="brand" href="#top"><span className="brand-mark">S</span><span>Safe<span>MY</span></span></a><p>Malaysia&apos;s community safety network.</p><small>© 2026 SafeMY · Built for Malaysia</small></footer>

      {panel !== "none" && <div className="modal-backdrop" onMouseDown={() => setPanel("none")}><div className="modal" onMouseDown={e => e.stopPropagation()}>
        <button className="close" onClick={() => setPanel("none")}>×</button>
        {panel === "sos" ? <><span className="modal-icon emergency">SOS</span><small>AI EMERGENCY ASSISTANT</small><h2>Are you in immediate danger?</h2><p>Stay calm. We&apos;ll guide you and prepare the information responders need.</p><div className="modal-actions"><button className="danger">Yes, send help now</button><button onClick={() => setPanel("report")}>No, I need to report something</button></div><em>Call 999 directly if you can.</em></> : panel === "report" ? <><span className="modal-icon">✦</span><small>SMART INCIDENT REPORT</small><h2>What happened?</h2><p>Describe the situation naturally. AI will categorise it and suggest who should receive it.</p><textarea autoFocus placeholder="e.g. A large tree has fallen across Jalan 14/22..." /><div className="modal-actions"><button className="primary">Continue report →</button><button onClick={() => setPanel("none")}>Cancel</button></div></> : <div className="booking-modal">
          <div className="booking-progress"><span className={bookingStep >= 1 ? "active" : ""}>1</span><i/><span className={bookingStep >= 2 ? "active" : ""}>2</span><i/><span className={bookingStep >= 3 ? "active" : ""}>3</span></div>
          {bookingStep === 1 && <><small>BOOK PROTECTION</small><h2>What do you need?</h2><p>Choose a service to begin. You can add specific requirements next.</p><div className="modal-service-grid">{protectionServices.map(service => <button key={service.name} className={selectedService === service.name ? "selected" : ""} onClick={() => setSelectedService(service.name)}><b>{service.code}</b><span>{service.name}</span></button>)}</div><div className="modal-actions"><button className="primary" onClick={() => setBookingStep(2)}>Continue →</button></div></>}
          {bookingStep === 2 && <><small>BOOKING DETAILS</small><h2>Plan your protection.</h2><p>{selectedService} · Minimum 5 hours</p><div className="booking-fields"><label>Date<input type="date" defaultValue="2026-08-08"/></label><label>Start time<input type="time" defaultValue="18:00"/></label><label>Duration<select defaultValue="6"><option value="5">5 hours</option><option value="6">6 hours</option><option value="8">8 hours</option><option value="12">12 hours</option></select></label><label>Professionals<select><option>1 professional</option><option>2 professionals</option><option>3 professionals</option><option>4+ professionals</option></select></label><label className="wide">Location<input placeholder="e.g. KLCC, Kuala Lumpur"/></label></div><div className="modal-actions horizontal"><button onClick={() => setBookingStep(1)}>Back</button><button className="primary" onClick={() => setBookingStep(3)}>Find my match →</button></div></>}
          {bookingStep === 3 && <><span className="modal-icon match">96%</span><small>AI MATCH READY</small><h2>Your best match is available.</h2><p>John Lim matches your location, event type, schedule and protection requirements.</p><div className="match-result"><span>JL</span><div><b>John Lim <i>✓</i></b><small>Close Protection · 8 years · 4.9 ★</small></div><strong>RM600</strong></div><div className="modal-actions"><button className="primary">Review and book →</button><button onClick={() => setPanel("none")}>Save for later</button></div></>}
        </div>}
      </div></div>}
    </main>
  );
}
