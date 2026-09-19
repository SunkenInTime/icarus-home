"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FaDiscord, FaGithub } from "react-icons/fa";

import versionInfo from "@/app/data/versionInfo";
import ProgressButton from "../_shared/ProgressButton";
import { easing, palette } from "../_shared/tokens";

import DemoVideo from "./DemoVideo";
import FlightPath from "./FlightPath";
import PointerField from "./PointerField";
import SunPreEcho, { type PreEchoShape } from "./SunPreEcho";
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

const SUN_RAY_CLIPS = [
    "polygon(47% 7%, 53% 7%, 53% 29%, 47% 29%)",
    "polygon(20% 18%, 37% 18%, 37% 35%, 20% 35%)",
    "polygon(38% 21%, 44% 21%, 44% 30%, 38% 30%)",
    "polygon(59% 17%, 68% 17%, 68% 31%, 59% 31%)",
    "polygon(68% 23%, 86% 23%, 86% 38%, 68% 38%)",
    "polygon(19% 38%, 31% 38%, 31% 45%, 19% 45%)",
    "polygon(71% 39%, 83% 39%, 83% 46%, 71% 46%)",
    "polygon(9% 52%, 30% 52%, 30% 61%, 9% 61%)",
    "polygon(72% 50%, 94% 50%, 94% 59%, 72% 59%)",
    "polygon(24% 61%, 33% 61%, 33% 69%, 24% 69%)",
    "polygon(69% 61%, 80% 61%, 80% 71%, 69% 71%)",
    "polygon(27% 68%, 40% 68%, 40% 86%, 27% 86%)",
    "polygon(47% 72%, 51% 72%, 51% 85%, 47% 85%)",
    "polygon(61% 68%, 78% 68%, 78% 90%, 61% 90%)",
] as const;

const SUN_RAY_ORIGINS = [
    "50% 28%",
    "35% 33%",
    "42% 29%",
    "61% 29%",
    "69% 36%",
    "29% 42%",
    "73% 44%",
    "28% 55%",
    "73% 53%",
    "31% 64%",
    "70% 64%",
    "38% 69%",
    "50% 73%",
    "63% 70%",
] as const;

const SUN_IMAGE_STYLE = {
    backgroundImage: 'url("/assets/sun.png")',
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
} as const;

const SUN_RAY_FRAME_COUNT = 6;

/**
 * Sized to sit between the original 118px (invisible) and the 620px first pass
 * (dominant): present in the corner of the eye, not competing with the
 * headline. Nudge SUN_SIZE alone to re-tune; the offsets bleed it off the
 * corner proportionally enough to hold.
 */
const SUN_SIZE = "clamp(200px, 22vw, 320px)";
const SUN_OPACITY = 0.17;
const SUN_OPACITY_WARM = 0.36;

/**
 * The bigger swings from the homepage review. Production ships the ones that
 * landed (hairline pre-echo, word cascade); the rest stay behind flags at
 * /concepts/bigger-swings so they can still be judged against that baseline.
 */
export type BigSwings = {
    /** A cold slice of the sun's own field, brought up into the hero. */
    preEcho?: boolean;
    /** Where that field sits relative to the copy. See SunPreEcho. */
    preEchoShape?: PreEchoShape;
    /** Live overrides for the pre-echo's band height and field energy. */
    preEchoDepth?: number;
    preEchoHeat?: number;
    /** A torchlight pool in the hero backdrop that follows the pointer. */
    pointerField?: boolean;
    /** Lead with the agent-bar demo so the first scroll lands on a visual. */
    reorder?: boolean;
    /** Cascade the headline word by word instead of as one block. */
    wordReveal?: boolean;
    /** Draw a violet pen stroke under the last word once the headline lands. */
    drawnUnderline?: boolean;
};

/** What the homepage actually ships. The judging rig starts here too. */
export const SHIPPED_SWINGS: BigSwings = {
    preEcho: true,
    preEchoShape: "hairline",
    wordReveal: true,
};

function getRandomizedRayScales(index: number): number[] {
    const samples = Array.from({ length: SUN_RAY_FRAME_COUNT }, (_, frame) => {
        let value =
            Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(frame + 1, 0x27d4eb2d);
        value ^= value >>> 16;
        return (value >>> 0) / 0xffffffff;
    });
    const minimum = Math.min(...samples);
    const maximum = Math.max(...samples);
    const lengthShift = 0.085 + (index % 4) * 0.012;

    return samples.map((sample) => {
        const normalized = (sample - minimum) / (maximum - minimum);
        return 1 + (normalized * 2 - 1) * lengthShift;
    });
}

