import type { Metadata } from "next";
import Markdown from "react-markdown";
import fs from "fs";
import path from "path";

import { BG, DOT, VIGNETTE, TEXT_SOFT, ACCENT } from "@/app/constants";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import { siteConfig } from "@/app/seo";

const title = "Terms of Service";
const description =
  "Terms of Service for Icarus, a free local-first VALORANT strategy planner.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/tos",
  },
  openGraph: {
    type: "website",
    url: "/tos",
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

async function getTosContent() {
  const filePath = path.join(process.cwd(), "app/content/tos.md");
  const content = fs.readFileSync(filePath, "utf-8");
  return content;
}

export default async function TosPage() {
  const content = await getTosContent();

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      <Header />
      {/* Background pattern */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${DOT} 1px, transparent 1px), ${VIGNETTE}`,
          backgroundSize: "16px 16px, cover",
          backgroundPosition: "center, center",
        }}
      />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        <article
          className="prose prose-invert prose-lg max-w-none"
          style={
            {
              "--tw-prose-body": TEXT_SOFT,
              "--tw-prose-headings": "#fff",
              "--tw-prose-links": ACCENT,
              "--tw-prose-bold": "#fff",
              "--tw-prose-hr": "rgba(255,255,255,0.1)",
            } as React.CSSProperties
          }
        >
          <Markdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-4xl font-bold mb-2 tracking-tight">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mt-10 mb-4 tracking-tight">
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed mb-4" style={{ color: TEXT_SOFT }}>
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: ACCENT }}
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li style={{ color: TEXT_SOFT }}>{children}</li>
              ),
              hr: () => (
                <hr className="my-8 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }} />
              ),
              em: ({ children }) => (
                <em className="italic" style={{ color: TEXT_SOFT }}>
                  {children}
                </em>
              ),
            }}
          >
            {content}
          </Markdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}
