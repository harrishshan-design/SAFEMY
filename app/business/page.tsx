"use client";

import { useState } from "react";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

const teamSizes = ["1–10 officers", "11–50 officers", "51–200 officers", "200+ officers"];

export default function BusinessPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      companyName: form.get("companyName"),
      contactName: form.get("contactName"),
      contactEmail: form.get("contactEmail"),
      contactPhone: form.get("contactPhone"),
      teamSize: form.get("teamSize"),
      message: form.get("message"),
    };

    try {
      const res = await fetch("/api/business-enquiries", {
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
        <span className="kicker">SAFEMY FOR BUSINESS</span>
        <h1>Contact SafeMY for Business.</h1>
        <p>Security companies will be able to manage staff, shifts and assignments from a single operations view. This is on our roadmap after the Klang Valley pilot — tell us about your agency and we&apos;ll keep you posted.</p>
      </section>

      <section className="shell form-shell">
        {status === "done" ? (
          <div className="confirmation-card">
            <span className="modal-icon">✓</span>
            <h2>Thanks — we&apos;ll be in touch.</h2>
            <p>A member of the SafeMY team will follow up by email.</p>
          </div>
        ) : (
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field wide"><span>Company name</span><input name="companyName" required placeholder="Registered company name" /></label>
              <label className="field"><span>Contact name</span><input name="contactName" required placeholder="Your name" /></label>
              <label className="field"><span>Contact email</span><input name="contactEmail" type="email" required placeholder="you@company.com" /></label>
              <label className="field"><span>Contact phone</span><input name="contactPhone" type="tel" placeholder="e.g. 03-1234 5678" /></label>
              <label className="field"><span>Team size</span>
                <select name="teamSize" defaultValue="">
                  <option value="" disabled>Select a range</option>
                  {teamSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="field wide"><span>What are you looking for?</span><textarea name="message" placeholder="Tell us about your agency and needs" /></label>
            </div>
            {status === "error" && <p className="form-error">{error}</p>}
            <button className="form-submit" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting…" : "Send enquiry →"}
            </button>
          </form>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
