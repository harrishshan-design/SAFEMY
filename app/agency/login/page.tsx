"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../../../db/supabase-browser";

export default function AgencyLoginPage() {
  return (
    <main>
      <section className="form-hero shell">
        <span className="kicker">SAFEMY PARTNER PORTAL</span>
        <h1>Agency sign in.</h1>
        <p>For licensed agencies who applied via <Link href="/providers/apply">register as a provider</Link>. Your login was created when you submitted your application.</p>
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
  const next = searchParams.get("next") ?? "/agency";
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
        <label className="field wide"><span>Email</span><input name="email" type="email" required placeholder="you@agency.com" /></label>
        <label className="field wide"><span>Password</span><input name="password" type="password" required placeholder="••••••••" /></label>
      </div>
      {status === "error" && <p className="form-error">{error}</p>}
      <button className="form-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Signing in…" : "Sign in →"}
      </button>
      <p className="form-note">No account yet? <Link href="/providers/apply">Apply as a provider</Link> to create one.</p>
    </form>
  );
}
