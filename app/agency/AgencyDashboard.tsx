"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../db/supabase-browser";

interface AssignedRequest {
  id: number;
  reference: string;
  service_type: string;
  location: string;
  start_date: string;
  start_time: string;
  duration_hours: number;
  professionals_count: number;
  notes: string;
  status: string;
  created_at: string;
}

export function AgencyDashboard({ agencyId, agencyName }: { agencyId: number; agencyName: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<AssignedRequest[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("safemy_protection_requests")
      .select("*")
      .eq("assigned_agency_id", agencyId)
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    setRows((data as AssignedRequest[]) ?? []);
  }, [supabase, agencyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(id: number, action: "accept" | "decline") {
    setBusyId(id);
    await fetch(`/api/agency/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusyId(null);
    load();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/agency/login");
    router.refresh();
  }

  const pending = (rows ?? []).filter((r) => r.status === "assigned");
  const active = (rows ?? []).filter((r) => r.status === "accepted" || r.status === "in_progress");
  const history = (rows ?? []).filter((r) => ["completed", "declined", "cancelled"].includes(r.status));

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY PARTNER PORTAL</span><h1>{agencyName}</h1></div>
        <div><span>Verified partner</span><button className="tool-btn ghost" onClick={signOut}>Sign out</button></div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {!rows ? (
        <p className="form-note">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="tool-empty">No jobs assigned yet. We&apos;ll notify you by email when SafeMY assigns you one.</p>
      ) : (
        <>
          <h2 className="agency-section-heading">Awaiting your response ({pending.length})</h2>
          {pending.length === 0 ? <p className="tool-empty">Nothing waiting on you right now.</p> : (
            <div className="admin-cards">
              {pending.map((r) => (
                <div key={r.id} className="admin-request-card">
                  <div className="admin-request-head">
                    <div><b>{r.reference}</b><small>{r.service_type} · {r.location}</small></div>
                    <span className={`status-pill status-${r.status}`}>{r.status}</span>
                  </div>
                  <div className="admin-request-body">
                    <p>{r.start_date} {r.start_time} · {r.duration_hours}h · {r.professionals_count} professional(s)</p>
                    {r.notes && <p className="form-note">{r.notes}</p>}
                  </div>
                  <div className="admin-request-actions">
                    <button className="tool-btn primary" disabled={busyId === r.id} onClick={() => respond(r.id, "accept")}>Accept</button>
                    <button className="tool-btn ghost" disabled={busyId === r.id} onClick={() => respond(r.id, "decline")}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="agency-section-heading">Active ({active.length})</h2>
          {active.length === 0 ? <p className="tool-empty">Nothing active right now.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Reference</th><th>Service</th><th>Location</th><th>When</th><th>Status</th></tr></thead>
                <tbody>
                  {active.map((r) => (
                    <tr key={r.id}>
                      <td>{r.reference}</td><td>{r.service_type}</td><td>{r.location}</td>
                      <td>{r.start_date} {r.start_time} ({r.duration_hours}h)</td>
                      <td><span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="agency-section-heading">History ({history.length})</h2>
          {history.length === 0 ? <p className="tool-empty">No completed or closed jobs yet.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Reference</th><th>Service</th><th>Location</th><th>When</th><th>Status</th></tr></thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td>{r.reference}</td><td>{r.service_type}</td><td>{r.location}</td>
                      <td>{r.start_date} {r.start_time}</td>
                      <td><span className={`status-pill status-${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
