import type { MetadataRoute } from "next";

const publicRoutes = [
  "",
  "/business",
  "/cancellation-refund-policy",
  "/contact",
  "/emergency-disclaimer",
  "/how-we-verify",
  "/location-data-policy",
  "/partners",
  "/pilot",
  "/plans",
  "/privacy",
  "/provider-terms",
  "/providers/apply",
  "/request",
  "/safety",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-02T00:00:00+08:00");
  return publicRoutes.map((route) => ({
    url: `https://safemy.org${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/request" || route === "/safety" ? 0.9 : 0.7,
  }));
}
