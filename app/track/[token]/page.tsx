"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { SiteNav } from "../../components/SiteNav";
import { SiteFooter } from "../../components/SiteFooter";
import { haversineKm } from "../../../db/matching";
import { GoogleLiveMap } from "../../components/GoogleLiveMap";
import { googleEarthAreaUrl, googleMapsDirectionsUrl, googleMapsSearchUrl } from "../../../db/google-maps";

interface TrackingLocation {
  actor_type: "customer" | "personnel";
  lat: number;
  lng: number;
  accuracy_m: number | null;
  updated_at: string;
  battery_percent: number | null;
  heading_deg: number | null;
  speed_mps: number | null;
}

interface BookingEvent { event_type: string; label: string; metadata: Record<string, unknown>; created_at: string; }

interface TrackingSnapshot {
  job: {
    reference: string;
    service_type: string;
    location: string;
    status: string;
    assigned_agency_name: string;
    assigned_personnel_name: string;
    tracking_enabled: boolean;
    tracking_started_at: string | null;
    tracking_ended_at: string | null;
    start_date: string;
    start_time: string;
    quote_status: string;
    quote_currency: string;
    quote_amount: number | null;
    quote_breakdown: string[];
    quote_issued_at: string | null;
    quote_expires_at: string | null;
    reviewed_at: string | null;
    accepted_at: string | null;
    assigned_at: string | null;
    completed_at: string | null;
    declined_at: string | null;
    cancelled_at: string | null;
  };
  locations: TrackingLocation[];
  events: BookingEvent[];
  serverTime: string;
}

