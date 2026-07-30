"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../db/supabase-browser";

export default function AdminSignupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Passwords don't match.");
      setStatus("error");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setStatus("error");
      return;
    }

    if (!data.session) {
      // Email confirmation is required before a session exists; the invite
      // gets claimed the first time they successfully sign in.
      setStatus("done");
      return;
    }

    const { error: claimError } = await supabase.rpc("safemy_claim_admin_invite");
    if (claimError) {
      setError(
        "Account created, but no staff invite was found for this email. Ask an existing admin to invite you, then sign in.",
      );
      setStatus("error");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (status === "done") {
    return (
      <main>
        <section className="form-hero shell"><span className="kicker">SAFEMY ADMIN</span><h1>Check your email.</h1></section>
        <section className="shell form-shell">
          <div className="confirmation-card">
            <span className="modal-icon">✓</span>
            <h2>Confirm your address.</h2>
            <p>Click the link we sent to finish creating your account. If your email was invited as staff, you&apos;ll get admin access the moment you sign in.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="form-hero shell">
        <span className="kicker">SAFEMY ADMIN</span>
        <h1>Create your staff account.</h1>
        <p>Anyone can create an account here, but it only grants admin access if your email has already been invited by an existing admin. No invite yet? Ask a super-admin first.</p>
      </section>
      <section className="shell form-shell">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="field wide"><span>Work email</span><input name="email" type="email" required placeholder="you@safemy.org" /></label>
            <label className="field"><span>Password</span><input name="password" type="password" required minLength={8} placeholder="At least 8 characters" /></label>
            <label className="field"><span>Confirm password</span><input name="confirm" type="password" required minLength={8} placeholder="Repeat password" /></label>
          </div>
          {status === "error" && <p className="form-error">{error}</p>}
          <button className="form-submit" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Creating account…" : "Create account →"}
          </button>
        </form>
      </section>
    </main>
  );
}
