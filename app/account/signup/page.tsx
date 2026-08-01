"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../../../db/supabase-browser";

export default function AccountSignupPage() {
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
      setStatus("done");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  if (status === "done") {
    return (
      <main>
        <section className="form-hero shell"><span className="kicker">SAFEMY ACCOUNT</span><h1>Check your email.</h1></section>
        <section className="shell form-shell">
          <div className="confirmation-card">
            <span className="modal-icon">✓</span>
            <h2>Confirm your address.</h2>
            <p>Click the link we sent to finish creating your account, then <Link href="/account/login">sign in</Link>.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="form-hero shell">
        <span className="kicker">SAFEMY ACCOUNT</span>
        <h1>Create an account.</h1>
        <p>Optional — booking without an account still works fine via your private tracking link. An account just gives you a dashboard of your requests in one place.</p>
      </section>
      <section className="shell form-shell">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="field wide"><span>Email</span><input name="email" type="email" required placeholder="you@example.com" /></label>
            <label className="field"><span>Password</span><input name="password" type="password" required minLength={8} placeholder="At least 8 characters" /></label>
            <label className="field"><span>Confirm password</span><input name="confirm" type="password" required minLength={8} placeholder="Repeat password" /></label>
          </div>
          {status === "error" && <p className="form-error">{error}</p>}
          <button className="form-submit" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Creating account…" : "Create account →"}
          </button>
          <p className="form-note">Already have one? <Link href="/account/login">Sign in</Link>.</p>
        </form>
      </section>
    </main>
  );
}
