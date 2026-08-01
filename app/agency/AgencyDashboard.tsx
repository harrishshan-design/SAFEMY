"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY PARTNER PORTAL</span><h1>{agencyName}</h1></div>
        <div><span>Verified partner</span><button className="tool-btn ghost" onClick={signOut}>Sign out</button></div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {notice && <p className="form-success">{notice}</p>}
      <PersonnelRoster agencyId={agencyId} personnel={personnel} supabase={supabase} onChange={load} />
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
                <thead><tr><th>Reference</th><th>Service</th><th>Location</th><th>When</th><th>Assigned personnel</th><th>Status</th><th>Live tracking</th></tr></thead>
                <tbody>
                  {active.map((r) => (
                    <tr key={r.id}>
                      <td>{r.reference}</td><td>{r.service_type}</td><td>{r.location}</td>
                      <td>{r.start_date} {r.start_time} ({r.duration_hours}h)</td>
                      <td>{r.assigned_personnel_name || "Awaiting roster match"}<br/><small>{formatGenderPreference(r.personnel_gender_preference, r.customer_gender)}</small></td>
                      <td><span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span></td>
                      <td><PersonnelTracker requestId={r.id} enabled={r.tracking_enabled} /></td>
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

function PersonnelRoster({
  agencyId,
  personnel,
  supabase,
  onChange,
}: {
  agencyId: number;
  personnel: Personnel[] | null;
  supabase: ReturnType<typeof createSupabaseBrowserClient>;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function addPersonnel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage("");
    const form = new FormData(formElement);
    let point: GeolocationPosition | null = null;
    if (navigator.geolocation) {
      point = await new Promise((resolve) => navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }));
    }
    const { error } = await supabase.from("safemy_personnel").insert({
      agency_id: agencyId,
      full_name: String(form.get("fullName") ?? "").trim(),
      gender: String(form.get("gender") ?? ""),
      role: String(form.get("role") ?? "").trim(),
      service_types: [String(form.get("serviceType") ?? "")],
      years_experience: Number(form.get("experience") ?? 0),
      verified: true,
      available: true,
      last_lat: point?.coords.latitude ?? null,
      last_lng: point?.coords.longitude ?? null,
      location_updated_at: point ? new Date().toISOString() : null,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage(point ? "Personnel added with a live matching location." : "Personnel added. Update their GPS before using nearest matching.");
    formElement.reset();
    onChange();
  }

  return <section className="agency-roster">
    <div className="agency-roster-head"><div><span className="kicker">LIVE PERSONNEL ROSTER</span><h2>Available team</h2><p>Same-gender preference is ranked first, then the nearest available verified person.</p></div><button className="tool-btn primary" onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Add personnel"}</button></div>
    {open && <form className="roster-form" onSubmit={addPersonnel}><label>Full name<input name="fullName" required /></label><label>Gender<select name="gender" required><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option></select></label><label>Role<input name="role" required placeholder="Close Protection Officer"/></label><label>Primary service<select name="serviceType"><option>Personal Bodyguard</option><option>Security Driver</option><option>Event Security</option><option>Female Protection</option></select></label><label>Experience (years)<input name="experience" type="number" min="0" defaultValue="1"/></label><button className="tool-btn primary" disabled={busy}>{busy ? "Adding…" : "Add with current GPS"}</button></form>}
    {message && <p className="form-note">{message}</p>}
    {!personnel ? <p className="form-note">Loading roster…</p> : personnel.length === 0 ? <p className="tool-empty">Add verified personnel before accepting jobs so SafeMY can match by gender priority and live distance.</p> : <div className="roster-chips">{personnel.map((person) => <div key={person.id}><span>{person.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><p><b>{person.full_name}</b><small>{person.gender.replace("_", " ")} · {person.role}</small><em>{person.last_lat !== null ? "GPS ready" : "GPS needed"}</em></p></div>)}</div>}
  </section>;
}

function PersonnelTracker({ requestId, enabled }: { requestId: number; enabled: boolean }) {
  const [status, setStatus] = useState<"idle" | "starting" | "live" | "error">("idle");
  const watchId = useRef<number | null>(null);
  const lastSentAt = useRef(0);

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  function stop() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setStatus("idle");
  }

  function start() {
    if (!enabled || !navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("starting");
    watchId.current = navigator.geolocation.watchPosition(async (position) => {
      const now = Date.now();
      if (now - lastSentAt.current < 4000) return;
      lastSentAt.current = now;
      const response = await fetch(`/api/agency/requests/${requestId}/location`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy }) });
      setStatus(response.ok ? "live" : "error");
    }, () => setStatus("error"), { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 });
  }

  return <div className="personnel-tracker"><button className={`tool-btn ${status === "live" ? "live" : "ghost"}`} onClick={status === "live" ? stop : start} disabled={!enabled || status === "starting"}>{status === "live" ? "GPS live · Stop" : status === "starting" ? "Starting GPS…" : "Start live GPS"}</button>{status === "error" && <small>Allow location access and retry.</small>}</div>;
}
