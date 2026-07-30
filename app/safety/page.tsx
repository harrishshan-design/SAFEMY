import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { SafetyToolkit } from "./SafetyToolkit";

// Verified against official sources only — see research notes. Do not add a
// number here unless it is confirmed by a government or equivalently
// authoritative source. A wrong number in a safety directory is worse than
// no directory at all.
const directory = [
  {
    name: "999 — Police, fire & rescue, ambulance, civil defence, maritime",
    number: "999",
    note: "Malaysia's single national emergency number (MERS 999). Free from any phone, 24 hours. If you are in immediate danger, this is always the right call.",
    critical: true,
  },
  {
    name: "Talian Kasih — domestic violence, child abuse & family crisis",
    number: "15999",
    note: "Toll-free, 24 hours. Run by the Social Welfare Department (JKM) under the Ministry of Women, Family and Community Development.",
    critical: false,
  },
  {
    name: "Talian HEAL — mental health & suicide crisis support",
    number: "15555",
    note: "Ministry of Health. Daily, 8am to midnight.",
    critical: false,
  },
  {
    name: "Befrienders KL — emotional support, 24 hours",
    number: "03-7627 2929",
    note: "A charity helpline (Befrienders Worldwide), not a government service. Confidential, in Bahasa Malaysia, English, Chinese and Tamil.",
    critical: false,
  },
];

const tips = [
  { title: "Walk facing oncoming traffic where there's no pavement", body: "You'll see a vehicle before it reaches you, and drivers see you sooner too." },
  { title: "Keep your phone held close, not out in the open", body: "Phone snatching from passing motorcycles happens on ordinary streets, not just quiet ones. Pocket it or keep it in a bag when you're not actively using it, and avoid walking while scrolling near the roadside." },
  { title: "Check the plate and driver photo before you get in", body: "For e-hailing, match the car's plate number and the driver's photo in the app before opening the door. Sit in the back seat when travelling alone, and let a guardian know you're on your way." },
  { title: "Have your keys out before you reach your door or car", body: "Fumbling for keys at a gate, front door, or car door is a common moment of vulnerability — have them in hand while you're still walking." },
  { title: "Be deliberate at ATMs and cash points", body: "Glance around before you withdraw, shield the keypad as you type, and step away from the machine before counting your cash." },
  { title: "Approach your parked car with intent", body: "Look around and check the back seat before getting in. Where you have a choice, park somewhere lit rather than somewhere dark and empty." },
  { title: "If you think you're being followed, change your route, not your pace", body: "Head toward a shop, petrol station, or anywhere with people, rather than straight home. Call someone so you're not alone on the line. Trust that feeling over politeness." },
  { title: "Tell a guardian your route, not just your destination", body: "\"Heading home from KLCC, should be back by 11\" gives someone enough to notice if something's wrong — and act on it." },
];

export default function SafetyPage() {
  return (
    <main>
      <SiteNav />
      <section className="form-hero shell">
        <span className="kicker">FREE, FOR EVERYONE</span>
        <h1>Your safety toolkit.</h1>
        <p>No account, no payment. These tools run in your browser and are yours to use whether or not you ever book protection through SafeMY.</p>
      </section>

      <section className="shell toolkit-shell">
        <EmergencyBanner />
        <SafetyToolkit />

        <section className="tool-card" aria-labelledby="directory-heading">
          <div className="tool-head">
            <span className="tool-num">03</span>
            <div>
              <h2 id="directory-heading">Emergency directory</h2>
              <p>Save these numbers today, before you need them. In immediate danger, always call 999 — SafeMY does not replace police, ambulance, fire, or other government emergency services.</p>
            </div>
          </div>
          <ul className="directory-list">
            {directory.map((d) => (
              <li key={d.name} className={d.critical ? "critical" : ""}>
                <div>
                  <b>{d.name}</b>
                  <small>{d.note}</small>
                </div>
                <a className="directory-call" href={`tel:${d.number.replace(/[^\d+]/g, "")}`}>{d.number}</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="tool-card" aria-labelledby="tips-heading">
          <div className="tool-head">
            <span className="tool-num">04</span>
            <div>
              <h2 id="tips-heading">Safety tips</h2>
              <p>Practical habits, not fear. Small things that make a real difference.</p>
            </div>
          </div>
          <ul className="tips-list">
            {tips.map((t, i) => (
              <li key={t.title}>
                <i>{i + 1}</i>
                <span><b>{t.title}</b><br />{t.body}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
