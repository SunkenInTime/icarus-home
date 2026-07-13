"use client";

import Image from "next/image";
import Link from "next/link";
import { CSSProperties, ReactNode, useCallback, useState } from "react";
import { FaDiscord, FaGithub, FaWindows } from "react-icons/fa";

import versionInfo from "@/app/data/versionInfo";
import DitherFire from "../_shared/DitherFire";
import ProgressButton from "../_shared/ProgressButton";
import { easing, palette, shadow } from "../_shared/tokens";
import Drill from "./Drill";

/**
 * Concept 03/05 — "Thirty Seconds".
 *
 * A timeout you play through. The visitor runs the whole Icarus loop as a
 * guided drill — open the board, place the duo, draw the call, share it —
 * and every completed step surfaces one product truth. The 0:30 clock is
 * pure theater; the debrief afterwards is where the claims get made.
 */

const GITHUB_URL = "https://github.com/SunkenInTime/icarus";
const DISCORD_URL = "https://discord.gg/PN2uKwCqYB";

/*
 * The ts-* keyframes Drill.tsx animates with live here, inside the
 * no-preference media block: with reduced motion the keyframes simply
 * don't exist, so every `.ts-anim` element renders its final state
 * immediately. The reduce-block rule is belt and braces.
 */
const CSS = `
.ts-page { background: ${palette.bg}; color: ${palette.fg}; min-height: 100vh; }
.ts-page ::selection { background: rgba(124, 58, 237, 0.45); }
.ts-page a:focus-visible, .ts-page button:focus-visible { outline: 2px solid ${palette.violet}; outline-offset: 3px; }
@media (prefers-reduced-motion: no-preference) {
    @keyframes ts-roll {
        from { transform: translateY(0.85em); opacity: 0; }
        to { transform: none; opacity: 1; }
    }
    @keyframes ts-stamp {
        from { transform: scale(1.7); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    @keyframes ts-fade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: none; }
    }
    @keyframes ts-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.25; }
    }
}
@media (prefers-reduced-motion: reduce) {
    .ts-anim { animation: none !important; }
}
`;

/* ── Small shared pieces ───────────────────────────────────────── */

function Callsign({ children, style }: { children: ReactNode; style?: CSSProperties }) {
    return (
        <p className="callsign" style={{ margin: 0, color: palette.dim, ...style }}>
            {children}
        </p>
    );
}

function SectionHeading({ children }: { children: ReactNode }) {
    return (
        <h2
            className="font-onest"
            style={{
                margin: "14px 0 0",
                fontSize: "clamp(28px, 3.6vw, 40px)",
                lineHeight: 1.08,
                fontWeight: 600,
                letterSpacing: "-0.02em",
            }}
        >
            {children}
        </h2>
    );
}

function BodyCopy({ children, style }: { children: ReactNode; style?: CSSProperties }) {
    return (
        <p
            style={{
                margin: "16px 0 0",
                maxWidth: 560,
                fontSize: 15.5,
                lineHeight: 1.65,
                color: palette.muted,
                ...style,
            }}
        >
            {children}
        </p>
    );
}

/** Ally-green ping — the bullet point of a team that pings instead of types. */
function Ping() {
    return (
        <span
            aria-hidden
            style={{
                flexShrink: 0,
                marginTop: 5,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: palette.allyGreen,
                boxShadow: `0 0 0 2px ${palette.allyOutline}, 0 0 10px rgba(105, 240, 175, 0.2)`,
            }}
        />
    );
}

/* ── Debrief ───────────────────────────────────────────────────── */

const ROSTER = [
    {
        role: "The IGL",
        line: "You see the play before anyone else does. Stop narrating it into voice chat — draw it once and point.",
    },
    {
        role: "The five-stack",
        line: "One code and all five of you are looking at the same board. Arguments get shorter when the plan has coordinates.",
    },
    {
        role: "The coach",
        line: "Build the anti-strat set folder by folder, map by map. Walk in with the whole week already drawn.",
    },
] as const;

