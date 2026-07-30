import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="nav shell">
      <Link className="brand" href="/" aria-label="SafeMY home">
        <span className="brand-mark">S</span><span>Safe<span>MY</span></span>
      </Link>
      <div className="nav-links">
        <Link href="/safety">Free safety toolkit</Link>
        <Link href="/plans">Plans</Link>
        <Link href="/how-we-verify">Verification</Link>
        <Link href="/providers/apply">For providers</Link>
      </div>
      <Link className="nav-cta nav-book" href="/request">Request protection</Link>
    </nav>
  );
}
