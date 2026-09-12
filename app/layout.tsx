import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://safemy.org"),
  title: "SafeMY — Safe Journey & Verified Protection in Malaysia",
  description: "Start a free location-aware Safe Journey or request planned protection from a verified Malaysian security agency through SafeMY's Klang Valley pilot.",
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
    title: "SafeMY — Safe Journey & Verified Protection in Malaysia",
    description: "Free journey check-ins with Google Maps plus planned protection requests for the Klang Valley.",
    images: [{ url: "/brand/safemy-logo.png", width: 1811, height: 868, alt: "SafeMY personal safety platform logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeMY — Safe Journey & Verified Protection in Malaysia",
    description: "Free journey check-ins with Google Maps plus planned protection requests for the Klang Valley.",
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
  return <html lang="en" data-scroll-behavior="smooth"><body className={`${manrope.variable} ${newsreader.variable}`}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationStructuredData).replace(/</g, "\\u003c") }} />{children}</body></html>;
}
