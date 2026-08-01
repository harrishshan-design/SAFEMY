"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { EmergencyBanner } from "../components/EmergencyBanner";

const serviceOptions = ["Personal Bodyguard", "Security Driver", "Event Security", "Female Protection", "Other"];

export default function RequestProtectionPage() {
  return (
    <main>
      <SiteNav />
      <section className="form-hero shell">
        <span className="kicker">KLANG VALLEY PILOT · EARLY ACCESS</span>
        <h1>Request protection.</h1>
        <p>Tell us what you need. Our team manually reviews every request and works to match it with a licensed partner agency covering your area. This pilot does not yet guarantee coverage or response time.</p>
      </section>

      <section className="shell form-shell">
        <EmergencyBanner />
        <Suspense fallback={null}>
          <RequestForm />
        </Suspense>
      </section>

      <SiteFooter />
    </main>
  );
}

function RequestForm() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") ?? "";
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      serviceType: form.get("serviceType"),
      location: form.get("location"),
      startDate: form.get("startDate"),
      startTime: form.get("startTime"),
      durationHours: Number(form.get("durationHours")),
      professionalsCount: Number(form.get("professionalsCount")),
      notes: form.get("notes"),
    };

    try {
      const res = await fetch("/api/protection-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setReference(data.reference);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="confirmation-card">
        <span className="modal-icon">✓</span>
        <h2>Request received.</h2>
        <p>Reference <b>{reference}</b>. Your request is <span className="status-pill">pending review</span>. A member of the SafeMY team will contact you within 1–2 business days to confirm availability, licensed-agency assignment and final pricing.</p>
        <p className="form-note">No professional has been assigned yet, and no payment has been taken. This is not a confirmed booking.</p>
        <a className="tool-btn primary" href={`/track?ref=${encodeURIComponent(reference)}`}>Track this request →</a>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label className="field"><span>Full name</span><input name="name" required placeholder="Your full name" /></label>
        <label className="field"><span>Phone</span><input name="phone" type="tel" required placeholder="e.g. 012-345 6789" /></label>
        <label className="field"><span>Email</span><input name="email" type="email" required placeholder="you@example.com" /></label>
        <label className="field"><span>Service type</span>
          <select name="serviceType" required defaultValue={serviceOptions.includes(preselectedService) ? preselectedService : ""}>
            <option value="" disabled>Select a service</option>
            {serviceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="field wide"><span>Location</span><input name="location" required placeholder="e.g. KLCC, Kuala Lumpur" /></label>
        <label className="field"><span>Date</span><input name="startDate" type="date" required /></label>
        <label className="field"><span>Start time</span><input name="startTime" type="time" required /></label>
        <label className="field"><span>Duration (hours)</span><input name="durationHours" type="number" min="1" required placeholder="6" /></label>
        <label className="field"><span>Number of professionals</span><input name="professionalsCount" type="number" min="1" required placeholder="1" /></label>
        <label className="field wide"><span>Anything else we should know?</span><textarea name="notes" placeholder="Event type, special requirements, etc." /></label>
      </div>
      {status === "error" && <p className="form-error">{error}</p>}
      <button className="form-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit request →"}
      </button>
      <p className="form-note">Pricing shown elsewhere on this site is an estimate. Your partner agency confirms the final quote before any work begins.</p>
    </form>
  );
}
