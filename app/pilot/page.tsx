"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

const interestOptions = [
  "Tier 3 — bodyguards, drivers, event security (available to request today)",
  "Tier 2 — ride home, walking companion, event escort, family monitoring (roadmap)",
  "Guardian / family member",
  "Community member interested in hazard reports",
  "Security professional",
];

export default function PilotPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      interest: form.get("interest"),
      area: form.get("area"),
    };

    try {
      const res = await fetch("/api/pilot-signups", {
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
        <span className="kicker">KLANG VALLEY PILOT</span>
        <h1>Join the Klang Valley pilot.</h1>
        <p>SafeMY is preparing a limited pilot with a small number of licensed security agencies, starting in the Klang Valley. If you&apos;re interested in the affordable Tier 2 services (ride home, walking companion, escort, family monitoring — see our <Link href="/plans">plans</Link>), this is how we&apos;ll notify you first once they open.</p>
      </section>

      <section className="shell form-shell">
        {status === "done" ? (
          <div className="confirmation-card">
            <span className="modal-icon">✓</span>
            <h2>You&apos;re on the list.</h2>
            <p>We&apos;ll email you when pilot coverage opens in your area. This is an early-access signal, not a service guarantee.</p>
          </div>
        ) : (
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field"><span>Full name</span><input name="name" required placeholder="Your full name" /></label>
              <label className="field"><span>Email</span><input name="email" type="email" required placeholder="you@example.com" /></label>
              <label className="field"><span>Phone (optional)</span><input name="phone" type="tel" placeholder="e.g. 012-345 6789" /></label>
              <label className="field"><span>Area in the Klang Valley</span><input name="area" placeholder="e.g. Petaling Jaya" /></label>
              <label className="field wide"><span>I&apos;m interested as a</span>
                <select name="interest" required defaultValue="">
                  <option value="" disabled>Select one</option>
                  {interestOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            {status === "error" && <p className="form-error">{error}</p>}
            <button className="form-submit" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting…" : "Join the pilot →"}
            </button>
          </form>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
