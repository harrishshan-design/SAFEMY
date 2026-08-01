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
  customer_gender: string;
  personnel_gender_preference: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  assigned_personnel_id: number | null;
  assigned_personnel_name: string;
  tracking_enabled: boolean;
  notes: string;
  status: string;
  created_at: string;
}

interface Personnel {
  id: number;
  agency_id: number;
  full_name: string;
  email: string | null;
  gender: string;
  role: string;
  service_types: string[];
  verified: boolean;
  available: boolean;
  rating: number;
  years_experience: number;
  last_lat: number | null;
  last_lng: number | null;
  location_updated_at: string | null;
  invited_at: string | null;
  claimed_at: string | null;
}

export function AgencyDashboard({ agencyId, agencyName }: { agencyId: number; agencyName: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<AssignedRequest[] | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const [requestsResult, personnelResult] = await Promise.all([
      supabase.from("safemy_protection_requests").select("*").eq("assigned_agency_id", agencyId).order("created_at", { ascending: false }),
      supabase.from("safemy_personnel").select("*").eq("agency_id", agencyId).order("available", { ascending: false }).order("full_name"),
    ]);
    const loadError = requestsResult.error ?? personnelResult.error;
    if (loadError) setError(loadError.message);
    setRows((requestsResult.data as AssignedRequest[]) ?? []);
    setPersonnel((personnelResult.data as Personnel[]) ?? []);
  }, [supabase, agencyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(id: number, action: "accept" | "decline") {
    setBusyId(id);
    setError("");
    setNotice("");
    const response = await fetch(`/api/agency/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json() as { error?: string; matchedPersonnel?: { full_name: string } };
    if (!response.ok) setError(data.error ?? "Unable to update this job.");
    else if (data.matchedPersonnel) setNotice(`Matched ${data.matchedPersonnel.full_name}: gender preference priority, then nearest live distance.`);
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
  const personnelById = new Map((personnel ?? []).map((p) => [p.id, p]));

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY PARTNER PORTAL</span><h1>{agencyName}</h1></div>
        <div><span>Verified partner</span><button className="tool-btn ghost" onClick={signOut}>Sign out</button></div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {notice && <p className="form-success">{notice}</p>}
      <PersonnelRoster personnel={personnel} onChange={load} />
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
                    <p className="matching-priority"><b>Matching priority:</b> {formatGenderPreference(r.personnel_gender_preference, r.customer_gender)} · nearest verified available personnel next</p>
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
                <thead><tr><th>Reference</th><th>Service</th><th>Location</th><th>When</th><th>Assigned personnel</th><th>Status</th><th>Live location</th></tr></thead>
                <tbody>
                  {active.map((r) => (
                    <tr key={r.id}>
                      <td>{r.reference}</td><td>{r.service_type}</td><td>{r.location}</td>
                      <td>{r.start_date} {r.start_time} ({r.duration_hours}h)</td>
                      <td>{r.assigned_personnel_name || "Awaiting roster match"}<br/><small>{formatGenderPreference(r.personnel_gender_preference, r.customer_gender)}</small></td>
                      <td><span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span></td>
                      <td><PersonnelLocationStatus personnel={r.assigned_personnel_id !== null ? personnelById.get(r.assigned_personnel_id) : undefined} /></td>
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

function formatGenderPreference(preference: string, customerGender: string) {
  if (preference === "same_gender") return customerGender === "prefer_not_to_say" ? "No gender priority" : `Same gender (${customerGender.replace("_", " ")}) first`;
  if (preference === "female") return "Female personnel first";
  if (preference === "male") return "Male personnel first";
  return "No gender preference";
}

// Read-only: the assigned guard shares their own live position from their
// personnel account (see /personnel). The agency dashboard just reflects it.
function PersonnelLocationStatus({ personnel }: { personnel: Personnel | undefined }) {
  if (!personnel) return <small className="form-note" style={{ margin: 0 }}>Awaiting assignment</small>;
  if (!personnel.location_updated_at) return <small className="form-note" style={{ margin: 0 }}>Not sharing yet</small>;
  const seconds = Math.max(0, Math.round((Date.now() - new Date(personnel.location_updated_at).getTime()) / 1000));
  const label = seconds < 60 ? "just now" : seconds < 3600 ? `${Math.round(seconds / 60)}m ago` : `${Math.round(seconds / 3600)}h ago`;
  const fresh = seconds < 120;
  return <span className={`tool-btn ${fresh ? "live" : "ghost"}`} style={{ pointerEvents: "none", padding: "6px 10px", fontSize: "10.5px" }}>{fresh ? "Live" : "Stale"} · {label}</span>;
}

function PersonnelRoster({
  personnel,
  onChange,
}: {
  personnel: Personnel[] | null;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resendingId, setResendingId] = useState<number | null>(null);

  async function addPersonnel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage("");
    const form = new FormData(formElement);
    const response = await fetch("/api/agency/personnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        email: form.get("email"),
        gender: form.get("gender"),
        role: form.get("role"),
        serviceType: form.get("serviceType"),
        experience: Number(form.get("experience") ?? 0),
      }),
    });
    const data = await response.json() as { error?: string; invited?: boolean };
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "Could not add personnel.");
      return;
    }
    setMessage(data.invited ? "Personnel added — invite email sent." : "Personnel added, but the invite email couldn't be sent (email isn't configured yet). Use Resend invite once it is.");
    formElement.reset();
    onChange();
  }

  async function resendInvite(id: number) {
    setResendingId(id);
    setMessage("");
    const response = await fetch(`/api/agency/personnel/${id}/invite`, { method: "PATCH" });
    const data = await response.json() as { error?: string; invited?: boolean };
    setResendingId(null);
    setMessage(!response.ok ? (data.error ?? "Could not resend invite.") : data.invited ? "Invite re-sent." : "Invite updated, but the email couldn't be sent.");
    onChange();
  }

  return <section className="agency-roster">
    <div className="agency-roster-head">
      <div><span className="kicker">PERSONNEL ROSTER</span><h2>Available team</h2><p>Same-gender preference is ranked first, then the nearest available verified person. Each guard sets up their own login from the invite email and shares their own live location during active jobs.</p></div>
      <button className="tool-btn primary" onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Add personnel"}</button>
    </div>
    {open && <form className="roster-form" onSubmit={addPersonnel}>
      <label>Full name<input name="fullName" required /></label>
      <label>Email (for their invite)<input name="email" type="email" required /></label>
      <label>Gender<select name="gender" required><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option></select></label>
      <label>Role<input name="role" required placeholder="Close Protection Officer"/></label>
      <label>Primary service<select name="serviceType"><option>Personal Bodyguard</option><option>Security Driver</option><option>Event Security</option><option>Female Protection</option></select></label>
      <label>Experience (years)<input name="experience" type="number" min="0" defaultValue="1"/></label>
      <button className="tool-btn primary" disabled={busy}>{busy ? "Adding…" : "Add & send invite"}</button>
    </form>}
    {message && <p className="form-note">{message}</p>}
    {!personnel ? <p className="form-note">Loading roster…</p> : personnel.length === 0 ? <p className="tool-empty">Add verified personnel before accepting jobs so SafeMY can match by gender priority and live distance.</p> : <div className="roster-chips">{personnel.map((person) => <div key={person.id}><span>{person.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><p><b>{person.full_name}</b><small>{person.gender.replace("_", " ")} · {person.role}</small><em>{person.claimed_at ? "Account active" : person.invited_at ? "Invited — awaiting signup" : "Not invited"}</em>{!person.claimed_at && person.email && <button type="button" className="tool-btn ghost" style={{ marginTop: 6, fontSize: "10px", padding: "5px 9px" }} disabled={resendingId === person.id} onClick={() => resendInvite(person.id)}>{resendingId === person.id ? "Sending…" : "Resend invite"}</button>}</p></div>)}</div>}
  </section>;
}
