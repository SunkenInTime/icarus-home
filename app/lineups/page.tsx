import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Wordmark from "@/app/components/Wordmark";
import { palette } from "@/app/concepts/_shared/tokens";
import { getLatestVersionInfo } from "@/app/lib/getLatestVersionInfo";
import { absoluteUrl, siteConfig } from "@/app/seo";

export const revalidate = 3600;

const title = "Save Valorant Lineups";
const description =
    "Save your VALORANT lineups on the map in Icarus: where you stand, where the ability lands, and the clip, screenshots and notes for each throw. Free and open source.";

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
        images: [{ url: "/lineups/lineups-on-bind.png", alt: "Lineups on Bind in Icarus" }],
    },
    twitter: {
        card: "summary_large_image",
        site: "@icarusstrats",
        creator: "@daradoescode",
        title: `${title} | ${siteConfig.name}`,
        description,
        images: ["/lineups/lineups-on-bind.png"],
    },
};

const STEPS = [
    {
        title: "Start a lineup",
        body: "Press G, or click Add Lineup in the sidebar.",
    },
    {
        title: "Place where you throw from",
        body: "Drag the agent to the spot you stand on.",
    },
    {
        title: "Place where it lands",
        body: "Drag the ability to where it lands, then press Next.",
    },
    {
        title: "Add what you need to repeat it",
        body: "Give it a name, paste a YouTube link, add screenshots, and write notes. Paste images straight from your clipboard.",
    },
] as const;

const FAQ = [
    {
        question: "Is it free?",
        answer: "Yes. Icarus is free and open source under the Apache 2.0 license, and it has no premium tier.",
    },
    {
        question: "Do I need an account?",
        answer: "No. In the Windows app, lineups save to your computer and work offline. Sign in and move a strategy to the cloud only if you want it on your other computers and the web version, or want to edit it live with teammates.",
    },
    {
        question: "Can I browse other people's lineups?",
        answer: "Icarus is for the lineups you collect and the ones your team shares with you. It isn't a public lineup database.",
    },
    {
        question: "Does it run on Mac or Linux?",
        answer: "The app is for Windows. The web version runs in a browser once you sign in, and shows the strategies you keep in the cloud, lineups included.",
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
                        Save your Valorant lineups where you plan.
                    </h1>
                    <Body className="mt-6 max-w-xl text-[16.5px]">
                        Icarus keeps each lineup on the map: where you stand, where the ability lands,
                        and the clip, screenshots and notes you need to land it again. It&rsquo;s free,
                        and the Windows app works offline.
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
                            A standing spot can lead to several landings, and a landing can be reached
                            from several spots. Click an ability to see every lineup that lands there,
                            or click an agent to see every lineup thrown from that spot. Each one opens
                            its clip, screenshots and notes.
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
                        Lineups live in a strategy, next to the plays they belong to. Share the
                        strategy with a code or a file and your teammates get every lineup in it. If
                        you sign in, put the strategy in the cloud and edit it together live. You&rsquo;ll
                        see who is changing which lineup while they do it.
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