export default function TrackingPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [snapshot, setSnapshot] = useState<TrackingSnapshot | null>(null);
  const [error, setError] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"waiting" | "live" | "denied">("waiting");
  const lastSentAt = useRef(0);

  const load = useCallback(async () => {
    const response = await fetch(`/api/tracking/${token}`, { cache: "no-store" });
    const data = await response.json() as TrackingSnapshot & { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Unable to load this tracking link.");
      return;
    }
    setSnapshot(data);
    setError("");
  }, [token]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 4000);
    return () => window.clearInterval(timer);
  }, [load]);

  const trackingActive = Boolean(snapshot?.job.tracking_enabled && ["accepted", "in_progress"].includes(snapshot.job.status));

  useEffect(() => {
    if (!trackingActive || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        setGpsStatus("live");
        const now = Date.now();
        if (now - lastSentAt.current < 4000) return;
        lastSentAt.current = now;
        await fetch(`/api/tracking/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy }),
        });
        load();
      },
      () => setGpsStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [load, token, trackingActive]);

  const customer = snapshot?.locations.find((location) => location.actor_type === "customer");
  const personnel = snapshot?.locations.find((location) => location.actor_type === "personnel");
  const distance = useMemo(() => customer && personnel ? haversineKm(customer, personnel) : null, [customer, personnel]);
  const eta = distance === null ? null : Math.max(1, Math.ceil(distance * 2.2));
  const mapsUrl = customer && personnel
    ? googleMapsDirectionsUrl(personnel, customer)
    : customer || personnel
      ? googleMapsSearchUrl(customer ?? personnel as TrackingLocation)
      : "https://www.google.com/maps/@?api=1&map_action=map&center=3.1390%2C101.6869&zoom=11";
  const googleMapsEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const areaPoint = customer ?? personnel;
  const isFresh = (location?: TrackingLocation) => location ? Date.now() - new Date(location.updated_at).getTime() < 15000 : false;

  return (
    <main>
      <SiteNav />
      <section className="tracking-hero shell">
        <span className="kicker">SAFEMY LIVE ASSIGNMENT · PRIVATE</span>
        <h1>One job.<br />One synchronized view.</h1>
        <p>Customer and assigned personnel locations use the same server-backed job record, timestamp and status.</p>
      </section>

      <section className="shell tracking-shell">
        {error ? <div className="confirmation-card"><h2>Tracking unavailable.</h2><p>{error}</p></div> : !snapshot ? <p className="form-note">Loading your private assignment…</p> : <>
          <div className="tracking-job-head">
            <div><small>{snapshot.job.reference}</small><h2>{snapshot.job.service_type}</h2><p>{snapshot.job.location} · {snapshot.job.start_date} at {snapshot.job.start_time}</p></div>
            <span className={`status-pill status-${snapshot.job.status}`}>{snapshot.job.status.replace("_", " ")}</span>
          </div>

          {snapshot.job.quote_status === "issued" && snapshot.job.quote_amount !== null && <div className="quote-card"><div><span className="kicker">QUOTE READY · {snapshot.job.quote_currency}</span><h3>{snapshot.job.quote_currency} {Number(snapshot.job.quote_amount).toFixed(2)}</h3><p>Review the line items below. The pilot does not collect payment through SafeMY.</p></div><ul>{(snapshot.job.quote_breakdown ?? []).map((line) => <li key={line}>{line}</li>)}</ul>{snapshot.job.quote_expires_at && <small>Quote valid until {new Date(snapshot.job.quote_expires_at).toLocaleString()}</small>}</div>}

          {!trackingActive ? <div className="tracking-wait-card"><span>{snapshot.job.status === "completed" ? "✓" : "…"}</span><div><h3>{snapshot.job.status === "completed" ? "Assignment completed" : "Waiting for acceptance"}</h3><p>{snapshot.job.status === "completed" ? "Live location sharing has ended for both parties." : "This page activates automatically after a licensed agency accepts the job and assigns personnel."}</p></div></div> : <>
            <div className="shared-map">
              {googleMapsEnabled ? <GoogleLiveMap customer={customer} personnel={personnel} personnelName={snapshot.job.assigned_personnel_name} /> : <>
                <span className="shared-map-road road-a"/><span className="shared-map-road road-b"/><span className="shared-route"/>
                <div className={`shared-pin personnel ${isFresh(personnel) ? "fresh" : ""}`}><i>{snapshot.job.assigned_personnel_name ? snapshot.job.assigned_personnel_name.split(" ").map((part) => part[0]).join("").slice(0, 2) : "PRO"}</i><b>{snapshot.job.assigned_personnel_name || "Assigned personnel"}</b><small>{isFresh(personnel) ? "Live now" : "Waiting for GPS"}</small></div>
                <div className={`shared-pin customer ${isFresh(customer) ? "fresh" : ""}`}><i>YOU</i><b>Your location</b><small>{gpsStatus === "denied" ? "Permission needed" : isFresh(customer) ? "Live now" : "Starting GPS"}</small></div>
              </>}
              <div className="shared-distance"><small>LIVE DISTANCE</small><b>{distance === null ? "—" : `${distance.toFixed(2)} km`}</b><span>{eta === null ? "Waiting for both locations" : `Approx. ${eta} min ETA`}</span></div>
            </div>

            <div className="google-maps-actions"><div><b>Google Maps &amp; Earth</b><span>{googleMapsEnabled ? "Map and satellite views are available above" : "The live route opens securely in Google Maps"}. Earth is an optional area-planning view, not the live tracker.</span></div><div className="google-maps-action-buttons"><a className="google-maps-link primary" href={mapsUrl} target="_blank" rel="noreferrer">{customer && personnel ? "Open live route" : "Open live location"} ↗</a>{areaPoint && <a className="google-maps-link" href={googleEarthAreaUrl(areaPoint)} target="_blank" rel="noreferrer">Open 3D area ↗</a>}</div></div>

            <div className="shared-sync-grid">
              <LocationStatus label="Customer" location={customer} fresh={isFresh(customer)} />
              <LocationStatus label="Personnel" location={personnel} fresh={isFresh(personnel)} />
            </div>
            {gpsStatus === "denied" && <p className="form-error">Allow location access in your browser so the assigned personnel can see your live pickup position.</p>}
          </>}

          <div className="tracking-details">
            <div><small>Agency</small><b>{snapshot.job.assigned_agency_name || "Pending assignment"}</b></div>
            <div><small>Personnel</small><b>{snapshot.job.assigned_personnel_name || "Pending assignment"}</b></div>
            <div><small>Last server sync</small><b>{new Date(snapshot.serverTime).toLocaleTimeString()}</b></div>
          </div>
          <BookingTimeline events={snapshot.events ?? []} job={snapshot.job} />
          <p className="tracking-privacy">Private link · Do not share it publicly. Location updates are accepted only while this assignment is active and stop automatically when it is completed or cancelled. <a href="/support">Need help or want to dispute something? Open support →</a></p>
        </>}
      </section>
      <SiteFooter />
    </main>
  );
}

function LocationStatus({ label, location, fresh }: { label: string; location?: TrackingLocation; fresh: boolean }) {
  return <div><span className={`sync-dot ${label === "Personnel" ? "personnel" : ""} ${fresh ? "fresh" : ""}`}/><div><small>{label} GPS</small><b>{fresh ? "Live and synchronized" : location ? "Signal delayed" : "Waiting for first update"}</b><em>{location ? `${new Date(location.updated_at).toLocaleTimeString()}${location.battery_percent !== null && location.battery_percent !== undefined ? ` · ${Math.round(Number(location.battery_percent))}% battery` : ""}` : "—"}</em></div></div>;
}

function BookingTimeline({ events, job }: { events: BookingEvent[]; job: TrackingSnapshot["job"] }) {
  const fallback = [
    { label: "Request received", at: null },
    { label: "Reviewed", at: job.reviewed_at },
    { label: "Agency accepted", at: job.accepted_at },
    { label: "Personnel assigned", at: job.assigned_at },
    { label: "Completed", at: job.completed_at },
  ];
  return <section className="booking-timeline"><div><span className="kicker">BOOKING RECORD</span><h3>Every hand-off is timestamped</h3></div>{events.length > 0 ? <ol>{events.map((event, index) => <li key={`${event.created_at}-${index}`}><span className="timeline-dot"/><div><b>{event.label}</b><small>{new Date(event.created_at).toLocaleString()}</small></div></li>)}</ol> : <ol>{fallback.filter((item) => item.at || item.label === "Request received").map((item) => <li key={item.label}><span className="timeline-dot"/><div><b>{item.label}</b><small>{item.at ? new Date(item.at).toLocaleString() : "Recorded when submitted"}</small></div></li>)}</ol>}</section>;
}
