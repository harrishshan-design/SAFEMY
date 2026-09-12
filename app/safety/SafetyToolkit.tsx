"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { googleMapsSearchUrl } from "../../db/google-maps";

type Guardian = { id: string; name: string; phone: string };
type LocationSnapshot = {
  lat: number;
  lng: number;
  accuracy: number;
  capturedAt: number;
};

const STORAGE_KEY = "safemy.guardians.v1";
const STORAGE_EVENT = "safemy-guardians-changed";
const EMPTY_GUARDIANS: Guardian[] = [];
let cachedRaw: string | null | undefined;
let cachedGuardians: Guardian[] = EMPTY_GUARDIANS;

function loadGuardians(): Guardian[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (g): g is Guardian =>
        !!g && typeof g === "object" &&
        typeof (g as Guardian).id === "string" &&
        typeof (g as Guardian).name === "string" &&
        typeof (g as Guardian).phone === "string",
    );
  } catch {
    return [];
  }
}

function guardianSnapshot() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedGuardians;
    cachedRaw = raw;
    cachedGuardians = loadGuardians();
    return cachedGuardians;
  } catch {
    return cachedGuardians;
  }
}

function subscribeToGuardians(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function subscribeToHydration() {
  return () => undefined;
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function smsHref(phone: string, body: string) {
  return `sms:${phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
}

function whatsappHref(phone: string, body: string) {
  const digits = phone.replace(/\D/g, "");
  const malaysiaNumber = digits.startsWith("0") ? `60${digits.slice(1)}` : digits;
  return `https://wa.me/${malaysiaNumber}?text=${encodeURIComponent(body)}`;
}

function directionsHref(location: LocationSnapshot | null, destination: string) {
  const params = new URLSearchParams({ api: "1", destination, travelmode: "walking" });
  if (location) params.set("origin", `${location.lat.toFixed(6)},${location.lng.toFixed(6)}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SafetyToolkit() {
  const guardians = useSyncExternalStore(subscribeToGuardians, guardianSnapshot, () => EMPTY_GUARDIANS);
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function persist(next: Guardian[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      cachedRaw = undefined;
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
      /* storage is unavailable in this browser session */
    }
  }

  function addGuardian(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) return;
    persist([...guardians, { id: crypto.randomUUID(), name: n, phone: p }]);
    setName("");
    setPhone("");
  }

  function removeGuardian(id: string) {
    persist(guardians.filter((g) => g.id !== id));
  }

  return (
    <>
      <GuardiansCard
        guardians={guardians}
        hydrated={hydrated}
        name={name}
        phone={phone}
        setName={setName}
        setPhone={setPhone}
        onAdd={addGuardian}
        onRemove={removeGuardian}
      />
      <JourneyCard guardians={guardians} />
    </>
  );
}

function GuardiansCard({
  guardians, hydrated, name, phone, setName, setPhone, onAdd, onRemove,
}: {
  guardians: Guardian[];
  hydrated: boolean;
  name: string;
  phone: string;
  setName: (v: string) => void;
  setPhone: (v: string) => void;
  onAdd: (e: React.FormEvent<HTMLFormElement>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="tool-card" id="guardians">
      <div className="tool-head">
        <span className="tool-num">01</span>
        <div>
          <h2>Choose a trusted person</h2>
          <p>Add someone you can contact before a journey. Their details stay on this device and are never uploaded to SafeMY.</p>
        </div>
      </div>

      <div className="honesty-note">
        Your trusted-person list is saved only in this browser. Clearing browser data or changing devices removes it.
      </div>

      <form className="guardian-form" onSubmit={onAdd}>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mak" required />
        </label>
        <label className="field">
          <span>Malaysian mobile number</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="e.g. 012-345 6789" required />
        </label>
        <button type="submit" className="tool-btn primary">Save person</button>
      </form>

      {!hydrated ? null : guardians.length === 0 ? (
        <p className="tool-empty">No trusted person saved yet. Add a parent, partner, housemate, or close friend to unlock one-tap journey messages.</p>
      ) : (
        <ul className="guardian-list">
          {guardians.map((g) => (
            <li key={g.id}>
              <div>
                <b>{g.name}</b>
                <small>{g.phone}</small>
              </div>
              <div className="guardian-actions">
                <a className="tool-btn" href={telHref(g.phone)}>Call</a>
                <a className="tool-btn" href={whatsappHref(g.phone, `Hi ${g.name}, I saved you as a trusted person in my SafeMY safety toolkit.`)} target="_blank" rel="noreferrer">WhatsApp</a>
                <button className="tool-btn ghost" onClick={() => onRemove(g.id)} aria-label={`Remove ${g.name}`}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function JourneyCard({ guardians }: { guardians: Guardian[] }) {
  const [minutes, setMinutes] = useState(25);
  const [destination, setDestination] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [overdue, setOverdue] = useState(false);
  const [startedAt, setStartedAt] = useState("");
  const [location, setLocation] = useState<LocationSnapshot | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [shareStatus, setShareStatus] = useState("");
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (deadline === null) return;
    const tick = () => {
      const secs = Math.round((deadline - Date.now()) / 1000);
      setRemaining(secs);
      if (secs <= 0) setOverdue(true);
    };
    tick();
    intervalRef.current = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalRef.current);
  }, [deadline]);

  useEffect(() => {
    const original = document.title;
    if (deadline !== null) {
      document.title = overdue ? "⚠ Journey check-in overdue — SafeMY" : `${formatClock(remaining)} — SafeMY Safe Journey`;
    }
    return () => {
      document.title = original;
    };
  }, [deadline, overdue, remaining]);

  const selectedGuardian = guardians.find((g) => g.id === guardianId) ?? guardians[0];
  const where = destination.trim();
  const expectedAt = deadline === null ? "" : new Date(deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const mapUrl = location ? googleMapsSearchUrl(location) : "";
  const locationSentence = mapUrl ? ` My latest location is ${mapUrl}.` : "";
  const journeyMessage = `I started a SafeMY Safe Journey at ${startedAt}${where ? ` to ${where}` : ""}. I expect to arrive by ${expectedAt}.${locationSentence} Please check on me if I do not confirm.`;
  const alertMessage = `My SafeMY journey check-in is overdue${where ? ` while heading to ${where}` : ""}.${locationSentence} Please try to reach me. If you believe I am in danger, call 999.`;
  const safeMessage = `I have arrived safely${where ? ` at ${where}` : ""}. My SafeMY journey is complete.`;

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          capturedAt: Date.now(),
        });
        setLocationStatus("ready");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 12_000 },
    );
  }

  function start() {
    const now = new Date();
    setStartedAt(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setOverdue(false);
    setShareStatus("");
    setDeadline(now.getTime() + minutes * 60_000);
  }

  function end() {
    setDeadline(null);
    setOverdue(false);
    setShareStatus("");
  }

  async function shareJourney(text: string) {
    setShareStatus("");
    try {
      if (navigator.share) {
        await navigator.share({ title: "SafeMY Safe Journey", text });
        setShareStatus("Share sheet opened.");
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareStatus("Journey message copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("Use WhatsApp or SMS below to share.");
    }
  }

  return (
    <section className="tool-card journey-card" id="check-in">
      <div className="tool-head">
        <span className="tool-num">02</span>
        <div>
          <h2>Start a Safe Journey</h2>
          <p>Set where you are going, add a time to arrive, capture your location, and tell one trusted person.</p>
        </div>
      </div>

      <div className="honesty-note">
        Phase 1 is user-controlled: SafeMY does not monitor this journey, contact your trusted person, or call 999 automatically. The timer works only while this tab stays open. Your coordinates stay in this browser unless you choose to share them; Google receives them when its map or link loads.
      </div>

      {deadline === null ? (
        <div className="journey-setup">
          <div className="checkin-setup">
            <label className="field">
              <span>I should arrive in</span>
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutes</option>)}
              </select>
            </label>
            <label className="field">
              <span>Heading to</span>
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. home from Bukit Bintang" />
            </label>
            <label className="field">
              <span>Trusted person</span>
              <select value={selectedGuardian?.id ?? ""} onChange={(e) => setGuardianId(e.target.value)} disabled={guardians.length === 0}>
                {guardians.length === 0 ? <option value="">Add a person above</option> : guardians.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </label>
          </div>

          <div className="journey-location-row">
            <div>
              <b>{location ? "Location ready" : "Add your starting location"}</b>
              <span>{location ? `Accurate to about ${location.accuracy} m · captured ${new Date(location.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Optional, but it gives your trusted person a useful Google Maps pin."}</span>
            </div>
            <button type="button" className="tool-btn" onClick={captureLocation} disabled={locationStatus === "loading"}>{locationStatus === "loading" ? "Getting location…" : location ? "Refresh location" : "Use my location"}</button>
          </div>
          {locationStatus === "error" && <p className="journey-error">Location was not available. Check browser permission or continue without it.</p>}
          {location && <LocationMap location={location} />}
          {where && <a className="google-maps-link" href={directionsHref(location, where)} target="_blank" rel="noreferrer">Preview route in Google Maps ↗</a>}
          <button type="button" className="form-submit journey-start" onClick={start} disabled={!where}>Start my journey →</button>
          <p className="form-note">Nothing is sent when you start. The next screen gives you WhatsApp, SMS, and your phone&apos;s share sheet.</p>
        </div>
      ) : (
        <div className={overdue ? "journey-active overdue" : "journey-active"} aria-live="polite">
          <div className="journey-status-line">
            <span>{overdue ? "CHECK-IN OVERDUE" : "JOURNEY ACTIVE"}</span>
            <b>{overdue ? "Please confirm you are safe" : formatClock(remaining)}</b>
            <small>{where ? `Heading to ${where}` : "Journey in progress"} · expected {expectedAt}</small>
          </div>

          {location && <LocationMap location={location} />}
          <div className="journey-location-row">
            <div>
              <b>{location ? "Latest location snapshot" : "No location attached"}</b>
              <span>{location ? `Captured ${new Date(location.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "You can add a location now and include it in your next message."}</span>
            </div>
            <button type="button" className="tool-btn" onClick={captureLocation} disabled={locationStatus === "loading"}>{locationStatus === "loading" ? "Updating…" : location ? "Update my location" : "Add my location"}</button>
          </div>

          <div className="journey-share-box">
            <div><b>{overdue ? "Alert your trusted person" : "Share this journey"}</b><span>{selectedGuardian ? `Ready for ${selectedGuardian.name}` : "Add a trusted person above for one-tap WhatsApp and SMS."}</span></div>
            <div className="journey-share-actions">
              <button type="button" className="tool-btn primary" onClick={() => shareJourney(overdue ? alertMessage : journeyMessage)}>Share</button>
              {selectedGuardian && <a className={overdue ? "tool-btn alert" : "tool-btn"} href={whatsappHref(selectedGuardian.phone, overdue ? alertMessage : journeyMessage)} target="_blank" rel="noreferrer">WhatsApp</a>}
              {selectedGuardian && <a className={overdue ? "tool-btn alert" : "tool-btn"} href={smsHref(selectedGuardian.phone, overdue ? alertMessage : journeyMessage)}>SMS</a>}
            </div>
          </div>
          {shareStatus && <p className="journey-share-status">{shareStatus}</p>}

          <div className="checkin-actions journey-finish-actions">
            {selectedGuardian && <a className="tool-btn primary" href={whatsappHref(selectedGuardian.phone, safeMessage)} target="_blank" rel="noreferrer">Tell {selectedGuardian.name} I&apos;m safe</a>}
            <button type="button" className="tool-btn ghost" onClick={end}>{overdue ? "I&apos;m safe — end journey" : "End journey"}</button>
            {overdue && <a className="tool-btn emergency" href="tel:999">Call 999</a>}
          </div>
        </div>
      )}
    </section>
  );
}

function LocationMap({ location }: { location: LocationSnapshot }) {
  return (
    <div className="journey-map-wrap">
      <iframe className="google-map-embed" title="Google Map showing your latest Safe Journey location" loading="lazy" src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`} />
      <a className="google-maps-link primary journey-map-link" href={googleMapsSearchUrl(location)} target="_blank" rel="noreferrer">Open pin in Google Maps ↗</a>
    </div>
  );
}
