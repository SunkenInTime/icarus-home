"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FaDiscord, FaGithub } from "react-icons/fa";

import versionInfo from "@/app/data/versionInfo";
import ProgressButton from "../_shared/ProgressButton";
import { palette } from "../_shared/tokens";

import DemoVideo from "./DemoVideo";
import FlightPath from "./FlightPath";
import TorchlitExtras from "./TorchlitExtras";
import SunSection from "./SunSection";

/**
 * The production homepage — "Closer to the Sun", content pass 2.
 *
 * The rule of this pass: the myth lives in headlines and in the two big
 * visuals (flight path, sun). Everything else — labels, body copy, feature
 * names — talks about the product. Between the hero and the sun, every
 * visual is real Icarus UI.
 */

const win = versionInfo.platforms.windows;
const GITHUB_URL = "https://github.com/SunkenInTime/icarus";
const DISCORD_URL = "https://discord.gg/PN2uKwCqYB";

function SectionHeading({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <p className="callsign" style={{ color: palette.dim }}>
                {label}
            </p>
            <h2
                className="font-display mt-3"
                style={{
                    fontSize: "clamp(28px, 3.6vw, 44px)",
                    lineHeight: 1.08,
                    fontWeight: 700,
                    letterSpacing: "-0.015em",
                }}
            >
                {children}
            </h2>
        </>
    );
}

/* ── 1 · Hero: what it is, what it looks like, how to get it ───── */

/** A travelling wave that eases back to center before reaching the arrowhead. */
const ARROW_WAVE = Array.from({ length: 9 }, (_, frame) => {
    const phase = (frame / 8) * Math.PI * 2;
    const points = Array.from({ length: 51 }, (_, index) => {
        const y = index * 2;
        const taper = Math.max(0, Math.min(1, (100 - y) / 38));
        const x = 10 + Math.sin(y * 0.27 - phase) * 3.5 * taper;

        return `L ${x.toFixed(2)} ${y}`;
    });

    return `M 10 0 ${points.join(" ")}`;
});

function Hero() {
    const reduceMotion = useReducedMotion();

    return (
        <section className="tactical-dots relative flex min-h-screen flex-col justify-center">
            {/* The destination, sketched faint and far away in the corner of
                the sky — the real one blazes at the bottom of the page. */}
            <div
                aria-hidden
                className="pointer-events-none absolute right-[5%] top-[7%] hidden sm:block"
            >
                <Image
                    src="/assets/sun.png"
                    alt=""
                    width={118}
                    height={118}
                    style={{ opacity: 0.28 }}
                />
            </div>

            <div className="mx-auto w-full max-w-[1160px] px-6 pb-28 pt-24">
                <h1
                    className="font-display max-w-[15ch]"
                    style={{
                        fontSize: "clamp(40px, 6.2vw, 80px)",
                        lineHeight: 1.02,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                    }}
                >
                    The strategy board that actually flies.
                    {/* Y-reference only: the fall starts at headline height. */}
                    <span data-flight-anchor aria-hidden className="inline-block h-px w-px" />
                </h1>
                <p
                    className="mt-6 max-w-xl text-[16.5px] leading-[1.6]"
                    style={{ color: palette.muted }}
                >
                    Icarus is a free, open-source strategy board for VALORANT — local-first,
                    fast, and honestly just nice to use every day.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <ProgressButton
                        href={win.url}
                        label="Download"
                        downloadingLabel={(percent) => `Downloading… ${percent}%`}
                        doneLabel="Check your downloads"
                    />
                    <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[42px] items-center gap-2 rounded-lg border px-5 text-[14px] font-semibold transition-colors hover:border-white/30 hover:bg-white/[0.04]"
                        style={{ borderColor: "rgba(255,255,255,0.14)", color: palette.fg }}
                    >
                        <FaGithub aria-hidden />
                        View source
                    </a>
                </div>
                <div
                    className="relative mt-14 overflow-hidden rounded-2xl border"
                    style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        boxShadow:
                            "0 40px 90px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.12)",
                    }}
                >
                    <Image
                        src="/board-preview.png"
                        alt="The Icarus strategy board: a VALORANT map with drawn tactics, agents, and folders"
                        width={2048}
                        height={1280}
                        priority
                        className="block h-auto w-full"
                    />
                </div>
            </div>

            {/* Scroll hint: a drawn arrow pointing down, labeled "up". */}
            <div
                aria-hidden
                className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
            >
                <svg width="20" height="100" viewBox="0 0 20 100" fill="none">
                    <motion.path
                        d={ARROW_WAVE[0]}
                        animate={reduceMotion ? undefined : { d: ARROW_WAVE }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                        stroke="rgba(250,250,250,0.6)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                    />
                    <path
                        d="M1 91 L10 100 L19 91"
                        stroke="rgba(250,250,250,0.6)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="callsign" style={{ color: palette.muted }}>
                    up
                </span>
            </div>
        </section>
    );
}

/* ── 2 · Why Icarus: the three claims ──────────────────────────── */

const CLAIMS = [
    {
        title: "Fast",
        body: "Native desktop, 60fps canvas. The pen draws the second you do — you feel the board, not the software.",
    },
    {
        title: "Free",
        body: "MIT-licensed, no accounts, no premium tier. The best one happens to cost nothing.",
    },
    {
        title: "Yours",
        body: "Local-first. Your playbook lives on your machine, not on somebody's server.",
    },
] as const;

