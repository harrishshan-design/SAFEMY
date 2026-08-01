"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../../../db/supabase-browser";

export default function PersonnelLoginPage() {
  return (
    <main>
      <section className="form-hero shell">
        <span className="kicker">SAFEMY PERSONNEL</span>
        <h1>Personnel sign in.</h1>
        <p>For verified personnel invited by their agency. If you don&apos;t have an account yet, ask your agency to invite you — you&apos;ll receive an email with a link to set your password.</p>
      </section>
      <section className="shell form-shell">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/personnel";
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setStatus("error");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label className="field wide"><span>Email</span><input name="email" type="email" required placeholder="you@example.com" /></label>
        <label className="field wide"><span>Password</span><input name="password" type="password" required placeholder="••••••••" /></label>
      </div>
      {status === "error" && <p className="form-error">{error}</p>}
      <button className="form-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Signing in…" : "Sign in →"}
      </button>
      <p className="form-note">Have an invite link instead? <Link href="/personnel/signup">Set up your account</Link>.</p>
    </form>
  );
}
