"use client";

import { useState } from "react";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

const partnerTypes = [
  {
    icon: "🎓",
    title: "Universities",
    body: "Late-night safe-ride and walking-companion access for students, funded from student activity fees or a campus safety budget — the same shape as safe-ride programmes run at universities elsewhere, adapted to a licensed-agency model here.",
  },
  {
    icon: "🏬",
    title: "Shopping malls",
    body: "Escort-to-car and after-hours walking companion access for staff and shoppers, funded from the mall&apos;s existing security budget.",
  },
  {
    icon: "🏘️",
    title: "Residential communities",
    body: "Under Malaysia&apos;s Strata Management Act 2013, a JMB or MC&apos;s maintenance account already covers security services for residents — SafeMY access can sit inside that existing budget line, not a new special levy.",
  },
  {
    icon: "🤝",
    title: "NGOs",
    body: "Subsidised or free access for the communities an NGO already serves — survivors, students, elderly residents, outreach workers — funded by the NGO or a grant, at a rate we agree together.",
  },
  {
    icon: "🏢",
    title: "Employers",
    body: "Duty-of-care tools for staff who travel for work or finish late shifts — the same category as lone-worker safety software employers already fund elsewhere, and adjacent to corporate ride accounts like Grab for Business that some Malaysian employers already use to cover late-night travel.",
  },
  {
    icon: "🛡️",
    title: "Insurance providers",
    body: "A safety layer that complements a personal-accident or home policy — potentially bundled as a value-add for policyholders. We&apos;re open to exploring this; no insurer partnership exists yet.",
  },
  {
    icon: "🔒",
    title: "Security companies",
    body: "Licensed agencies that want a channel for new customers and a real-time way to manage assignments — see how we verify providers and register interest.",
  },
];

export default function PartnersPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      organisationName: form.get("organisationName"),
      organisationType: form.get("organisationType"),
      contactName: form.get("contactName"),
      contactEmail: form.get("contactEmail"),
      contactPhone: form.get("contactPhone"),
      peopleServed: form.get("peopleServed"),
      interest: form.get("interest"),
    };

    try {
      const res = await fetch("/api/partner-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <main>
      <SiteNav />
      <section className="form-hero shell">
        <span className="kicker">FOUNDING PARTNERS</span>
        <h1>Help your people feel safer.</h1>
        <p>SafeMY is looking for founding partners — organisations that want to subsidise safety access for the students, residents, staff or members they already serve. This is a pilot: no case studies yet, no fixed programme. We&apos;re building it with the first partners who join.</p>
      </section>

      <section className="shell doc-page" style={{ maxWidth: 980 }}>
        <div className="partner-grid">
          {partnerTypes.map((p) => (
            <div key={p.title} className="partner-card">
              <span>{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>

        <h2>What a founding partner gets</h2>
        <p>Direct input into how subsidised access works for your people, priority onboarding once the Klang Valley pilot has capacity, and a say in what &quot;affordable&quot; and &quot;free&quot; actually mean for the community you represent.</p>

        <h2>What we need from you</h2>
        <p>Roughly how many people you&apos;d want covered, what you&apos;re hoping to fund (the free toolkit, affordable services, or both), and a contact we can talk to. No commitment is created by sending this form.</p>
        <p className="form-note">Any protection service described above is delivered by agencies licensed under Malaysia&apos;s Private Agencies Act 1971, never by independent individuals. SafeMY does not replace police, ambulance, fire or other government emergency services — in immediate danger, call 999.</p>
      </section>

      <section className="shell form-shell">
        {status === "done" ? (
          <div className="confirmation-card">
            <span className="modal-icon">✓</span>
            <h2>Thanks — we&apos;ll be in touch.</h2>
            <p>A member of the SafeMY team will follow up by email to talk through what a partnership could look like for your organisation.</p>
          </div>
        ) : (
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field wide"><span>Organisation name</span><input name="organisationName" required placeholder="Registered organisation name" /></label>
              <label className="field wide"><span>Organisation type</span>
                <select name="organisationType" required defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>University</option>
                  <option>Shopping mall</option>
                  <option>Residential community (JMB/MC)</option>
                  <option>NGO</option>
                  <option>Employer</option>
                  <option>Insurance provider</option>
                  <option>Security company</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field"><span>Contact name</span><input name="contactName" required placeholder="Your name" /></label>
              <label className="field"><span>Contact email</span><input name="contactEmail" type="email" required placeholder="you@organisation.com" /></label>
              <label className="field"><span>Contact phone</span><input name="contactPhone" type="tel" placeholder="e.g. 03-1234 5678" /></label>
              <label className="field"><span>Approximate people served</span><input name="peopleServed" placeholder="e.g. 2,000 students" /></label>
              <label className="field wide"><span>What are you hoping to fund?</span><textarea name="interest" placeholder="e.g. Free toolkit access for our residents, or affordable ride-home for students" /></label>
            </div>
            {status === "error" && <p className="form-error">{error}</p>}
            <button className="form-submit" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting…" : "Register interest →"}
            </button>
          </form>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
