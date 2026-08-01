"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../db/supabase-browser";
import { hashTrackingToken } from "../../../db/matching";

export default function PersonnelSignupPage() {
  return (
    <main>
      <section className="form-hero shell">
        <span className="kicker">SAFEMY PERSONNEL</span>
        <h1>Set up your account.</h1>
        <p>Use the invite link your agency sent you. Enter the same email address they invited — this links your login to your personnel profile.</p>
      </section>
      <section className="shell form-shell">
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </section>
    </main>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "submitting" | "check_email" | "error" | "claiming">("idle");
  const [error, setError] = useState("");

  async function claimInvite() {
    const supabase = createSupabaseBrowserClient();
    const tokenHash = await hashTrackingToken(token);
    const { error: claimError } = await supabase.rpc("safemy_claim_personnel_invite", { p_token_hash: tokenHash });
    if (claimError) {
      setError("Signed in, but this invite link is invalid, already used, or doesn't match your email. Ask your agency to resend it.");
      setStatus("error");
      return;
    }
    router.push("/personnel");
    router.refresh();
  }

  // If they arrive here already signed in (e.g. after confirming their email
  // and being redirected back), claim immediately instead of asking again.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !cancelled) {
        setStatus("claiming");
        await claimInvite();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("This link is missing its invite token. Ask your agency to resend your invite.");
      setStatus("error");
      return;
    }
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
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/personnel/signup?token=${encodeURIComponent(token)}` },
    });
    if (signUpError) {
      setError(signUpError.message);
      setStatus("error");
      return;
    }

    if (!data.session) {
      setStatus("check_email");
      return;
    }

    setStatus("claiming");
    await claimInvite();
  }

  if (status === "check_email") {
    return (
      <div className="confirmation-card">
        <span className="modal-icon">✓</span>
        <h2>Check your email.</h2>
        <p>Click the link we sent to finish creating your account. It brings you back here and links your profile automatically.</p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      {!token && <p className="form-error">No invite token found in this link. Ask your agency to resend your invite email.</p>}
      <div className="field-grid">
        <label className="field wide"><span>Email (must match your invite)</span><input name="email" type="email" required placeholder="you@example.com" /></label>
        <label className="field"><span>Password</span><input name="password" type="password" required minLength={8} placeholder="At least 8 characters" /></label>
        <label className="field"><span>Confirm password</span><input name="confirm" type="password" required minLength={8} placeholder="Repeat password" /></label>
      </div>
      {status === "error" && <p className="form-error">{error}</p>}
      <button className="form-submit" type="submit" disabled={status === "submitting" || status === "claiming" || !token}>
        {status === "submitting" ? "Creating account…" : status === "claiming" ? "Linking your profile…" : "Create account →"}
      </button>
    </form>
  );
}
