import Link from "next/link";
import Image from "next/image";

export function SiteNav() {
  return (
    <nav className="nav shell">
      <Link className="brand" href="/" aria-label="SafeMY home">
        <Image className="brand-logo" src="/brand/safemy-logo.png" alt="SafeMY" width={1811} height={868} priority />
      </Link>
      <div className="nav-links">
        <Link href="/safety#check-in">Safe Journey</Link>
        <Link href="/#services">Protection</Link>
        <Link href="/how-we-verify">Verification</Link>
        <Link href="/providers/apply">For agencies</Link>
        <Link href="/login">Sign in</Link>
      </div>
      <Link className="nav-cta nav-book" href="/safety#check-in">Start journey</Link>
    </nav>
  );
}
