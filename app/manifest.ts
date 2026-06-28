import type { MetadataRoute } from "next";

import { siteConfig } from "@/app/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "en-US",
    display: "standalone",
    background_color: "#08080a",
    theme_color: "#7c3aed",
    categories: ["games", "productivity", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/board-preview.png",
        sizes: "3420x2146",
        type: "image/png",
        form_factor: "wide",
        label: "Icarus strategy board",
      },
    ],
    related_applications: [
      {
        platform: "windows",
        url: "https://apps.microsoft.com/detail/9PBWHHZRQFW6",
        id: "9PBWHHZRQFW6",
      },
    ],
    prefer_related_applications: false,
  };
}
