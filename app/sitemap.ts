import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/app/seo";

const lastModified = new Date("2026-06-28T02:03:49.000Z");

const routes = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    images: [absoluteUrl("/og-image.png"), absoluteUrl("/board-preview.png")],
  },
  {
    path: "/tos",
    changeFrequency: "yearly",
    priority: 0.2,
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    images: "images" in route ? [...route.images] : undefined,
  }));
}
