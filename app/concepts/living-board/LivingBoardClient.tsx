"use client";

import { motion } from "framer-motion";
import { CSSProperties, ReactNode, useState, useSyncExternalStore } from "react";
import versionInfo from "@/app/data/versionInfo";
import DitherFire from "../_shared/DitherFire";
import FolderCard from "../_shared/FolderCard";
import ProgressButton from "../_shared/ProgressButton";
import { palette, shadow } from "../_shared/tokens";
import DrawingBoard from "./DrawingBoard";
import PagesBar from "./PagesBar";
import StratSketch from "./StratSketch";

/**
 * Concept 01/05 — The Living Board.
 *
 * The landing page IS an Icarus board: a fixed drawing canvas sits at z-1
 * (from DrawingBoard) above a dot lattice and below the copy. Content wrappers
 * are pointer-events:none so the empty gaps around text let the pen through to
 * the canvas; every actual text block, link, button, image and control flips
 * pointer-events back to auto so it stays fully interactive. That one trick is
 * what makes "draw on everything" and "click everything" both true at once.
 */

const GITHUB = "https://github.com/SunkenInTime/icarus";
const DISCORD = "https://discord.gg/PN2uKwCqYB";

const enter = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] as const },
};

// Fine-pointer capability, read via an external store so the page stays a
// normal (non-drawing) page on touch devices. Server snapshot is false, so
// the canvas mounts only after hydration where the capability is known.
function subscribeFinePointer(cb: () => void) {
    const mq = window.matchMedia("(pointer: fine)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
}

export default function LivingBoardClient() {
    const canDraw = useSyncExternalStore(
        subscribeFinePointer,
        () => window.matchMedia("(pointer: fine)").matches,
        () => false,
    );

    return (
        <main
            className="relative min-h-screen overflow-x-hidden"
            style={{ background: palette.bg, color: palette.fg }}
        >
            {/* Dot lattice — the board grain, beneath the canvas (z-0). */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
                    backgroundSize: "9.5px 9.5px",
                }}
            />

            {/* The pen. Fixed canvas at z-1; renders nothing on touch devices. */}
            <DrawingBoard enabled={canDraw} />

            {/* Concept badge, top-left. */}
            <a
                href="/concepts"
                className="callsign fixed left-4 top-4 z-[70] rounded-md px-2.5 py-1.5 transition-colors hover:text-[color:var(--lav)]"
                style={
                    {
                        "--lav": palette.lavender,
                        background: "rgba(24,24,27,0.96)",
                        border: `1px solid ${palette.border}`,
                        color: palette.muted,
                        fontSize: 10,
                        pointerEvents: "auto",
                    } as CSSProperties
                }
            >
                Concept 01/05 — The Living Board
            </a>

            {/* ————————————————————————————— Page 1 — The pitch ————————————————————————————— */}
            <section
                id="page-1"
                className="relative z-10 flex min-h-screen items-center px-6 sm:px-10"
                style={{ pointerEvents: "none" }}
            >
                <div className="relative mx-auto w-full max-w-5xl py-28">
                    <StratSketch />

                    <motion.div {...enter} className="relative z-[3]">
                        <span
                            className="callsign inline-block"
                            style={{ color: palette.dim, pointerEvents: "auto" }}
                        >
                            Page 1 — The pitch
                        </span>

                        <h1
                            className="font-onest mt-5 font-semibold leading-[0.98]"
                            style={{
                                fontSize: "clamp(52px, 9vw, 120px)",
                                letterSpacing: "-0.03em",
                                pointerEvents: "auto",
                                width: "fit-content",
                            }}
                        >
                            This page is a
                            <br />
                            whiteboard.
                        </h1>

                        <p
                            className="mt-7 max-w-xl text-[17px] leading-relaxed"
                            style={{ color: palette.muted, pointerEvents: "auto", width: "fit-content" }}
                        >
                            So is Icarus. Grab a pen from the dock and draw on the pitch — that&apos;s
                            the product. The distance between an idea and the board is zero.
                        </p>

                        <p
                            className="callsign mt-5"
                            style={{ color: palette.dim, pointerEvents: "auto", width: "fit-content" }}
                        >
                            Free · MIT · No accounts · v{versionInfo.version}
                        </p>

                        <div
                            className="mt-9 flex flex-wrap items-center gap-3"
                            style={{ pointerEvents: "auto", width: "fit-content" }}
                        >
                            <a
                                href="#page-4"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document
                                        .getElementById("page-4")
                                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className="inline-flex h-[44px] items-center rounded-lg px-5 text-[14px] font-semibold transition-transform hover:-translate-y-0.5"
                                style={{ background: palette.violet, color: "#f9fafb" }}
                            >
                                Take the board home
                            </a>
                            <a
                                href={GITHUB}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-[44px] items-center gap-2 rounded-lg px-5 text-[14px] font-medium transition-colors hover:bg-white/[0.04]"
                                style={{
                                    border: `1px solid ${palette.border}`,
                                    color: palette.fg,
                                }}
                            >
                                <StarIcon />
                                Star on GitHub
                            </a>
                        </div>
                    </motion.div>

                    {/* Handwritten annotations — auto pointer-events so they read as ink, not UI. */}
                    <span
                        aria-hidden
                        className="callsign absolute -bottom-2 right-4 z-[3] hidden lg:block"
                        style={{ color: palette.dim, fontSize: 10, transform: "rotate(-4deg)" }}
                    >
                        ↙ site take, but for ideas
                    </span>
                    <span
                        aria-hidden
                        className="callsign absolute -top-2 left-1 z-[3] hidden lg:block"
                        style={{ color: palette.dim, fontSize: 10, transform: "rotate(-3deg)" }}
                    >
                        start here ↓
                    </span>
                </div>
            </section>

            {/* ————————————————————————————— Page 2 — The tools ————————————————————————————— */}
            <section
                id="page-2"
                className="relative z-10 px-6 py-24 sm:px-10 sm:py-32"
                style={{ pointerEvents: "none" }}
            >
                <motion.div {...enter} className="mx-auto max-w-5xl">
                    <Annotation>Page 2 — The tools</Annotation>
                    <h2
                        className="font-onest mt-4 max-w-2xl text-[clamp(30px,4.5vw,52px)] font-semibold leading-[1.03]"
                        style={{ letterSpacing: "-0.025em", pointerEvents: "auto", width: "fit-content" }}
                    >
                        Everything you drew with is the app.
                    </h2>
                    <p
                        className="mt-4 max-w-lg text-[16px] leading-relaxed"
                        style={{ color: palette.muted, pointerEvents: "auto", width: "fit-content" }}
                    >
                        That dock isn&apos;t a demo. It&apos;s the real toolbar, on real maps, with
                        your whole library one click away.
                    </p>

                    <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
                        {/* Board screenshot with leader-line callouts. */}
                        <div className="relative" style={{ pointerEvents: "auto", width: "fit-content" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/board-preview.png"
                                alt="An Icarus board with a strat drawn across the map"
                                width={2048}
                                height={1280}
                                className="block h-auto w-full"
                                style={{
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 16,
                                    boxShadow: shadow.cardForeground,
                                }}
                            />
                            {/* Leader lines + labels, drawn over the frame. */}
                            <svg
                                aria-hidden
                                viewBox="0 0 100 62.5"
                                preserveAspectRatio="none"
                                className="pointer-events-none absolute inset-0 h-full w-full"
                            >
                                <path d="M8 8 L 22 20" stroke={palette.lavender} strokeWidth="0.3" strokeDasharray="0.6 1" strokeLinecap="round" />
                                <path d="M52 58 L 40 44" stroke={palette.lavender} strokeWidth="0.3" strokeDasharray="0.6 1" strokeLinecap="round" />
                                <path d="M92 12 L 74 24" stroke={palette.lavender} strokeWidth="0.3" strokeDasharray="0.6 1" strokeLinecap="round" />
                            </svg>
                            <Callout style={{ top: "4%", left: "2%" }}>your whole library</Callout>
                            <Callout style={{ bottom: "2%", left: "38%" }}>the pen you just used</Callout>
                            <Callout style={{ top: "8%", right: "2%" }}>agents, abilities, lineups</Callout>
                        </div>

                        {/* On-canvas-style feature notes. */}
                        <div className="flex flex-col gap-3" style={{ pointerEvents: "auto", width: "fit-content" }}>
                            <Note title="Zero gap">
                                Open, click, draw. No project setup, no import step, no waiting on a
                                server round-trip.
                            </Note>
                            <Note title="Customizable board">
                                Recolor maps, stash agents and abilities, drop lineups — arrange the
                                surface the way you think.
                            </Note>
                            <Note title="60fps, native">
                                A real Windows canvas, not a browser tab pretending. Fixes ship in
                                days, not quarters.
                            </Note>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ————————————————————————————— Page 3 — Yours, locally ————————————————————————————— */}
            <section
                id="page-3"
                className="relative z-10 px-6 py-24 sm:px-10 sm:py-32"
                style={{ pointerEvents: "none" }}
            >
                <motion.div {...enter} className="mx-auto max-w-5xl">
                    <Annotation>Page 3 — Yours, locally</Annotation>
                    <h2
                        className="font-onest mt-4 max-w-2xl text-[clamp(30px,4.5vw,52px)] font-semibold leading-[1.03]"
                        style={{ letterSpacing: "-0.025em", pointerEvents: "auto", width: "fit-content" }}
                    >
                        It never leaves this machine.
                    </h2>

                    <div className="relative mt-12">
                        {/* Dotted "your machine" boundary. */}
                        <div
                            className="relative"
                            style={{
                                border: "1px dashed rgba(255,255,255,0.16)",
                                borderRadius: 16,
                                padding: "clamp(24px, 4vw, 44px)",
                                pointerEvents: "auto",
                                width: "fit-content",
                                maxWidth: "100%",
                            }}
                        >
                            <span
                                className="callsign absolute -top-2.5 left-6 px-2"
                                style={{ background: palette.bg, color: palette.dim, fontSize: 10 }}
                            >
                                your machine
                            </span>

                            <div className="flex flex-col items-start gap-9 sm:flex-row sm:items-center">
                                <FolderCard
                                    name="Ranked strats"
                                    baseColor={palette.allyGreen}
                                    footer="0 servers involved"
                                />
                                <div className="max-w-sm">
                                    <p className="text-[15px] leading-relaxed" style={{ color: palette.muted }}>
                                        No accounts. No telemetry by default. Your strats live in
                                        folders on your disk, and they stay there. Export a share code
                                        when — and only when — you want to.
                                    </p>
                                    <p className="mt-3 text-[14px] leading-relaxed" style={{ color: palette.dim }}>
                                        Pro sync is coming for teams. Opt-in, never assumed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <span
                            aria-hidden
                            className="callsign mt-4 block"
                            style={{ color: palette.dim, fontSize: 10, opacity: 0.7 }}
                        >
                            everything else ↑ — a cloud you never asked for
                        </span>
                    </div>
                </motion.div>
            </section>

            {/* ————————————————————————————— Page 4 — Download ————————————————————————————— */}
            <section
                id="page-4"
                className="relative z-10 flex flex-col items-center px-6 py-28 sm:px-10 sm:py-36"
                style={{ pointerEvents: "none" }}
            >
                <motion.div {...enter} className="flex w-full flex-col items-center">
                    <Annotation>Page 4 — Download</Annotation>
                    <DownloadCard />

                    <p
                        className="mt-8 text-center text-[13px]"
                        style={{ color: palette.dim, pointerEvents: "auto" }}
                    >
                        Icarus — local-first Valorant strategy planner.{" "}
                        <a href="/tos" className="underline decoration-dotted underline-offset-2 hover:text-[color:var(--fg)]" style={{ ["--fg" as string]: palette.muted }}>
                            Terms
                        </a>
                    </p>
                </motion.div>
            </section>

            <PagesBar />
        </main>
    );
}

/* ————————————————————————————— Download card ————————————————————————————— */

function DownloadCard() {
    const [progress, setProgress] = useState(0);
    const win = versionInfo.platforms.windows;

    return (
        <div
            className="w-full max-w-[560px] overflow-hidden"
            style={{
                background: palette.card,
                border: `1px solid ${palette.border}`,
                borderRadius: 22,
                boxShadow: shadow.cardForeground,
                pointerEvents: "auto",
            }}
        >
            {/* DitherFire banner — energizes with the real download progress. */}
            <div className="relative" style={{ height: 180 }}>
                <DitherFire progress={progress} cell={9} />
                <div className="absolute inset-0 flex items-center gap-3 px-7">
                    <span
                        aria-hidden
                        className="grid h-11 w-11 place-items-center rounded-[13px]"
                        style={{
                            background: "rgba(9,9,11,0.72)",
                            border: `1px solid ${palette.border}`,
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                                d="M12 3 L 21 20 H 3 Z"
                                fill="none"
                                stroke={palette.lavender}
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                            />
                            <path d="M12 9 v 7" stroke={palette.lavender} strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </span>
                    <span className="font-onest text-[26px] font-semibold" style={{ letterSpacing: "-0.02em" }}>
                        Icarus
                    </span>
                </div>
            </div>

            {/* Body. */}
            <div className="px-7 pb-7 pt-6">
                <p className="callsign" style={{ color: palette.dim, fontSize: 10 }}>
                    v{versionInfo.version} · Released {versionInfo.released}
                </p>

                <div className="mt-4">
                    <ProgressButton
                        href={win.url}
                        label="Download for Windows"
                        downloadingLabel={(p) => `Downloading… ${p}%`}
                        doneLabel="In your downloads folder"
                        onProgress={setProgress}
                        style={{ width: "100%" }}
                    />
                </div>

                <p className="mt-4 text-[13px]" style={{ color: palette.dim }}>
                    {win.size} · v{versionInfo.version} ·{" "}
                    {win.secondaryUrl ? (
                        <a
                            href={win.secondaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[color:var(--lav)]"
                            style={{ ["--lav" as string]: palette.lavender }}
                        >
                            {win.secondaryLabel ?? "Microsoft Store"}
                        </a>
                    ) : (
                        "Microsoft Store"
                    )}
                </p>

                <div
                    className="mt-5 flex items-center gap-4 border-t pt-5 text-[13px]"
                    style={{ borderColor: palette.border }}
                >
                    <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--lav)]" style={{ color: palette.muted, ["--lav" as string]: palette.lavender }}>
                        <StarIcon />
                        GitHub
                    </a>
                    <a href={DISCORD} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--lav)]" style={{ color: palette.muted, ["--lav" as string]: palette.lavender }}>
                        <DiscordIcon />
                        Discord
                    </a>
                </div>
            </div>
        </div>
    );
}

