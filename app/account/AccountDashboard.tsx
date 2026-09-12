"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../db/supabase-browser";

interface OwnRequest {
  id: number;
  reference: string;
  service_type: string;
  location: string;
  start_date: string;
  start_time: string;
  status: string;
  quote_status: string;
  quote_currency: string;
  quote_amount: number | null;
  quote_breakdown: string[];
  quote_expires_at: string | null;
  reviewed_at: string | null;
  accepted_at: string | null;
  assigned_at: string | null;
  completed_at: string | null;
}

export function AccountDashboard({ email }: { email: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<OwnRequest[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const result = await supabase
      .from("safemy_protection_requests")
      .select("id, reference, service_type, location, start_date, start_time, status, quote_status, quote_currency, quote_amount, quote_breakdown, quote_expires_at, reviewed_at, accepted_at, assigned_at, completed_at")
      .order("created_at", { ascending: false });
    if (result.error) {
      // Keep existing accounts readable while an operator is applying the
      // first-release Supabase migration.
      const fallback = await supabase.from("safemy_protection_requests").select("id, reference, service_type, location, start_date, start_time, status").order("created_at", { ascending: false });
      if (fallback.error) setError(fallback.error.message);
      setRows(((fallback.data as Array<Record<string, unknown>>) ?? []).map((row) => ({
        id: Number(row.id), reference: String(row.reference ?? ""), service_type: String(row.service_type ?? ""), location: String(row.location ?? ""),
        start_date: String(row.start_date ?? ""), start_time: String(row.start_time ?? ""), status: String(row.status ?? "pending_review"),
        quote_status: "pending", quote_currency: "MYR", quote_amount: null, quote_breakdown: [], quote_expires_at: null,
        reviewed_at: null, accepted_at: null, assigned_at: null, completed_at: null,
      })));
      return;
    }
    setRows((result.data as OwnRequest[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function getTrackingLink(id: number) {
    setBusyId(id);
    setError("");
    const response = await fetch(`/api/account/requests/${id}/tracking-link`, { method: "POST" });
    const data = await response.json() as { token?: string; error?: string };
    setBusyId(null);
    if (!response.ok || !data.token) {
      setError(data.error ?? "Couldn't create a tracking link.");
      return;
    }
    router.push(`/track/${data.token}`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/account/login");
    router.refresh();
  }

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY ACCOUNT</span><h1>{email}</h1></div>
        <div><button className="tool-btn ghost" onClick={signOut}>Sign out</button></div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {!rows ? (
        <p className="form-note">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="tool-empty">No requests linked to this account yet. Requests you submit while signed in will show up here.</p>
      ) : (
        <div className="admin-cards">
          {rows.map((r) => (
            <div key={r.id} className="admin-request-card">
              <div className="admin-request-head">
                <div><b>{r.reference}</b><small>{r.service_type} · {r.location}</small></div>
                <span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span>
              </div>
              <div className="admin-request-body">
                <p>{r.start_date} {r.start_time}</p>
                {r.quote_status === "issued" && r.quote_amount !== null && <div className="account-quote"><b>{r.quote_currency} {Number(r.quote_amount).toFixed(2)}</b><small>{(r.quote_breakdown ?? []).join(" · ")}</small>{r.quote_expires_at && <em>Valid until {new Date(r.quote_expires_at).toLocaleString()}</em>}</div>}
                <BookingMilestones request={r} />
              </div>
              <div className="admin-request-actions">
                <button className="tool-btn primary" disabled={busyId === r.id} onClick={() => getTrackingLink(r.id)}>
                  {busyId === r.id ? "Creating link…" : "Get tracking link →"}
                </button>
              </div>
              <p className="form-note">Generating a new link invalidates any previous one you shared.</p>
              {r.status === "completed" && <ReviewForm requestId={r.id} />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function BookingMilestones({ request }: { request: OwnRequest }) {
  const items = [["Reviewed", request.reviewed_at], ["Accepted", request.accepted_at], ["Personnel assigned", request.assigned_at], ["Completed", request.completed_at]] as const;
  return <div className="account-milestones">{items.filter(([, at]) => at).map(([label, at]) => <span key={label}><b>{label}</b><small>{new Date(at as string).toLocaleString()}</small></span>)}</div>;
}

function ReviewForm({ requestId }: { requestId: number }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending");
    const response = await fetch(`/api/account/requests/${requestId}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: Number(rating), comment }) });
    setState(response.ok ? "done" : "error");
  }
  if (state === "done") return <p className="form-success">Thanks — your private review was recorded.</p>;
  return <form className="review-form" onSubmit={submit}><b>How did this assignment go?</b><div><select value={rating} onChange={(event) => setRating(event.target.value)} aria-label="Rating"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Optional comment" maxLength={500} /><button className="tool-btn ghost" disabled={state === "sending"}>{state === "sending" ? "Saving…" : "Submit review"}</button></div>{state === "error" && <small className="form-error">Review could not be saved. You may already have reviewed this job.</small>}</form>;
}