function Debrief() {
    return (
        <section id="debrief" className="px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-[880px]">
                <Callsign>{"the debrief — what the drill was really about"}</Callsign>
                <SectionHeading>The gap between the idea and the board is zero.</SectionHeading>
                <BodyCopy>
                    {
                        "That's the whole product. A timeout is thirty seconds; a good idea lasts about six. Icarus is built so nothing stands between the two — the board opens instantly, agents drop where you point, the pen is already in your hand. No login screen has ever won a round."
                    }
                </BodyCopy>

                {/* The real board. */}
                <div className="mt-12">
                    <div
                        style={{
                            borderRadius: 16,
                            overflow: "hidden",
                            border: `1px solid ${palette.border}`,
                            boxShadow: "0 40px 90px -40px rgba(0, 0, 0, 0.9)",
                        }}
                    >
                        <div
                            className="flex items-center justify-between px-4 py-2.5"
                            style={{ background: palette.card, borderBottom: `1px solid ${palette.border}` }}
                        >
                            <span className="callsign" style={{ color: palette.muted }}>
                                {"Icarus — the real board"}
                            </span>
                            <span className="callsign hidden sm:inline" style={{ color: palette.dim }}>
                                {"60fps · every map · every agent"}
                            </span>
                        </div>
                        <Image
                            src="/board-preview.png"
                            alt="The Icarus strategy board: a VALORANT map with drawn executes, agent markers, and the strat library"
                            width={2048}
                            height={1280}
                            className="block h-auto w-full"
                        />
                    </div>
                    <p className="callsign mt-3" style={{ fontSize: 10, color: palette.dim }}>
                        {"what you just did — but on Ascent, with your whole team on the board."}
                    </p>
                </div>

                {/* Who runs the drill. */}
                <div className="mt-20">
                    <Callsign>{"who this is for — pick your slot"}</Callsign>
                    <SectionHeading>Someone on your team is already this person.</SectionHeading>
                    <ul
                        className="mt-8 grid gap-8 sm:grid-cols-3"
                        style={{ listStyle: "none", margin: "32px 0 0", padding: 0 }}
                    >
                        {ROSTER.map((r) => (
                            <li key={r.role} className="flex gap-3">
                                <Ping />
                                <div>
                                    <p className="callsign" style={{ margin: 0, color: palette.fg }}>
                                        {r.role}
                                    </p>
                                    <p
                                        style={{
                                            margin: "6px 0 0",
                                            fontSize: 13.5,
                                            lineHeight: 1.6,
                                            color: palette.muted,
                                        }}
                                    >
                                        {r.line}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Local-first. */}
                <div
                    className="mt-20 grid gap-8 sm:grid-cols-[220px_minmax(0,1fr)]"
                    style={{
                        background: palette.card,
                        border: `1px solid ${palette.border}`,
                        borderRadius: 16,
                        padding: "28px 30px",
                    }}
                >
                    <div>
                        <Callsign style={{ color: palette.lavender }}>{"local-first"}</Callsign>
                        <p
                            className="font-onest"
                            style={{
                                margin: "10px 0 0",
                                fontSize: 22,
                                lineHeight: 1.2,
                                fontWeight: 600,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            The timeout ends. The plan stays.
                        </p>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.65, color: palette.muted }}>
                        <p style={{ margin: 0 }}>
                            {
                                "Every strat you draw is a file on your machine. No account to make, no server to trust, no sync spinner between you and your own ideas. Share codes hand a play to your five without either of you signing up for anything."
                            }
                        </p>
                        <p style={{ margin: "12px 0 0" }}>
                            {"Free and MIT-licensed, source and all. Optional Pro sync is coming for teams that want their playbook to follow them — the local board stays free either way."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Next round — download ─────────────────────────────────────── */

function NextRound() {
    const [progress, setProgress] = useState(0);
    const win = versionInfo.platforms.windows;

    // Quantize so the shader energizes without re-rendering every rAF tick.
    const onProgress = useCallback((p: number) => {
        setProgress((prev) => {
            const q = Math.round(p * 24) / 24;
            return q === prev ? prev : q;
        });
    }, []);

    return (
        <section id="download" className="px-6 pb-28 pt-8 sm:pb-32">
            <div className="mx-auto max-w-[640px] text-center">
                <Callsign>{"next round — buy phase"}</Callsign>
                <SectionHeading>Downloads in less than a timeout.</SectionHeading>
                <BodyCopy style={{ marginLeft: "auto", marginRight: "auto" }}>
                    {
                        "31 MB. By the time the barrier drops you'll have the board open and the first arrow down. The shader below is the app's real update dialog — it burns when a build lands."
                    }
                </BodyCopy>
            </div>

            <div
                className="mx-auto mt-12 max-w-[560px]"
                style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${palette.border}`,
                    background: palette.card,
                    boxShadow: shadow.menuLift,
                }}
            >
                <div aria-hidden style={{ height: 180, position: "relative", background: "#0b0a10" }}>
                    <DitherFire progress={progress} cell={9} />
                    <span
                        className="callsign"
                        style={{
                            position: "absolute",
                            left: 14,
                            bottom: 10,
                            fontSize: 9,
                            color: palette.dim,
                        }}
                    >
                        {"dither_fire.frag — wired to the button below. it's live."}
                    </span>
                </div>

                <div style={{ padding: "26px 28px 28px", textAlign: "center" }}>
                    <ProgressButton
                        href={win.url}
                        label="Download for Windows"
                        downloadingLabel={(p) => `Downloading… ${p}%`}
                        doneLabel="In your downloads. Call the play."
                        onProgress={onProgress}
                        style={{ width: "100%" }}
                    />
                    <p className="callsign mt-3.5" style={{ fontSize: 11, color: palette.dim }}>
                        {`v${versionInfo.version} · ${win.size} · ${versionInfo.released}`}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 12.5, color: palette.muted }}>
                        {"Free · MIT · No accounts"}
                    </p>

                    <div
                        className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
                        style={{ fontSize: 12.5 }}
                    >
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                            style={{ color: palette.muted }}
                        >
                            <FaGithub aria-hidden size={13} /> GitHub
                        </a>
                        <a
                            href={DISCORD_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                            style={{ color: palette.muted }}
                        >
                            <FaDiscord aria-hidden size={13} /> Discord
                        </a>
                        {win.secondaryUrl ? (
                            <a
                                href={win.secondaryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                                style={{ color: palette.muted }}
                            >
                                <FaWindows aria-hidden size={12} /> Microsoft Store
                            </a>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function ThirtySecondsClient() {
    return (
        <div className="ts-page relative overflow-x-clip">
            <style>{CSS}</style>

            {/* Concept badge. */}
            <Link
                href="/concepts"
                className="callsign"
                style={{
                    position: "fixed",
                    top: 18,
                    left: 20,
                    zIndex: 90,
                    fontSize: 10,
                    color: palette.muted,
                    background: "rgba(9, 9, 11, 0.82)",
                    border: `1px solid ${palette.border}`,
                    borderRadius: 6,
                    padding: "7px 11px",
                    backdropFilter: "blur(8px)",
                    textDecoration: "none",
                }}
            >
                {"Concept 03/05 — Thirty Seconds"}
            </Link>

            {/* Hero. */}
            <section className="relative overflow-hidden pt-28 sm:pt-36">
                <div
                    aria-hidden
                    className="tactical-dots absolute inset-0"
                    style={{
                        opacity: 0.55,
                        maskImage: "radial-gradient(900px 480px at 50% 18%, black, transparent)",
                        WebkitMaskImage: "radial-gradient(900px 480px at 50% 18%, black, transparent)",
                    }}
                />
                <div className="relative mx-auto max-w-[880px] px-6 text-center">
                    <Callsign>{"tech pause · attack · 11 – 12"}</Callsign>
                    <h1
                        className="font-onest"
                        style={{
                            margin: "22px 0 0",
                            fontSize: "clamp(40px, 6.6vw, 84px)",
                            lineHeight: 1.02,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Your team called a timeout.
                    </h1>
                    <BodyCopy style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 600 }}>
                        {
                            "You have thirty seconds. Show them the play. This is the entire Icarus loop — open, place, draw, share — as a drill you run yourself. The clock is theater. The milliseconds aren't."
                        }
                    </BodyCopy>
                    <p style={{ margin: "18px 0 0" }}>
                        <a
                            href="#debrief"
                            className="callsign underline-offset-4 hover:underline"
                            style={{ fontSize: 10, color: palette.muted, textDecoration: "none" }}
                        >
                            {"not a drills person? skip to the debrief ↓"}
                        </a>
                    </p>
                </div>
            </section>

            {/* The drill. */}
            <section id="drill" className="px-6 pb-24 pt-16 sm:pt-20">
                <div className="mx-auto max-w-[880px]">
                    <Drill />
                </div>
            </section>

            <div
                aria-hidden
                className="mx-auto max-w-[880px] px-6"
                style={{ borderTop: `1px solid ${palette.border}` }}
            />

            <Debrief />
            <NextRound />

            {/* Footer. */}
            <footer className="border-t px-6 py-10" style={{ borderColor: "rgba(255, 255, 255, 0.07)" }}>
                <div className="mx-auto flex max-w-[880px] flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="callsign" style={{ margin: 0, fontSize: 10, color: palette.dim }}>
                        {"concept 03/05 — thirty seconds · the clock was theater. the board is real."}
                    </p>
                    <div className="flex items-center gap-6" style={{ fontSize: 12 }}>
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-white"
                            style={{ color: palette.dim }}
                        >
                            GitHub
                        </a>
                        <a
                            href={DISCORD_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-white"
                            style={{ color: palette.dim }}
                        >
                            Discord
                        </a>
                        <Link
                            href="/concepts"
                            className="transition-colors hover:text-white"
                            style={{ color: palette.dim }}
                        >
                            All concepts
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/*
 * A note on easing: everything animated on this page runs 120–250ms on
 * easeOutCubic/easeOutQuart via the shared tokens — no bounce, no overshoot.
 */
void easing;