function getRayStyle(clipPath: string, index: number): React.CSSProperties {
    const scales = getRandomizedRayScales(index);

    return {
        ...SUN_IMAGE_STYLE,
        clipPath,
        transformOrigin: SUN_RAY_ORIGINS[index],
        animationDelay: `${-((index * 137) % 500)}ms`,
        "--ray-s-0": `${scales[0]}`,
        "--ray-s-1": `${scales[1]}`,
        "--ray-s-2": `${scales[2]}`,
        "--ray-s-3": `${scales[3]}`,
        "--ray-s-4": `${scales[4]}`,
        "--ray-s-5": `${scales[5]}`,
    } as React.CSSProperties;
}

function AnimatedSun({ warm }: { warm: boolean }) {
    return (
        <div
            data-animated-sun
            aria-hidden
            className="pointer-events-none absolute hidden sm:block"
            style={{
                top: -56,
                right: -44,
                width: SUN_SIZE,
                height: SUN_SIZE,
                opacity: warm ? SUN_OPACITY_WARM : SUN_OPACITY,
                transition: `opacity 420ms ${easing.outCubic}`,
            }}
        >
            <div data-sun-artwork className="absolute inset-0">
                <div
                    data-sun-circle
                    className="absolute inset-0"
                    style={{ ...SUN_IMAGE_STYLE, clipPath: "inset(29% 28% 28% 30%)" }}
                />
                {SUN_RAY_CLIPS.map((clipPath, index) => (
                    <div
                        key={clipPath}
                        data-sun-ray
                        className="sun-ray-on-twos absolute inset-0"
                        style={getRayStyle(clipPath, index)}
                    />
                ))}
            </div>
        </div>
    );
}

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

/**
 * Arrival order for the hero, in ms. Nothing else on the page animates on
 * mount, so this is the page's only chance to read as authored rather than
 * as a screenshot. The board comes last but stays early: it is the largest
 * paint on the page and an invisible element cannot serve as LCP.
 */
const REVEAL = { headline: 60, body: 170, actions: 250, board: 340 } as const;

const HEADLINE_WORDS = ["The", "free", "VALORANT", "strategy", "board."] as const;
/** Per-word cascade. Tight enough that the body can still land underneath it. */
const WORD_STEP = 45;

/**
 * The pen, applied to the page: a wobbling stroke that draws itself under the
 * last word once the headline has landed. Stretched to the word with
 * preserveAspectRatio="none", so the stroke width is held by vectorEffect.
 */
function UnderlinedWord({ word }: { word: string }) {
    return (
        <span className="relative inline-block">
            {word}
            <svg
                aria-hidden
                className="absolute left-0 w-full"
                style={{ bottom: "-0.04em", height: "0.16em", overflow: "visible" }}
                viewBox="0 0 240 12"
                preserveAspectRatio="none"
                fill="none"
            >
                <path
                    className="draw-stroke"
                    d="M3 8.4C34 4.2 68 10.4 104 6.1 140 1.8 176 9.6 210 5.2 222 3.6 230 6 237 7.4"
                    stroke={palette.violet}
                    strokeWidth={3}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </span>
    );
}

function Headline({ perWord, underline }: { perWord: boolean; underline: boolean }) {
    return (
        <>
            {HEADLINE_WORDS.map((word, index) => {
                const last = index === HEADLINE_WORDS.length - 1;
                const glyphs = last && underline ? <UnderlinedWord word={word} /> : word;

                return (
                    <span key={word}>
                        {index > 0 ? " " : null}
                        {perWord ? (
                            <span
                                className="rise-in inline-block"
                                style={{
                                    animationDelay: `${REVEAL.headline + index * WORD_STEP}ms`,
                                }}
                            >
                                {glyphs}
                            </span>
                        ) : (
                            glyphs
                        )}
                    </span>
                );
            })}
            {/* Y-reference only: the fall starts at headline height. */}
            <span data-flight-anchor aria-hidden className="inline-block h-px w-px" />
        </>
    );
}

