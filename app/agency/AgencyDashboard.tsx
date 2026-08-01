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
  notes: string;
  status: string;
  live_updated_at: string | null;
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
            <div className="admin-cards">
              {active.map((r) => (
                <div key={r.id} className="admin-request-card">
                  <div className="admin-request-head">
                    <div><b>{r.reference}</b><small>{r.service_type} · {r.location}</small></div>
                    <span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span>
                  </div>
                  <div className="admin-request-body">
                    <p>{r.start_date} {r.start_time} · {r.duration_hours}h</p>
                  </div>
                  <LocationShareButton requestId={r.id} initialLiveUpdatedAt={r.live_updated_at} />
                </div>
              ))}
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

// Minimum time between position updates sent to the server, regardless of
// how often the browser's GPS fires — avoids hammering the API on jitter.
const MIN_UPDATE_INTERVAL_MS = 15_000;

function LocationShareButton({ requestId, initialLiveUpdatedAt }: { requestId: number; initialLiveUpdatedAt: string | null }) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [lastSentAt, setLastSentAt] = useState<Date | null>(
    initialLiveUpdatedAt ? new Date(initialLiveUpdatedAt) : null,
  );
  const [, forceTick] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const lastPostRef = useRef(0);

  // Re-render once a minute so the "last shared Xm ago" text stays fresh.
  useEffect(() => {
    const id = window.setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  function start() {
    if (!("geolocation" in navigator)) {
      setError("This browser doesn't support location sharing.");
      return;
    }
    setError("");
    setSharing(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - lastPostRef.current < MIN_UPDATE_INTERVAL_MS) return;
        lastPostRef.current = now;
        try {
          const res = await fetch(`/api/agency/requests/${requestId}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          if (res.ok) {
            setLastSentAt(new Date());
            setError("");
          } else {
            const body = (await res.json().catch(() => ({}))) as { error?: string };
            setError(body.error ?? "Couldn't send your location just now — retrying.");
          }
        } catch {
          setError("Couldn't reach SafeMY just now — retrying.");
        }
      },
      (geoError) => {
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission denied. Enable location access for this site in your browser settings."
            : "Couldn't get your location. Check your device's location settings.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
  }

  async function stop() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
    await fetch(`/api/agency/requests/${requestId}/location`, { method: "DELETE" }).catch(() => {});
    setLastSentAt(null);
  }

  const lastSharedLabel = (() => {
    if (!lastSentAt) return null;
    const seconds = Math.max(0, Math.round((Date.now() - lastSentAt.getTime()) / 1000));
    if (seconds < 60) return "just now";
    return `${Math.round(seconds / 60)} min ago`;
  })();

  return (
    <div className="location-share">
      <div className="honesty-note">
        {sharing
          ? "Sharing is on. Keep this tab open and your screen unlocked — sharing pauses if you switch apps, lock your screen, or close this tab."
          : "Turning this on lets the customer see your live position on a map for this job. It only works while this tab stays open on your phone."}
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="admin-request-actions">
        {sharing ? (
          <button className="tool-btn ghost" onClick={stop}>Stop sharing location</button>
        ) : (
          <button className="tool-btn primary" onClick={start}>Share my live location</button>
        )}
        {lastSharedLabel && <span className="form-note" style={{ margin: 0 }}>Last shared: {lastSharedLabel}</span>}
      </div>
    </div>
  );
}
