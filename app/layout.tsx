import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://safemy.vercel.app"),
  title: "SafeMY — Malaysia's Personal Safety Platform",
  description: "Emergency help, verified protection professionals and community safety intelligence in one trusted platform.",
  openGraph: {
    title: "SafeMY — Malaysia's Personal Safety Platform",
    description: "Emergency, Protection and Community in one trusted safety platform.",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "SafeMY personal safety platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeMY — Malaysia's Personal Safety Platform",
    description: "Emergency, Protection and Community in one trusted safety platform.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${newsreader.variable}`}>{children}</body></html>;
}
