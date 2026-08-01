"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../db/supabase-browser";

type Tab = "requests" | "providers" | "pilot" | "business" | "partners" | "staff";

interface ProtectionRequest {
  id: number;
  reference: string;
  name: string;
  phone: string;
  email: string;
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
  assigned_personnel_name: string;
  tracking_enabled: boolean;
  notes: string;
  status: string;
  assigned_agency_id: number | null;
  assigned_agency_name: string;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
}

interface ProviderApplication {
  id: number;
  reference: string;
  agency_name: string;
  registration_number: string;
  kdn_licence_number: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  services_offered: string;
  coverage_areas: string;
  headcount: string;
  status: string;
  status_note: string;
  user_id: string | null;
  created_at: string;
}

interface PilotSignup {
  id: number;
  reference: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  area: string;
  created_at: string;
}

interface EnquiryBase {
  id: number;
  reference: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  created_at: string;
}
interface BusinessEnquiry extends EnquiryBase {
  company_name: string;
  team_size: string;
  message: string;
}
interface PartnerEnquiry extends EnquiryBase {
  organisation_name: string;
  organisation_type: string;
  people_served: string;
  interest: string;
}

interface AdminProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const REQUEST_STATUSES = ["pending_review", "assigned", "accepted", "in_progress", "completed", "declined", "cancelled"];
const APPLICATION_STATUSES = ["pending_review", "approved", "rejected", "suspended"];
const ENQUIRY_STATUSES = ["new", "contacted", "closed"];

const TABS: { key: Tab; label: string }[] = [
  { key: "requests", label: "Protection requests" },
  { key: "providers", label: "Provider applications" },
  { key: "pilot", label: "Pilot signups" },
  { key: "business", label: "Business enquiries" },
  { key: "partners", label: "Partner enquiries" },
];

