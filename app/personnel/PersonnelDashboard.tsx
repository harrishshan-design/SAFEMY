"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../db/supabase-browser";

interface AssignedJob {
  id: number;
  reference: string;
  service_type: string;
  location: string;
  start_date: string;
  start_time: string;
  duration_hours: number;
  status: string;
  tracking_enabled: boolean;
  assigned_agency_name: string;
}

export function PersonnelDashboard({ personnelId, fullName }: { personnelId: number; fullName: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<AssignedJob[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("safemy_protection_requests")
      .select("id, reference, service_type, location, start_date, start_time, duration_hours, status, tracking_enabled, assigned_agency_name")
      .eq("assigned_personnel_id", personnelId)
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    setRows((data as AssignedJob[]) ?? []);
  }, [supabase, personnelId]);

  useEffect(() => {
    load();
  }, [load]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/personnel/login");
    router.refresh();
  }

  const active = (rows ?? []).filter((r) => r.status === "accepted" || r.status === "in_progress");
  const history = (rows ?? []).filter((r) => r.status === "completed");

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY PERSONNEL</span><h1>{fullName}</h1></div>
        <div><span>Verified personnel</span><button className="tool-btn ghost" onClick={signOut}>Sign out</button></div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {!rows ? (
        <p className="form-note">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="tool-empty">No jobs assigned to you yet. Your agency will assign jobs from their roster when you match a customer's request.</p>
      ) : (
        <>
          <h2 className="agency-section-heading">Active ({active.length})</h2>
          {active.length === 0 ? <p className="tool-empty">Nothing active right now.</p> : (
            <div className="admin-cards">
              {active.map((r) => (
                <div key={r.id} className="admin-request-card">
                  <div className="admin-request-head">
                    <div><b>{r.reference}</b><small>{r.service_type} · {r.location} · {r.assigned_agency_name}</small></div>
                    <span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span>
                  </div>
                  <div className="admin-request-body">
                    <p>{r.start_date} {r.start_time} · {r.duration_hours}h</p>
                  </div>
                  <LocationShareButton requestId={r.id} trackingEnabled={r.tracking_enabled} />
                </div>
              ))}
            </div>
          )}

          <h2 className="agency-section-heading">Completed ({history.length})</h2>
          {history.length === 0 ? <p className="tool-empty">No completed jobs yet.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Reference</th><th>Service</th><th>Location</th><th>When</th></tr></thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td>{r.reference}</td><td>{r.service_type}</td><td>{r.location}</td>
                      <td>{r.start_date} {r.start_time}</td>
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

const MIN_UPDATE_INTERVAL_MS = 4_000;

function LocationShareButton({ requestId, trackingEnabled }: { requestId: number; trackingEnabled: boolean }) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPostRef = useRef(0);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  function start() {
    if (!trackingEnabled) {
      setError("Live tracking isn't active for this job yet.");
      return;
    }
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
          const res = await fetch(`/api/personnel/requests/${requestId}/location`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
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
      { enableHighAccuracy: true, maximumAge: 3_000, timeout: 12_000 },
    );
  }

  function stop() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
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
          : "Turning this on lets the customer see your live position on the map for this job."}
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="admin-request-actions">
        {sharing ? (
          <button className="tool-btn live" onClick={stop}>Sharing live · Stop</button>
        ) : (
          <button className="tool-btn primary" onClick={start} disabled={!trackingEnabled}>Share my live location</button>
        )}
        {lastSharedLabel && <span className="form-note" style={{ margin: 0 }}>Last shared: {lastSharedLabel}</span>}
      </div>
    </div>
  );
}
