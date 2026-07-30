"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Guardian = { id: string; name: string; phone: string };

const STORAGE_KEY = "safemy.guardians.v1";

// Guardians live only in this browser. Nothing is uploaded — there is no
// account, and the API routes never receive this data.
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

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function smsHref(phone: string, body: string) {
  // `?body=` is the widely supported form; iOS also accepts `&body=`.
  return `sms:${phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SafetyToolkit() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setGuardians(loadGuardians());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Guardian[]) => {
    setGuardians(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable (private mode) — the list still works this session */
    }
  }, []);

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
      <CheckInCard guardians={guardians} />
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
          <h2>Your guardians</h2>
          <p>The people you&apos;d want contacted if something felt wrong. Saved only in this browser, on this device — SafeMY never receives them, and there&apos;s no account for them to live on.</p>
        </div>
      </div>

      <div className="honesty-note">
        This list stays on your phone or computer only. Nothing is uploaded to SafeMY and there is no server copy — if you clear your browser data or switch devices, you&apos;ll need to add your guardians again.
      </div>

      <form className="guardian-form" onSubmit={onAdd}>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mak" required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="e.g. 012-345 6789" required />
        </label>
        <button type="submit" className="tool-btn primary">Add guardian</button>
      </form>

      {!hydrated ? null : guardians.length === 0 ? (
        <p className="tool-empty">No guardians saved yet. Add one above — most people start with a parent, partner, housemate, or close friend.</p>
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
                <a
                  className="tool-btn"
                  href={smsHref(g.phone, `Hi ${g.name}, I'm using SafeMY to let you know where I am. I'll message again when I get in.`)}
                >
                  Message
                </a>
                <button className="tool-btn ghost" onClick={() => onRemove(g.id)} aria-label={`Remove ${g.name}`}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CheckInCard({ guardians }: { guardians: Guardian[] }) {
  const [minutes, setMinutes] = useState(25);
  const [destination, setDestination] = useState("");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [overdue, setOverdue] = useState(false);
  const [startedAt, setStartedAt] = useState<string>("");
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

  // Keep the tab title in sync so an overdue check-in is visible from another tab.
  useEffect(() => {
    const original = document.title;
    if (deadline !== null) {
      document.title = overdue ? "⚠ Check-in overdue — SafeMY" : `${formatClock(remaining)} — SafeMY check-in`;
    }
    return () => {
      document.title = original;
    };
  }, [deadline, overdue, remaining]);

  function start() {
    const now = new Date();
    setStartedAt(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setOverdue(false);
    setDeadline(Date.now() + minutes * 60_000);
  }

  function cancel() {
    setDeadline(null);
    setOverdue(false);
  }

  const where = destination.trim();
  const alertMessage =
    `I set a SafeMY check-in for ${minutes} minutes at ${startedAt}${where ? ` on my way to ${where}` : ""} and I haven't checked in. ` +
    `Please try to reach me. If you can't, call 999.`;

  return (
    <section className="tool-card" id="check-in">
      <div className="tool-head">
        <span className="tool-num">02</span>
        <div>
          <h2>Safety check-in</h2>
          <p>Set a timer before you set off. If you don&apos;t check in by the time it ends, this page prompts you to alert a guardian.</p>
        </div>
      </div>

      <div className="honesty-note">
        Be clear-eyed about what this does: it only works while this tab stays open on your phone or computer, and it cannot call, message, or alert anyone by itself. All it does is prompt you, when time&apos;s up, to send an alert yourself. If you&apos;re in danger, don&apos;t wait for a timer — call 999.
      </div>

      {deadline === null ? (
        <div className="checkin-setup">
          <label className="field">
            <span>I should arrive in</span>
            <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {[5, 10, 15, 20, 25, 30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Heading to (optional)</span>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. home from campus, back from the LRT station" />
          </label>
          <button className="tool-btn primary" onClick={start}>Start check-in</button>
        </div>
      ) : overdue ? (
        <div className="checkin-live overdue">
          <div className="checkin-clock">Check-in overdue</div>
          <p>You set a {minutes}-minute check-in at {startedAt}{where ? ` on your way to ${where}` : ""}. Are you safe?</p>
          <p className="honesty-note">Tapping &quot;Alert&quot; opens a pre-written text message to that guardian — it doesn&apos;t send by itself. You still need to press send.</p>
          <div className="checkin-actions">
            <button className="tool-btn primary" onClick={cancel}>I&apos;m safe — end check-in</button>
            {guardians.length === 0 ? (
              <a className="tool-btn" href="#guardians">Add a guardian to alert</a>
            ) : (
              guardians.map((g) => (
                <a key={g.id} className="tool-btn alert" href={smsHref(g.phone, alertMessage)}>
                  Alert {g.name}
                </a>
              ))
            )}
            <a className="tool-btn emergency" href="tel:999">Call 999</a>
          </div>
        </div>
      ) : (
        <div className="checkin-live">
          <div className="checkin-clock">{formatClock(remaining)}</div>
          <p>Checking in {where ? `when you reach ${where}` : "when you arrive"}. Started {startedAt}.</p>
          <div className="checkin-actions">
            <button className="tool-btn primary" onClick={cancel}>I&apos;ve arrived safely</button>
            <button className="tool-btn ghost" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
