"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

export default function SupportPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/support-cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      bookingReference: form.get("bookingReference"), contactEmail: form.get("contactEmail"), category: form.get("category"), message: form.get("message"),
    }) });
    const data = await response.json() as { reference?: string; error?: string };
    if (!response.ok || !data.reference) { setError(data.error ?? "Couldn't open a case."); setStatus("error"); return; }
    setReference(data.reference);
    setStatus("done");
  }

  return <main><SiteNav /><section className="form-hero shell"><span className="kicker">SUPPORT &amp; DISPUTES</span><h1>We keep a record and follow up.</h1><p>Use this form for booking issues, provider concerns, safety questions, privacy requests or anything that needs a human review. Immediate danger: call 999 first.</p></section><section className="shell form-shell">
    {status === "done" ? <div className="confirmation-card"><span className="modal-icon">✓</span><h2>Case {reference} is open.</h2><p>Save this reference. We&apos;ll use the contact email you supplied to follow up. If you need to add information, open a new case and include this reference.</p><Link className="hero-btn secondary" href="/">Back to SafeMY</Link></div> : <form className="form-card" onSubmit={submit}><div className="field-grid"><label className="field"><span>Booking reference (optional)</span><input name="bookingReference" placeholder="SM-1234ABCD" /></label><label className="field"><span>Contact email (optional)</span><input name="contactEmail" type="email" placeholder="you@example.com" /></label><label className="field wide"><span>What do you need help with?</span><select name="category" defaultValue="booking_issue"><option value="booking_issue">Booking issue</option><option value="safety_concern">Safety concern</option><option value="provider_concern">Provider concern</option><option value="billing_question">Billing question</option><option value="privacy_request">Privacy request</option><option value="other">Other</option></select></label><label className="field wide"><span>Message</span><textarea name="message" required minLength={10} rows={7} placeholder="Tell us what happened, including times and reference numbers where useful." /></label></div>{status === "error" && <p className="form-error">{error}</p>}<button className="form-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Opening case…" : "Open support case →"}</button></form>}
  </section><SiteFooter /></main>;
}