function Hero({ swings }: { swings: BigSwings }) {
    const reduceMotion = useReducedMotion();
    const [sunWarm, setSunWarm] = useState(false);
    const warmTimer = useRef(0);

    useEffect(() => () => window.clearTimeout(warmTimer.current), []);

    // Reaching for the download leans the sun brighter for a beat — the same
    // answer SunSection gives a pointer entering the fire.
    function warmForABeat() {
        setSunWarm(true);
        window.clearTimeout(warmTimer.current);
        warmTimer.current = window.setTimeout(() => setSunWarm(false), 900);
    }

    // Two dot grids at different pitches read as moiré, so the pointer field
    // replaces the static one rather than stacking on it. PointerField renders
    // the static grid itself when it can't animate.
    const litBackdrop = Boolean(swings.pointerField);
    const perWord = Boolean(swings.wordReveal);

    return (
        <section
            className={`relative flex min-h-screen flex-col justify-center overflow-hidden ${
                litBackdrop ? "" : "tactical-dots"
            }`}
        >
            {/* Only the ray lengths change, held on twos like redrawn frames. */}
            <AnimatedSun warm={sunWarm} />
            {swings.preEcho && (
                <SunPreEcho
                    shape={swings.preEchoShape}
                    depth={swings.preEchoDepth}
                    heat={swings.preEchoHeat}
                    warm={sunWarm}
                />
            )}
            {swings.pointerField && <PointerField />}

            {/* Positioned, so the copy paints over the sun rather than under it. */}
            <div className="relative mx-auto w-full max-w-[1160px] px-6 pb-8 pt-24">
                <h1
                    className={`font-display mx-auto max-w-[15ch] text-center ${perWord ? "" : "rise-in"}`}
                    style={{
                        fontSize: "clamp(40px, 6.2vw, 80px)",
                        lineHeight: 1.02,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        animationDelay: `${REVEAL.headline}ms`,
                    }}
                >
                    <Headline perWord={perWord} underline={Boolean(swings.drawnUnderline)} />
                </h1>
                <p
                    className="rise-in mx-auto mt-6 max-w-xl text-center text-[16.5px] leading-[1.6]"
                    style={{ color: palette.muted, animationDelay: `${REVEAL.body}ms` }}
                >
                    Map out executes and share strats your team can follow. Works offline,
                    with no account or paid tier.
                </p>

                <div
                    className="rise-in mt-8 flex flex-wrap items-center justify-center gap-4"
                    style={{ animationDelay: `${REVEAL.actions}ms` }}
                >
                    <span className="inline-flex" onPointerEnter={warmForABeat} onFocus={warmForABeat}>
                        <ProgressButton
                            href={win.url}
                            label="Download"
                            downloadingLabel={(percent) => `Downloading… ${percent}%`}
                            doneLabel="Check your downloads"
                        />
                    </span>
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
                    className="rise-lift relative mt-14 overflow-hidden rounded-2xl border"
                    style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        boxShadow:
                            "0 40px 90px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.12)",
                        animationDelay: `${REVEAL.board}ms`,
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
                {/* Keep the scroll hint in flow so it always starts after the board. */}
                <div
                    aria-hidden
                    className="mt-7 flex flex-col items-center gap-2"
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
                <h2 className="sr-only">Why use Icarus</h2>
                <p className="callsign" style={{ color: palette.dim }}>
                    why icarus
                </p>
                <div className="mt-8 grid gap-10 sm:grid-cols-3">
                    {CLAIMS.map((claim) => (
                        <div key={claim.title}>
                            <h3
                                className="font-display text-[26px]"
                                style={{ fontWeight: 700, letterSpacing: "-0.015em" }}
                            >
                                {claim.title}
                            </h3>
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

export default function CloserToTheSunClient({
    swings = SHIPPED_SWINGS,
}: {
    swings?: BigSwings;
}) {
    return (
        <div className="min-h-screen" style={{ background: palette.bg, color: palette.fg }}>
            {/* FlightPath threads through everything inside this wrapper. */}
            <main className="relative">
                <FlightPath />
                <Hero swings={swings} />
                {swings.reorder ? (
                    <>
                        <AgentBar />
                        <Claims />
                    </>
                ) : (
                    <>
                        <Claims />
                        <AgentBar />
                    </>
                )}
                <LocalFirst />
                <Community />
                <TorchlitExtras />
                <SunSection />
            </main>
        </div>
    );
}
