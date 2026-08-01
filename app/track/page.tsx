"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { LiveMap } from "../components/LiveMap";

interface TrackedRequest {
  reference: string;
  status: string;
  service_type: string;
  location: string;
  start_date: string;
  start_time: string;
  assigned_agency_name: string | null;
  live_lat: number | null;
  live_lng: number | null;
  live_updated_at: string | null;
}

const POLL_MS = 20_000;
const STALE_AFTER_MS = 3 * 60_000;

export default function TrackPage() {
  return (
    <main>
      <SiteNav />
      <section className="form-hero shell">
        <span className="kicker">KLANG VALLEY PILOT · EARLY ACCESS</span>
        <h1>Track your request.</h1>
        <p>Enter your reference and the email you booked with. If an officer has been assigned and has turned on location sharing, you&apos;ll see their live position below.</p>
      </section>

      <section className="shell form-shell">
        <EmergencyBanner />
        <Suspense fallback={null}>
          <TrackForm />
        </Suspense>
      </section>

      <SiteFooter />
    </main>
  );
}

function TrackForm() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState(searchParams.get("ref") ?? "");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackedRequest | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchStatus(ref: string, mail: string, { silent = false } = {}) {
    if (!silent) setStatus("loading");
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref, email: mail }),
      });
      const data = (await res.json()) as { request?: TrackedRequest; error?: string };
      if (!res.ok || !data.request) throw new Error(data.error ?? "Couldn't find that request.");
      setResult(data.request);
      setStatus("done");
      setError("");
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Couldn't find that request.");
        setStatus("error");
      }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetchStatus(reference, email);
  }

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (status === "done" && result && ["accepted", "in_progress"].includes(result.status)) {
      pollRef.current = setInterval(() => fetchStatus(reference, email, { silent: true }), POLL_MS);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, result?.status]);

  return (
    <>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field"><span>Reference</span>
            <input value={reference} onChange={(e) => setReference(e.target.value)} required placeholder="SM-XXXXXXXX" />
          </label>
          <label className="field"><span>Email used to book</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </label>
        </div>
        {status === "error" && <p className="form-error">{error}</p>}
        <button className="form-submit" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Looking up…" : "Track request →"}
        </button>
      </form>

      {result && <TrackResult data={result} />}
    </>
  );
}

const STATUS_COPY: Record<string, string> = {
  pending_review: "We're reviewing your request and haven't assigned an officer yet.",
  assigned: "An agency has been assigned and is confirming availability.",
  accepted: "Your officer has accepted the job.",
  in_progress: "Your job is currently in progress.",
  completed: "This job has been completed.",
  declined: "This request was declined. Our team will follow up or re-assign it.",
  cancelled: "This request was cancelled.",
};

function TrackResult({ data }: { data: TrackedRequest }) {
  const isActive = data.status === "accepted" || data.status === "in_progress";
  const isStale = data.live_updated_at ? Date.now() - new Date(data.live_updated_at).getTime() > STALE_AFTER_MS : false;

  return (
    <div className="track-card">
      <h2>{data.reference}</h2>
      <p className="track-meta">
        {data.service_type} · {data.location} · {data.start_date} {data.start_time}
        {data.assigned_agency_name && <> · Assigned to {data.assigned_agency_name}</>}
      </p>
      <p><span className={`status-pill status-${data.status}`}>{data.status.replace("_", " ")}</span></p>
      <p className="form-note">{STATUS_COPY[data.status] ?? ""}</p>

      {isActive && (
        <>
          {data.live_lat != null && data.live_lng != null ? (
            <>
              {isStale && (
                <p className="form-error">
                  This position hasn&apos;t updated in a while — the officer&apos;s tab may have closed or their phone may have locked. It may not reflect their current location.
                </p>
              )}
              <LiveMap lat={data.live_lat} lng={data.live_lng} destination={data.location} updatedAt={data.live_updated_at} />
            </>
          ) : (
            <p className="tool-empty">Your officer hasn&apos;t turned on live location sharing yet.</p>
          )}
        </>
      )}
    </div>
  );
}
