import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Wordmark from "@/app/components/Wordmark";
import { palette } from "@/app/concepts/_shared/tokens";
import { getLatestVersionInfo } from "@/app/lib/getLatestVersionInfo";
import { absoluteUrl, siteConfig } from "@/app/seo";

export const revalidate = 3600;

const title = "Save Valorant Lineups";
// The share picture is the first frame of the share video, so apps that play
// link-preview videos and apps that don't show the same card.
const shareImage = {
    url: "/og/lineups-v1.png",
    width: 1200,
    height: 630,
    alt: "Agents, abilities, smokes and pen strokes from the Icarus board around the line: The free VALORANT strategy board.",
};
// A full URL: Next leaves video paths as written, unlike image paths.
const shareVideo = { url: absoluteUrl("/og/lineups-v1.mp4"), type: "video/mp4", width: 1200, height: 630 };
const description =
    "Pin your VALORANT lineups right on the map in Icarus: standing spot, landing spot, screenshots, notes, and video clip. Free, open source, and offline-ready on Windows.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {
        canonical: "/lineups",
        types: {
            "text/markdown": "/lineups.md",
        },
    },
    openGraph: {
        type: "website",
        url: "/lineups",
        siteName: siteConfig.name,
        title: `${title} | ${siteConfig.name}`,
        description,
        images: [shareImage],
        videos: [shareVideo],
    },
    twitter: {
        card: "summary_large_image",
        site: "@icarusstrats",
        creator: "@daradoescode",
        title: `${title} | ${siteConfig.name}`,
        description,
        images: [shareImage.url],
    },
};

const STEPS = [
    {
        title: "Open the lineup tool",
        body: "Press G, or click Add Lineup in the sidebar.",
    },
    {
        title: "Mark your standing spot",
        body: "Drop your agent on the exact spot you throw from.",
    },
    {
        title: "Mark the landing spot",
        body: "Place the ability where it lands, then press Next.",
    },
    {
        title: "Save the reference",
        body: "Name the lineup, drop in a YouTube link, add quick notes, and paste aim screenshots straight from your clipboard.",
    },
] as const;

const FAQ = [
    {
        question: "Is it free?",
        answer: "Yes. Icarus is free and open source under the Apache 2.0 license, with no ads and no paid tier.",
    },
    {
        question: "Do I need an account?",
        answer: "No. In the Windows app, your lineups save locally and work offline without signing in. Only sign in and move a strategy to the cloud if you want it synced across devices, open in the web beta, or editable live with teammates.",
    },
    {
        question: "Can I browse other people's lineups?",
        answer: "Icarus is built for your own lineups and the ones your team shares with you, not a public lineup database.",
    },
    {
        question: "Does it run on Mac or Linux?",
        answer: "The desktop app is Windows-only for now. On Mac or Linux, you can sign in to the web beta in your browser to view and edit your cloud strategies, lineups included.",
    },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="callsign" style={{ color: palette.dim }}>
            {children}
        </p>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2
            className="font-display mt-3"
            style={{
                fontSize: "clamp(26px, 3.2vw, 38px)",
                lineHeight: 1.1,
                fontWeight: 700,
                letterSpacing: "-0.015em",
            }}
        >
            {children}
        </h2>
    );
}

function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <p className={`text-[15.5px] leading-[1.7] ${className}`} style={{ color: palette.muted }}>
            {children}
        </p>
    );
}

