import type { Metadata } from "next";
import type { ReactNode } from "react";

import { siteConfig } from "@/app/seo";

const title = "Hackathon Build";
const description =
  "Historical experimental Icarus hackathon build page. The main Icarus download is available from the homepage.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/hackathon",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    url: "/hackathon",
    siteName: siteConfig.name,
    title: `${title} | ${siteConfig.name}`,
    description,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    site: "@icarusstrats",
    creator: "@daradoescode",
    title: `${title} | ${siteConfig.name}`,
    description,
    images: [siteConfig.ogImage.url],
  },
};

export default function HackathonLayout({ children }: { children: ReactNode }) {
  return children;
}
