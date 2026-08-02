import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/agency", "/api", "/track"] },
    sitemap: "https://safemy.org/sitemap.xml",
  };
}