/* ————————————————————————————— Small parts ————————————————————————————— */

function Annotation({ children }: { children: ReactNode }) {
    return (
        <span
            className="callsign inline-block"
            style={{ color: palette.dim, fontSize: 10, pointerEvents: "auto" }}
        >
            {children}
        </span>
    );
}

function Callout({ children, style }: { children: ReactNode; style?: CSSProperties }) {
    return (
        <span
            className="callsign absolute whitespace-nowrap rounded-md px-2 py-1"
            style={{
                background: "rgba(9,9,11,0.86)",
                border: `1px solid ${palette.border}`,
                color: palette.lavender,
                fontSize: 9,
                letterSpacing: "0.1em",
                ...style,
            }}
        >
            {children}
        </span>
    );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div
            style={{
                background: palette.card,
                border: `1px solid ${palette.border}`,
                borderRadius: 10,
                padding: "12px 14px",
            }}
        >
            <p className="text-[13px] font-semibold" style={{ color: palette.fg }}>
                {title}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: palette.muted }}>
                {children}
            </p>
        </div>
    );
}

function StarIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="m12 3 2.7 5.5 6 .9-4.35 4.24 1.03 6-5.38-2.83L6.6 19.6l1.03-6L3.3 9.4l6-.9L12 3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function DiscordIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19.6 5.6A16 16 0 0 0 15.6 4.4l-.2.4a11 11 0 0 1 3.3 1.7 15 15 0 0 0-12.9 0 11 11 0 0 1 3.3-1.7l-.2-.4A16 16 0 0 0 4.4 5.6 16.7 16.7 0 0 0 1.7 17a16 16 0 0 0 4.9 2.5l.4-.7a10 10 0 0 1-1.7-.8l.4-.3a11.4 11.4 0 0 0 9.8 0l.4.3a10 10 0 0 1-1.7.8l.4.7A16 16 0 0 0 22.3 17a16.6 16.6 0 0 0-2.7-11.4ZM8.6 14.6c-.9 0-1.7-.9-1.7-1.9s.7-1.9 1.7-1.9 1.7.9 1.7 1.9-.7 1.9-1.7 1.9Zm6.8 0c-.9 0-1.7-.9-1.7-1.9s.7-1.9 1.7-1.9 1.7.9 1.7 1.9-.7 1.9-1.7 1.9Z" />
        </svg>
    );
}
