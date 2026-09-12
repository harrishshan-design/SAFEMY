"use client";

import { useEffect, useState } from "react";

interface ProviderProfile {
  provider_application_id: number;
  agency_name: string;
  registration_number: string;
  kdn_licence_number: string;
  services_offered: string;
  coverage_areas: string;
  verification_date: string;
  kdn_check_url: string;
}

export function VerifiedProviderRegister() {
  const [providers, setProviders] = useState<ProviderProfile[] | null>(null);

  useEffect(() => {
    fetch("/api/public/providers", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ providers?: ProviderProfile[] }>)
      .then((data) => setProviders(data.providers ?? []))
      .catch(() => setProviders([]));
  }, []);

  return (
    <section className="public-register" aria-labelledby="verified-register-heading">
      <div className="public-register-head">
        <div><span className="kicker">PUBLIC VERIFICATION</span><h2 id="verified-register-heading">Verified partner register</h2></div>
        <a href="/how-we-verify">How verification works →</a>
      </div>
      {!providers ? <p className="form-note">Loading the public register…</p> : providers.length === 0 ? (
        <div className="honesty-note"><b>No approved agency profile has been published yet.</b><br />Profiles appear here only after SafeMY completes its manual SSM and KDN checks and the agency gives permission to publish. Use the official KDN search to verify any licence independently.</div>
      ) : (
        <div className="public-provider-grid">
          {providers.map((provider) => (
            <article key={provider.provider_application_id} className="public-provider-card">
              <div className="public-provider-title"><span className="verified-badge">✓</span><div><h3>{provider.agency_name}</h3><small>Verified {new Date(provider.verification_date).toLocaleDateString("en-MY")}</small></div></div>
              <dl>
                <div><dt>SSM</dt><dd>{provider.registration_number}</dd></div>
                <div><dt>KDN licence</dt><dd>{provider.kdn_licence_number}</dd></div>
                <div><dt>Coverage</dt><dd>{provider.coverage_areas}</dd></div>
                <div><dt>Services</dt><dd>{provider.services_offered}</dd></div>
              </dl>
              <a href={provider.kdn_check_url} target="_blank" rel="noreferrer">Check current KDN status ↗</a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