function Claims() {
    return (
        <section id="why" className="relative py-24 sm:py-28">
            {/* Flight path banks right past the claims. */}
            <span data-flight-anchor aria-hidden className="absolute right-[12%] top-[30%] h-2 w-2" />

            <div className="mx-auto max-w-[1160px] px-6">
                <p className="callsign" style={{ color: palette.dim }}>
                    why icarus
                </p>
                <div className="mt-8 grid gap-10 sm:grid-cols-3">
                    {CLAIMS.map((claim) => (
                        <div key={claim.title}>
                            <h2
                                className="font-display text-[26px]"
                                style={{ fontWeight: 700, letterSpacing: "-0.015em" }}
                            >
                                {claim.title}
                            </h2>
                            <p
                                className="mt-2 max-w-[36ch] text-[14.5px] leading-[1.65]"
                                style={{ color: palette.muted }}
                            >
                                {claim.body}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── 3 · The agent bar: the UX headline ────────────────────────── */

function AgentBar() {
    return (
        <section id="agent-bar" className="relative py-24 sm:py-32">
            {/* Flight path banks left through the agent bar. */}
            <span data-flight-anchor aria-hidden className="absolute left-[9%] top-[24%] h-2 w-2" />

            <div className="mx-auto grid w-full max-w-[1160px] items-center gap-14 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div>
                    <SectionHeading label="the agent bar">
                        Agents at your side.
                        <br />
                        <span style={{ color: palette.muted }}>Not under your canvas.</span>
                    </SectionHeading>
                    <p
                        className="mt-5 max-w-md text-[15.5px] leading-[1.7]"
                        style={{ color: palette.muted }}
                    >
                        Every other board buries agents in a bottom tray. Icarus mounts them on
                        the side of the map, so you grab, drop, and swap agents without breaking
                        your drawing flow. Right-click any agent for its full ability list — the
                        abilities live on the map too.
                    </p>
                </div>

                <DemoVideo
                    src="/sidebar-showcase.mp4"
                    label="The side-mounted agent bar in use: grabbing and dropping agents onto the map mid-strat"
                />
            </div>
        </section>
    );
}

/* ── 4 · Local-first: yours, provably ──────────────────────────── */

function LocalFirst() {
    return (
        <section id="local-first" className="relative py-24 sm:py-32">
            {/* Flight path banks right through local-first. */}
            <span data-flight-anchor aria-hidden className="absolute right-[14%] top-[32%] h-2 w-2" />

            <div className="mx-auto grid w-full max-w-[1160px] items-center gap-14 px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <DemoVideo
                    src="/strategy-export.mp4"
                    label="Exporting a strategy from Icarus as a file to share"
                    className="order-last md:order-first"
                />

                <div>
                    <SectionHeading label="local-first">
                        Yours, even offline.
                    </SectionHeading>
                    <p
                        className="mt-5 max-w-md text-[15.5px] leading-[1.7]"
                        style={{ color: palette.muted }}
                    >
                        No accounts. No servers. The playbook lives on your machine and works
                        anywhere — offline, on LAN, on tournament wifi. And nothing is locked
                        in: export any strategy as a file and hand it straight to a friend.
                    </p>
                    {/* The handed-off strategy, mid-flight to that friend. */}
                    <Image
                        aria-hidden
                        src="/assets/paper-plane.png"
                        alt=""
                        width={96}
                        height={96}
                        className="mt-6 hidden md:block"
                        style={{ opacity: 0.5, transform: "rotate(5deg)" }}
                    />
                </div>
            </div>
        </section>
    );
}

/* ── 5 · Community: built from feedback ────────────────────────── */

function Community() {
    return (
        <section id="community" className="relative py-24 sm:py-32">
            {/* Flight path banks left past the community section. */}
            <span data-flight-anchor aria-hidden className="absolute left-[13%] top-[30%] h-2 w-2" />

            {/* A wing, barely there, behind the people who built it. */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <Image
                    src="/assets/wing.png"
                    alt=""
                    width={540}
                    height={540}
                    style={{ opacity: 0.06 }}
                />
            </div>

            <div className="relative mx-auto max-w-[760px] px-6 text-center">
                <SectionHeading label="community">
                    Built in the open, steered by players.
                </SectionHeading>
                <p
                    className="mx-auto mt-5 max-w-lg text-[15.5px] leading-[1.7]"
                    style={{ color: palette.muted }}
                >
                    Icarus ships from feedback. Tell us what&rsquo;s broken or missing in the
                    Discord and it usually lands within a version or two — updates ship in
                    days, not quarters.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <a
                        href={DISCORD_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[42px] items-center gap-2 rounded-lg px-5 text-[14px] font-semibold transition-colors"
                        style={{ background: "#5865F2", color: "#fff" }}
                    >
                        <FaDiscord aria-hidden />
                        Join the Discord
                    </a>
                    <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[42px] items-center gap-2 rounded-lg border px-5 text-[14px] font-semibold transition-colors hover:border-white/30 hover:bg-white/[0.04]"
                        style={{ borderColor: "rgba(255,255,255,0.14)", color: palette.fg }}
                    >
                        <FaGithub aria-hidden />
                        Open an issue
                    </a>
                </div>
            </div>
        </section>
    );
}

/* ── 6 · Extras: found by torchlight (see TorchlitExtras) ──────── */

/* ── Page ──────────────────────────────────────────────────────── */

export default function CloserToTheSunClient() {
    return (
        <div className="min-h-screen" style={{ background: palette.bg, color: palette.fg }}>
            {/* FlightPath threads through everything inside this wrapper. */}
            <main className="relative">
                <FlightPath />
                <Hero />
                <Claims />
                <AgentBar />
                <LocalFirst />
                <Community />
                <TorchlitExtras />
                <SunSection />
            </main>
        </div>
    );
}