export function AdminDashboard({ email, role }: { email: string; role: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [tab, setTab] = useState<Tab>("requests");

  const [requests, setRequests] = useState<ProtectionRequest[] | null>(null);
  const [providers, setProviders] = useState<ProviderApplication[] | null>(null);
  const [pilotSignups, setPilotSignups] = useState<PilotSignup[] | null>(null);
  const [businessEnquiries, setBusinessEnquiries] = useState<BusinessEnquiry[] | null>(null);
  const [partnerEnquiries, setPartnerEnquiries] = useState<PartnerEnquiry[] | null>(null);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[] | null>(null);
  const [loadError, setLoadError] = useState("");

  const loadAll = useCallback(async () => {
    setLoadError("");
    const [reqs, apps, pilots, biz, partners, admins] = await Promise.all([
      supabase.from("safemy_protection_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("safemy_provider_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("safemy_pilot_signups").select("*").order("created_at", { ascending: false }),
      supabase.from("safemy_business_enquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("safemy_partner_enquiries").select("*").order("created_at", { ascending: false }),
      role === "super_admin"
        ? supabase.from("safemy_admin_profiles").select("*").order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    const firstError = [reqs.error, apps.error, pilots.error, biz.error, partners.error, admins.error].find(Boolean);
    if (firstError) setLoadError(firstError.message);

    setRequests((reqs.data as ProtectionRequest[]) ?? []);
    setProviders((apps.data as ProviderApplication[]) ?? []);
    setPilotSignups((pilots.data as PilotSignup[]) ?? []);
    setBusinessEnquiries((biz.data as BusinessEnquiry[]) ?? []);
    setPartnerEnquiries((partners.data as PartnerEnquiry[]) ?? []);
    setAdminProfiles((admins.data as AdminProfile[]) ?? []);
  }, [supabase, role]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const approvedProviders = useMemo(
    () => (providers ?? []).filter((p) => p.status === "approved"),
    [providers],
  );

  return (
    <main className="shell admin-page">
      <div className="admin-head">
        <div><span className="kicker">SAFEMY ADMIN</span><h1>Operations</h1></div>
        <div><span>{email} · {role === "super_admin" ? "Super admin" : "Staff"}</span><button className="tool-btn ghost" onClick={signOut}>Sign out</button></div>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
        {role === "super_admin" && (
          <button className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>Staff</button>
        )}
      </div>

      {loadError && <p className="form-error">{loadError}</p>}

      {tab === "requests" && (
        <RequestsTab requests={requests} approvedProviders={approvedProviders} onChange={loadAll} />
      )}
      {tab === "providers" && <ProvidersTab providers={providers} onChange={loadAll} />}
      {tab === "pilot" && <PilotTab rows={pilotSignups} />}
      {tab === "business" && <BusinessTab rows={businessEnquiries} onChange={loadAll} />}
      {tab === "partners" && <PartnersTab rows={partnerEnquiries} onChange={loadAll} />}
      {tab === "staff" && role === "super_admin" && <StaffTab profiles={adminProfiles} supabase={supabase} onChange={loadAll} />}
    </main>
  );
}

function RequestsTab({
  requests, approvedProviders, onChange,
}: {
  requests: ProtectionRequest[] | null;
  approvedProviders: ProviderApplication[];
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<number | null>(null);

  async function setStatus(id: number, status: string) {
    setBusyId(id);
    await fetch(`/api/admin/protection-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status }),
    });
    setBusyId(null);
    onChange();
  }

  async function assign(id: number, agencyId: number, agencyName: string) {
    setBusyId(id);
    await fetch(`/api/admin/protection-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", agencyId, agencyName }),
    });
    setBusyId(null);
    onChange();
  }

  if (!requests) return <p className="form-note">Loading…</p>;
  if (requests.length === 0) return <p className="tool-empty">No protection requests yet.</p>;

  return (
    <div className="admin-cards">
      {requests.map((r) => {
        const suggested = approvedProviders.filter(
          (p) =>
            p.services_offered.toLowerCase().includes(r.service_type.toLowerCase().split(" ")[0]) ||
            p.coverage_areas.toLowerCase().includes(r.location.toLowerCase().split(",")[0].trim()),
        );
        return (
          <div key={r.id} className="admin-request-card">
            <div className="admin-request-head">
              <div><b>{r.reference}</b><small>{r.service_type} · {r.location}</small></div>
              <span className={`status-pill status-${r.status}`}>{r.status.replace("_", " ")}</span>
            </div>
            <div className="admin-request-body">
              <p><b>{r.name}</b> · {r.phone} · {r.email}</p>
              <p>{r.start_date} {r.start_time} · {r.duration_hours}h · {r.professionals_count} professional(s)</p>
              <p className="matching-priority"><b>Personnel priority:</b> {formatGenderPreference(r.personnel_gender_preference, r.customer_gender)} · nearest verified available person next</p>
              {r.notes && <p className="form-note">{r.notes}</p>}
              {r.assigned_agency_name && <p className="form-note">Assigned: <b>{r.assigned_agency_name}</b></p>}
              {r.assigned_personnel_name && <p className="form-note">Matched personnel: <b>{r.assigned_personnel_name}</b>{r.tracking_enabled ? " · live tracking active" : ""}</p>}
            </div>
            <div className="admin-request-actions">
              <label>
                Status
                <select value={r.status} disabled={busyId === r.id} onChange={(e) => setStatus(r.id, e.target.value)}>
                  {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </label>
              <label>
                Assign agency {suggested.length > 0 && <span className="roadmap-tag">{suggested.length} suggested</span>}
                <select
                  disabled={busyId === r.id}
                  defaultValue=""
                  onChange={(e) => {
                    const agencyId = Number(e.target.value);
                    const agency = approvedProviders.find((p) => p.id === agencyId);
                    if (agency) assign(r.id, agency.id, agency.agency_name);
                  }}
                >
                  <option value="" disabled>Choose an agency…</option>
                  {suggested.length > 0 && (
                    <optgroup label="Suggested">
                      {suggested.map((p) => <option key={p.id} value={p.id}>{p.agency_name}</option>)}
                    </optgroup>
                  )}
                  <optgroup label="All approved agencies">
                    {approvedProviders.map((p) => <option key={p.id} value={p.id}>{p.agency_name}</option>)}
                  </optgroup>
                </select>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatGenderPreference(preference: string, customerGender: string) {
  if (preference === "same_gender") {
    return customerGender && customerGender !== "prefer_not_to_say"
      ? `same gender (${customerGender.replace("_", " ")})`
      : "same gender when known";
  }
  if (preference === "female") return "female personnel";
  if (preference === "male") return "male personnel";
  return "no gender preference";
}

function ProvidersTab({ providers, onChange }: { providers: ProviderApplication[] | null; onChange: () => void }) {
  const [busyId, setBusyId] = useState<number | null>(null);

  async function setStatus(id: number, status: string) {
    setBusyId(id);
    await fetch(`/api/admin/provider-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    onChange();
  }

  if (!providers) return <p className="form-note">Loading…</p>;
  if (providers.length === 0) return <p className="tool-empty">No provider applications yet.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Reference</th><th>Agency</th><th>SSM / KDN</th><th>Contact</th><th>Services</th><th>Coverage</th><th>Login</th><th>Status</th></tr></thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id}>
              <td>{p.reference}</td>
              <td>{p.agency_name}</td>
              <td>{p.registration_number}<br />{p.kdn_licence_number}</td>
              <td>{p.contact_name}<br />{p.contact_email}<br />{p.contact_phone}</td>
              <td>{p.services_offered}</td>
              <td>{p.coverage_areas}</td>
              <td>{p.user_id ? "✓ created" : "—"}</td>
              <td>
                <select value={p.status} disabled={busyId === p.id} onChange={(e) => setStatus(p.id, e.target.value)}>
                  {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PilotTab({ rows }: { rows: PilotSignup[] | null }) {
  if (!rows) return <p className="form-note">Loading…</p>;
  if (rows.length === 0) return <p className="tool-empty">No pilot signups yet.</p>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Reference</th><th>Name</th><th>Contact</th><th>Interest</th><th>Area</th><th>Received</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.reference}</td><td>{r.name}</td><td>{r.email}<br />{r.phone}</td><td>{r.interest}</td><td>{r.area}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BusinessTab({ rows, onChange }: { rows: BusinessEnquiry[] | null; onChange: () => void }) {
  const [busyId, setBusyId] = useState<number | null>(null);
  async function setStatus(id: number, status: string) {
    setBusyId(id);
    await fetch(`/api/admin/enquiries/business/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    onChange();
  }
  if (!rows) return <p className="form-note">Loading…</p>;
  if (rows.length === 0) return <p className="tool-empty">No business enquiries yet.</p>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Reference</th><th>Company</th><th>Contact</th><th>Team size</th><th>Message</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.reference}</td><td>{r.company_name}</td><td>{r.contact_name}<br />{r.contact_email}</td><td>{r.team_size}</td><td>{r.message}</td>
              <td>
                <select value={r.status} disabled={busyId === r.id} onChange={(e) => setStatus(r.id, e.target.value)}>
                  {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PartnersTab({ rows, onChange }: { rows: PartnerEnquiry[] | null; onChange: () => void }) {
  const [busyId, setBusyId] = useState<number | null>(null);
  async function setStatus(id: number, status: string) {
    setBusyId(id);
    await fetch(`/api/admin/enquiries/partner/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    onChange();
  }
  if (!rows) return <p className="form-note">Loading…</p>;
  if (rows.length === 0) return <p className="tool-empty">No partner enquiries yet.</p>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Reference</th><th>Organisation</th><th>Type</th><th>Contact</th><th>People served</th><th>Interest</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.reference}</td><td>{r.organisation_name}</td><td>{r.organisation_type}</td>
              <td>{r.contact_name}<br />{r.contact_email}</td><td>{r.people_served}</td><td>{r.interest}</td>
              <td>
                <select value={r.status} disabled={busyId === r.id} onChange={(e) => setStatus(r.id, e.target.value)}>
                  {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StaffTab({
  profiles, supabase, onChange,
}: {
  profiles: AdminProfile[] | null;
  supabase: ReturnType<typeof createSupabaseBrowserClient>;
  onChange: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [error, setError] = useState("");

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const { error: rpcError } = await supabase.rpc("safemy_invite_admin", {
      target_email: email,
      target_role: role,
    });
    if (rpcError) {
      setError(rpcError.message);
      setStatus("error");
      return;
    }
    setStatus("done");
    setEmail("");
    onChange();
  }

  return (
    <div>
      <h2>Current staff</h2>
      {!profiles || profiles.length === 0 ? (
        <p className="tool-empty">No staff profiles yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Email</th><th>Role</th><th>Since</th></tr></thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}><td>{p.email}</td><td>{p.role}</td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ marginTop: 32 }}>Invite new staff</h2>
      <form className="form-card" onSubmit={invite} style={{ maxWidth: 480 }}>
        <div className="field-grid">
          <label className="field wide"><span>Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@safemy.org" /></label>
          <label className="field wide"><span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="staff">Staff</option>
              <option value="super_admin">Super admin</option>
            </select>
          </label>
        </div>
        {status === "error" && <p className="form-error">{error}</p>}
        {status === "done" && <p className="form-note">Invited. They can now create an account at /admin/signup with that email.</p>}
        <button className="form-submit" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Inviting…" : "Send invite →"}
        </button>
      </form>
    </div>
  );
}
