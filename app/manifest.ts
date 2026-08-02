import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafeMY — Malaysia's Personal Safety Platform",
    short_name: "SafeMY",
    description: "Emergency help, verified protection professionals and community safety intelligence in one trusted platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#073b38",
    icons: [
      {
        src: "/brand/safemy-icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
