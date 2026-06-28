import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/app/seo";

const canonicalHost = new URL(siteConfig.url).host;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: canonicalHost,
  };
}
