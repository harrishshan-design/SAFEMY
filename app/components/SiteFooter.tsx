import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="shell site-footer">
      <div className="footer-top">
        <Link className="brand" href="/"><span className="brand-mark">S</span><span>Safe<span>MY</span></span></Link>
        <p>Early-access pilot connecting customers in the Klang Valley with licensed Malaysian security agencies.</p>
      </div>
      <div className="footer-links">
        <div>
          <b>Platform</b>
          <Link href="/request">Request protection</Link>
          <Link href="/pilot">Join the pilot</Link>
          <Link href="/providers/apply">Register as a provider</Link>
          <Link href="/business">SafeMY for Business</Link>
        </div>
        <div>
          <b>Trust &amp; safety</b>
          <Link href="/how-we-verify">How we verify providers</Link>
          <Link href="/emergency-disclaimer">Emergency disclaimer</Link>
          <Link href="/location-data-policy">Location data policy</Link>
        </div>
        <div>
          <b>Legal</b>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of service</Link>
          <Link href="/cancellation-refund-policy">Cancellation &amp; refunds</Link>
          <Link href="/provider-terms">Provider terms</Link>
        </div>
        <div>
          <b>Contact</b>
          <Link href="/contact">Contact SafeMY</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© 2026 SafeMY · Company registration: to be added before public launch · Early-access pilot, Klang Valley only.</small>
      </div>
    </footer>
  );
}
