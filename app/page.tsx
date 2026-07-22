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

export default function Home() {
  const [panel, setPanel] = useState<"none" | "sos" | "report">("none");
  const [shared, setShared] = useState(false);

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="SafeMY home">
          <span className="brand-mark">S</span><span>Safe<span>MY</span></span>
        </a>
        <div className="nav-links">
          <a href="#map">Safety map</a><a href="#features">How it works</a><a href="#community">Community</a>
        </div>
        <button className="nav-cta" onClick={() => setPanel("report")}>Report an issue</button>
      </nav>

      <section id="top" className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Malaysia&apos;s community safety network</div>
          <h1>Help is closer<br />than you think.</h1>
          <p>One platform connecting you to family, responders and your community—when every second matters.</p>
          <div className="hero-actions">
            <button className="sos-button" onClick={() => setPanel("sos")} aria-label="Start emergency SOS">
              <span className="sos-rings"><b>SOS</b></span>
              <span>Hold for emergency</span>
            </button>
            <button className={`share-button ${shared ? "done" : ""}`} onClick={() => setShared(!shared)}>
              <span>{shared ? "✓" : "⌖"}</span>{shared ? "Location shared" : "Share my location"}
            </button>
          </div>
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
        <div><b>24/7</b><span>Always watching over you</span></div><div><b>3.4 min</b><span>Average community response</span></div><div><b>98%</b><span>Alerts acknowledged</span></div><div><b>14 states</b><span>Growing across Malaysia</span></div>
      </div></section>

      <section id="features" className="features shell">
        <div className="section-heading"><div><span className="kicker">BUILT FOR REAL LIFE</span><h2>Safety that moves<br />at your speed.</h2></div><p>From an uncertain walk home to a road hazard on your street, SafeMY gets the right information to the right people—fast.</p></div>
        <div className="feature-grid">
          <article className="feature feature-main"><span className="feature-num">01</span><div className="ai-orb">✦</div><h3>AI-guided emergency help</h3><p>Tell us what happened in your own words. SafeMY identifies the emergency, gathers the essentials and prepares a clear report.</p><button onClick={() => setPanel("sos")}>See how it works →</button></article>
          <article className="feature"><span className="feature-num">02</span><div className="feature-icon coral">⌖</div><h3>Live journey sharing</h3><p>Your guardians see your route, ETA and battery status—without needing to keep asking if you&apos;re okay.</p><div className="journey"><span>Home</span><i /><span>Campus</span><b>12 min</b></div></article>
          <article className="feature"><span className="feature-num">03</span><div className="feature-icon mint">⚑</div><h3>Report what you see</h3><p>Broken lights, flash floods or dangerous roads. Snap it once and we route it to the right local authority.</p><div className="incident-chips">{incidents.map(x => <span key={x.label} className={x.tone}>{x.icon} {x.label}</span>)}</div></article>
        </div>
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

      <footer className="shell"><a className="brand" href="#top"><span className="brand-mark">S</span><span>Safe<span>MY</span></span></a><p>Malaysia&apos;s community safety network.</p><small>© 2026 SafeMY · Built for Malaysia</small></footer>

      {panel !== "none" && <div className="modal-backdrop" onMouseDown={() => setPanel("none")}><div className="modal" onMouseDown={e => e.stopPropagation()}>
        <button className="close" onClick={() => setPanel("none")}>×</button>
        {panel === "sos" ? <><span className="modal-icon emergency">SOS</span><small>AI EMERGENCY ASSISTANT</small><h2>Are you in immediate danger?</h2><p>Stay calm. We&apos;ll guide you and prepare the information responders need.</p><div className="modal-actions"><button className="danger">Yes, send help now</button><button onClick={() => setPanel("report")}>No, I need to report something</button></div><em>Call 999 directly if you can.</em></> : <><span className="modal-icon">✦</span><small>SMART INCIDENT REPORT</small><h2>What happened?</h2><p>Describe the situation naturally. AI will categorise it and suggest who should receive it.</p><textarea autoFocus placeholder="e.g. A large tree has fallen across Jalan 14/22..." /><div className="modal-actions"><button className="primary">Continue report →</button><button onClick={() => setPanel("none")}>Cancel</button></div></>}
      </div></div>}
    </main>
  );
}
