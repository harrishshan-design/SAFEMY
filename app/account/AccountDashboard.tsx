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
}

export function AccountDashboard({ email }: { email: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<OwnRequest[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("safemy_protection_requests")
      .select("id, reference, service_type, location, start_date, start_time, status")
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    setRows((data as OwnRequest[]) ?? []);
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
              </div>
              <div className="admin-request-actions">
                <button className="tool-btn primary" disabled={busyId === r.id} onClick={() => getTrackingLink(r.id)}>
                  {busyId === r.id ? "Creating link…" : "Get tracking link →"}
                </button>
              </div>
              <p className="form-note">Generating a new link invalidates any previous one you shared.</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