function Screenshot({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
    return (
        <div
            className="overflow-hidden rounded-xl"
            style={{ border: `1px solid ${palette.border}`, background: palette.card }}
        >
            <Image src={src} alt={alt} width={width} height={height} className="block h-auto w-full" />
        </div>
    );
}

export default async function LineupsPage() {
    const latestVersion = await getLatestVersionInfo();
    const downloadUrl = latestVersion.platforms.windows.url;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${absoluteUrl("/lineups")}#faq`,
        url: absoluteUrl("/lineups"),
        mainEntity: FAQ.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
        })),
    };

    return (
        <div className="min-h-screen" style={{ background: palette.bg, color: palette.fg }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />

            <header className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6">
                <Link href="/" aria-label="Icarus home">
                    <Wordmark height={18} />
                </Link>
                <a href={downloadUrl} className="icarus-button icarus-button-primary">
                    Download
                </a>
            </header>

            <main>
                <section className="mx-auto max-w-[1160px] px-6 pb-16 pt-14 sm:pt-20">
                    <SectionLabel>Lineups</SectionLabel>
                    <h1
                        className="font-display mt-3 max-w-[18ch]"
                        style={{
                            fontSize: "clamp(36px, 5.4vw, 64px)",
                            lineHeight: 1.04,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Save your VALORANT lineups where you plan.
                    </h1>
                    <Body className="mt-6 max-w-xl text-[16.5px]">
                        Stop digging through saved clips and Discord channels mid-match. Pin every
                        lineup right on the map with your standing spot, landing spot, screenshots,
                        notes, and video clip. Free to use, and the Windows app works offline.
                    </Body>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <a href={downloadUrl} className="icarus-button icarus-button-primary icarus-button-lg">
                            Download for Windows
                        </a>
                        <a
                            href="https://beta.icarusstrats.com"
                            className="icarus-button icarus-button-secondary icarus-button-lg"
                        >
                            Open the web version
                        </a>
                    </div>
                    <div className="mt-14">
                        <Screenshot
                            src="/lineups/lineups-on-bind.png"
                            alt="Three lineups on Bind in Icarus: two Brimstone mollies onto A site and a Sova recon bolt onto B"
                            width={1920}
                            height={1052}
                        />
                    </div>
                </section>

                <section className="mx-auto max-w-[1160px] px-6 py-16">
                    <SectionLabel>How it works</SectionLabel>
                    <SectionTitle>Save a lineup in four steps.</SectionTitle>
                    <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, index) => (
                            <li key={step.title}>
                                <span
                                    className="font-label text-[13px]"
                                    style={{ color: palette.lavender }}
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3 className="mt-2 text-[17px] font-semibold">{step.title}</h3>
                                <Body className="mt-2">{step.body}</Body>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="mx-auto grid max-w-[1160px] items-center gap-12 px-6 py-16 md:grid-cols-2">
                    <div>
                        <SectionLabel>On the map</SectionLabel>
                        <SectionTitle>One spot, every throw from it.</SectionTitle>
                        <Body className="mt-5 max-w-md">
                            One standing spot often covers two or three default plants, and the same
                            choke point might have throws from across the map. Click an agent to see
                            every lineup from that spot, or click an ability to see every way to land
                            it. Each one pulls up your clip, screenshots, and notes.
                        </Body>
                    </div>
                    <Screenshot
                        src="/lineups/lineups-one-spot.png"
                        alt="One Brimstone spot in A lobby with two lineups onto A site highlighted"
                        width={760}
                        height={570}
                    />
                </section>

                <section className="mx-auto max-w-[1160px] px-6 py-16">
                    <SectionLabel>Your team</SectionLabel>
                    <SectionTitle>Hand your lineups to the rest of the five-stack.</SectionTitle>
                    <Body className="mt-5 max-w-2xl">
                        Lineups live right inside the strategy they belong to, not off in a separate
                        folder. Share the strategy with a link, code, or .ica file and your teammates
                        get every lineup along with the play. Sign in and move it to the cloud to
                        build a stratbook together live, with shared cursors showing who is working
                        on what.
                    </Body>
                </section>

                <section className="mx-auto max-w-[1160px] px-6 pb-24 pt-16">
                    <SectionLabel>Questions</SectionLabel>
                    <SectionTitle>Before you download.</SectionTitle>
                    <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
                        {FAQ.map(({ question, answer }) => (
                            <div key={question}>
                                <dt className="text-[17px] font-semibold">{question}</dt>
                                <dd className="mt-2">
                                    <Body>{answer}</Body>
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-14 flex flex-wrap items-center gap-4">
                        <a href={downloadUrl} className="icarus-button icarus-button-primary icarus-button-lg">
                            Download Icarus
                        </a>
                        <Link href="/" className="icarus-button icarus-button-ghost icarus-button-lg">
                            See everything else Icarus does
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
