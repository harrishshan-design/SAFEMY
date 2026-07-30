"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "../../components/SiteNav";
import { SiteFooter } from "../../components/SiteFooter";

export default function ProviderApplyPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      agencyName: form.get("agencyName"),
      registrationNumber: form.get("registrationNumber"),
      kdnLicenceNumber: form.get("kdnLicenceNumber"),
      contactName: form.get("contactName"),
      contactEmail: form.get("contactEmail"),
      contactPhone: form.get("contactPhone"),
      servicesOffered: form.get("servicesOffered"),
      coverageAreas: form.get("coverageAreas"),
      headcount: form.get("headcount"),
    };

    try {
      const res = await fetch("/api/provider-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { application?: unknown; error?: string };
      if (!res.ok || !data.application) throw new Error(data.error ?? "Something went wrong. Please try again.");
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
        <span className="kicker">FOR LICENSED SECURITY AGENCIES</span>
        <h1>Register as a licensed provider.</h1>
        <p>SafeMY onboards licensed Malaysian security agencies, not independent individuals. Read <Link href="/how-we-verify">how we verify providers</Link> before applying — every application is checked manually against your KDN licence and company registration before approval.</p>
      </section>

      <section className="shell form-shell">
        {status === "done" ? (
          <div className="confirmation-card">
            <span className="modal-icon">✓</span>
            <h2>Application received.</h2>
            <p>Our team will verify your company registration and KDN licence before following up. Verification typically requires supporting documents by email — we&apos;ll reach out with next steps.</p>
          </div>
        ) : (
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field wide"><span>Agency name</span><input name="agencyName" required placeholder="Registered company name" /></label>
              <label className="field"><span>Company registration number (SSM)</span><input name="registrationNumber" required placeholder="e.g. 202401012345" /></label>
              <label className="field"><span>KDN licence number</span><input name="kdnLicenceNumber" required placeholder="Private Agencies Act 1971 licence no." /></label>
              <label className="field"><span>Contact name</span><input name="contactName" required placeholder="Primary contact" /></label>
              <label className="field"><span>Contact email</span><input name="contactEmail" type="email" required placeholder="you@agency.com" /></label>
              <label className="field"><span>Contact phone</span><input name="contactPhone" type="tel" required placeholder="e.g. 03-1234 5678" /></label>
              <label className="field"><span>Approximate headcount</span><input name="headcount" placeholder="e.g. 25 personnel" /></label>
              <label className="field wide"><span>Services offered</span><textarea name="servicesOffered" required placeholder="e.g. Close protection, event security, security drivers" /></label>
              <label className="field wide"><span>Coverage areas</span><textarea name="coverageAreas" required placeholder="e.g. Klang Valley, Petaling Jaya, KLCC" /></label>
            </div>
            {status === "error" && <p className="form-error">{error}</p>}
            <button className="form-submit" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting…" : "Submit application →"}
            </button>
            <p className="form-note">No agency is listed as verified on SafeMY until this process is complete.</p>
          </form>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
