import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://safemy.org"),
  title: "SafeMY — Malaysia's Personal Safety Platform",
  description: "Emergency help, verified protection professionals and community safety intelligence in one trusted platform.",
  applicationName: "SafeMY",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/safemy-icon.png", type: "image/png", sizes: "1254x1254" }],
    shortcut: "/brand/safemy-icon.png",
    apple: [{ url: "/brand/safemy-icon.png", type: "image/png", sizes: "1254x1254" }],
  },
  openGraph: {
    type: "website",
    url: "https://safemy.org",
    siteName: "SafeMY",
    title: "SafeMY — Malaysia's Personal Safety Platform",
    description: "Emergency, Protection and Community in one trusted safety platform.",
    images: [{ url: "/brand/safemy-logo.png", width: 1811, height: 868, alt: "SafeMY personal safety platform logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeMY — Malaysia's Personal Safety Platform",
    description: "Emergency, Protection and Community in one trusted safety platform.",
    images: ["/brand/safemy-logo.png"],
  },
};

const organisationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://safemy.org/#organization",
  name: "SafeMY",
  alternateName: "SafeMy",
  url: "https://safemy.org/",
  logo: {
    "@type": "ImageObject",
    url: "https://safemy.org/brand/safemy-icon.png",
    width: 1254,
    height: 1254,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${newsreader.variable}`}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationStructuredData).replace(/</g, "\\u003c") }} />{children}</body></html>;
}
