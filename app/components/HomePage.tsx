"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaGithub } from "react-icons/fa";

import type { VersionInfo } from "@/app/data/versionInfo";

import ShareLinkHandler from "@/app/components/ShareLinkHandler";
import { useMagnetic, useParallax, useSpotlight } from "@/app/components/hooks";

const ACCENT = "#7c3aed";

/* ── Content constants ─────────────────────────────────────────── */

const META = {
    name: "Icarus",
    short: "Local-first Valorant strategy planner.",
} as const;

const NAV_LINKS = [
    ["Principles", "#principles"],
    ["Preview", "#preview"],
    ["Download", "#download"],
] as const;

const SOCIAL_LINKS = {
    github: "https://github.com/SunkenInTime/icarus",
    discord: "https://discord.gg/PN2uKwCqYB",
    twitter: "https://x.com/daradoescode",
} as const;

const PRINCIPLES = [
    {
        n: "01",
        title: "Zero gap",
        body:
            "The distance between an idea and the board is nothing. Open. Click. Draw. No menus to dig through, no modal stacks.",
    },
    {
        n: "02",
        title: "Customizable",
        body:
            "Map themes, color palettes, agent presets, draw tools — every layer of the board bends to your team\u2019s workflow.",
    },
    {
        n: "03",
        title: "Local stays free",
        body:
            "The local-first planner stays free. Pro online mode is coming for teams who want sync and shared workflows.",
    },
    {
        n: "04",
        title: "Updates fast",
        body:
            "Auto-updater pushes new builds the moment they ship. Bugs get fixed in days, not quarters.",
    },
    {
        n: "05",
        title: "Responsive",
        body:
            "60+ FPS canvas, native desktop performance, snappy keyboard shortcuts. The board never gets in the way.",
    },
    {
        n: "06",
        title: "Local-first",
        body:
            "Your strategies stay on your device. No accounts, no servers, no telemetry by default. Export when you\u2019re ready.",
    },
] as const;

/* ── Page ──────────────────────────────────────────────────────── */

type Props = {
    latestVersion: VersionInfo;
};

/**
 * Icarus homepage — Showcase design. Confident centered hero with the
 * app screenshot living in the same viewport as the headline. The hero
 * responds to the cursor: a violet halo tracks the mouse, the device
 * frame parallaxes a few pixels, and the primary CTA is magnetic.
 */
export default function HomePage({ latestVersion }: Props) {
    return (
        <div className="relative min-h-screen text-white" style={{ background: "#08080a" }}>
            <Header />
            <ShareLinkHandler />
            <main>
                <Hero />
                <Principles />
                <Download latestVersion={latestVersion} />
            </main>
            <Footer />
        </div>
    );
}

/* ── Header ────────────────────────────────────────────────────── */

function Header() {
    return (
        <header
            className="sticky top-0 z-40 border-b backdrop-blur-md"
            style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "rgba(8,8,10,0.7)",
            }}
        >
            <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        width={22}
                        height={22}
                        className="rounded"
                        src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN"
                        alt=""
                    />
                    <span className="font-onest text-[15px] font-medium">Icarus</span>
                </Link>

                <nav
                    className="hidden md:flex items-center gap-7 text-[13px]"
                    style={{ color: "#a1a1aa" }}
                >
                    {NAV_LINKS.map(([label, href]) => (
                        <a
                            key={label}
                            href={href}
                            className="transition-colors hover:text-white"
                        >
                            {label}
                        </a>
                    ))}
                    <a
                        href={SOCIAL_LINKS.github}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-white"
                    >
                        GitHub
                    </a>
                </nav>

                <a
                    href="#download"
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px]"
                    style={{ background: "#fafafa", color: "#0a0a0a" }}
                >
                    Download
                </a>
            </div>
        </header>
    );
}

/* ── Hero ──────────────────────────────────────────────────────── */

function Hero() {
    const spotlight = useSpotlight<HTMLDivElement>();
    const { parent, child } = useParallax<HTMLDivElement, HTMLDivElement>(14);
    const cta = useMagnetic<HTMLAnchorElement>(0.07);

    return (
        <section
            ref={spotlight}
            className="relative overflow-hidden"
            style={{
                ["--mx" as string]: "50%",
                ["--my" as string]: "50%",
            }}
        >
            <AsciiTacticalLayer />

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(640px 380px at var(--mx) var(--my), rgba(124,58,237,0.22), transparent 70%)",
                    transition: "background 0.18s ease-out",
                }}
            />

            <div
                ref={parent}
                className="relative mx-auto max-w-[1240px] px-6 pt-16 pb-0"
            >
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    className="text-center"
                >
                    <h1
                        className="mx-auto font-onest"
                        style={{
                            fontSize: "clamp(50px, 9vw, 132px)",
                            lineHeight: 0.96,
                            fontWeight: 700,
                            letterSpacing: 0,
                            maxWidth: "16ch",
                        }}
                    >
                        Free, focused
                        <br />
                        <span style={{ color: "#c4b5fd" }}>Valorant</span> strategy.
                    </h1>

                    <p
                        className="mx-auto mt-7 max-w-xl text-[16.5px] leading-[1.6]"
                        style={{ color: "#a1a1aa" }}
                    >
                        Open source, local-first, and built with restraint.
                        Every feature earns its place so planning stays clean,
                        fast, and free.
                    </p>

                    <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            ref={cta}
                            href="#download"
                            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] transition-[box-shadow] duration-300"
                            style={{
                                background: "#fafafa",
                                color: "#0a0a0a",
                                willChange: "transform",
                                boxShadow: "0 0 0 0 rgba(124,58,237,0)",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.boxShadow =
                                    "0 18px 50px -10px rgba(124,58,237,0.55)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.boxShadow =
                                    "0 0 0 0 rgba(124,58,237,0)")
                            }
                        >
                            Download for Windows
                            <FaArrowRight
                                aria-hidden
                                size={11}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </a>
                        <a
                            href={SOCIAL_LINKS.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[14px] transition-colors hover:bg-white/[0.04]"
                            style={{ borderColor: "rgba(255,255,255,0.10)", color: "#fafafa" }}
                        >
                            <FaGithub aria-hidden /> Star on GitHub
                        </a>
                    </div>

                    <p
                        className="mt-5 text-[12px] flex items-center justify-center gap-2"
                        style={{ color: "#71717a" }}
                    >
                        <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}55` }}
                        />
                        Free · MIT · No accounts · v3.2.3 (beta)
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.12 }}
                    className="relative mt-12 sm:mt-14"
                >
                    <div
                        ref={child}
                        className="relative mx-auto max-w-[1100px] will-change-transform"
                        style={{ transition: "transform 0.4s cubic-bezier(.2,.7,.2,1)" }}
                    >
                        <div
                            className="overflow-hidden rounded-2xl"
                            style={{
                                border: "1px solid rgba(255,255,255,0.08)",
                                boxShadow:
                                    "0 60px 120px -40px rgba(0,0,0,0.85), 0 0 0 1px rgba(124,58,237,0.18)",
                            }}
                        >
                            <Image
                                src="/board-preview.png"
                                alt="Icarus strategy board"
                                width={2048}
                                height={1280}
                                priority
                                className="block w-full h-auto"
                            />
                        </div>
                        {/* Bottom edge fade to bg */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 -bottom-px h-24"
                            style={{
                                background: "linear-gradient(180deg, transparent, #08080a 90%)",
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ── Principles ────────────────────────────────────────────────── */

function AsciiTacticalLayer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const canvasElement = canvas;
        const context2d = context;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const glyphs = ["A", "B", "C", "X", "O", "+", "-", "/", "\\", "|", ".", ":", "0", "1"];
        const colors = ["rgba(196,181,253,", "rgba(125,211,252,", "rgba(250,250,250,"];
        const cells: Array<{
            x: number;
            y: number;
            char: string;
            phase: number;
            speed: number;
            size: number;
            alpha: number;
        }> = [];

        let raf = 0;
        let width = 0;
        let height = 0;
        let dpr = 1;

        function resize() {
            const rect = canvasElement.getBoundingClientRect();
            width = Math.max(1, rect.width);
            height = Math.max(1, rect.height);
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvasElement.width = Math.floor(width * dpr);
            canvasElement.height = Math.floor(height * dpr);
            context2d.setTransform(dpr, 0, 0, dpr, 0, 0);

            cells.length = 0;
            const count = Math.max(76, Math.floor((width * height) / 12000));
            for (let i = 0; i < count; i += 1) {
                cells.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    char: glyphs[Math.floor(Math.random() * glyphs.length)],
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.18 + Math.random() * 0.38,
                    size: 10 + Math.random() * 4,
                    alpha: 0.16 + Math.random() * 0.26,
                });
            }
        }

        function draw(now: number) {
            const time = now * 0.001;
            context2d.clearRect(0, 0, width, height);
            context2d.textAlign = "center";
            context2d.textBaseline = "middle";

            for (let i = 0; i < cells.length; i += 1) {
                const cell = cells[i];
                const drift = reduceMotion ? 0 : Math.sin(time * cell.speed + cell.phase) * 9;
                const scan = reduceMotion ? 0 : ((time * 10 * cell.speed + cell.phase * 18) % (height + 80)) - 40;
                const pulse = reduceMotion ? 0.55 : 0.45 + Math.sin(time * 1.4 + cell.phase) * 0.2;
                const alpha = Math.max(0.03, cell.alpha * pulse);

                context2d.font = `${cell.size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
                context2d.fillStyle = `${colors[i % colors.length]}${alpha})`;
                context2d.fillText(cell.char, cell.x + drift, (cell.y + scan * 0.05) % height);

                if (i % 9 === 0) {
                    context2d.strokeStyle = `rgba(124,58,237,${alpha * 0.38})`;
                    context2d.lineWidth = 1;
                    context2d.beginPath();
                    context2d.moveTo(cell.x - 18, cell.y);
                    context2d.lineTo(cell.x + 18, cell.y);
                    context2d.moveTo(cell.x, cell.y - 18);
                    context2d.lineTo(cell.x, cell.y + 18);
                    context2d.stroke();
                }
            }

            if (!reduceMotion) {
                raf = requestAnimationFrame(draw);
            }
        }

        resize();
        draw(0);
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
                opacity: 0.9,
                mixBlendMode: "screen",
                maskImage: "linear-gradient(180deg, transparent 0%, black 12%, black 74%, transparent 100%)",
                WebkitMaskImage:
                    "linear-gradient(180deg, transparent 0%, black 12%, black 74%, transparent 100%)",
            }}
        />
    );
}

function Principles() {
    return (
        <section id="principles" className="relative py-24 sm:py-32">
            <div className="mx-auto max-w-[1240px] px-6">
                <div className="mb-12 max-w-2xl">
                    <p
                        className="font-mono uppercase tracking-[0.22em] text-[11px]"
                        style={{ color: ACCENT }}
                    >
                        Principles
                    </p>
                    <h2
                        className="mt-3 font-onest"
                        style={{
                            fontSize: "clamp(32px, 4.2vw, 52px)",
                            lineHeight: 1.06,
                            fontWeight: 600,
                            letterSpacing: "-0.025em",
                        }}
                    >
                        Six rules,
                        <br />
                        <span style={{ color: "#a1a1aa" }}>one product.</span>
                    </h2>
                </div>

                <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {PRINCIPLES.map((p) => (
                        <motion.div
                            key={p.title}
                            whileHover={{ y: -4 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22 }}
                            className="group rounded-xl p-5 -mx-5 transition-colors"
                            style={{ border: "1px solid transparent" }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLDivElement).style.borderColor =
                                    "rgba(255,255,255,0.06)")
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLDivElement).style.borderColor = "transparent")
                            }
                        >
                            <div
                                className="font-mono mb-2 text-[11px] tracking-[0.2em] uppercase"
                                style={{ color: "#71717a" }}
                            >
                                {p.n}
                            </div>
                            <h3
                                className="font-onest text-[20px]"
                                style={{ fontWeight: 600, letterSpacing: "-0.015em" }}
                            >
                                {p.title}
                            </h3>
                            <p
                                className="mt-2 text-[14.5px] leading-[1.65]"
                                style={{ color: "#a1a1aa" }}
                            >
                                {p.body}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Download ──────────────────────────────────────────────────── */

function Download({ latestVersion }: { latestVersion: VersionInfo }) {
    const win = latestVersion.platforms.windows;
    return (
        <section id="download" className="relative py-24 sm:py-32">
            <div
                className="mx-auto max-w-3xl px-8 py-14 text-center rounded-2xl"
                style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                        "radial-gradient(700px 240px at 50% 0%, rgba(124,58,237,0.14), transparent 70%)",
                }}
            >
                <h2
                    className="font-onest"
                    style={{
                        fontSize: "clamp(32px, 4.4vw, 52px)",
                        lineHeight: 1.05,
                        fontWeight: 600,
                        letterSpacing: "-0.025em",
                    }}
                >
                    Get Icarus.
                </h2>
                <p
                    className="mx-auto mt-3 max-w-md text-[15px] leading-[1.6]"
                    style={{ color: "#a1a1aa" }}
                >
                    Free, {win.size}, self-updating. v{latestVersion.version} — {latestVersion.released}.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <motion.a
                        href={win.url}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px]"
                        style={{ background: "#fafafa", color: "#0a0a0a" }}
                    >
                        Download for Windows <FaArrowRight aria-hidden size={11} />
                    </motion.a>
                    {win.secondaryUrl ? (
                        <a
                            href={win.secondaryUrl}
                            className="text-[14px]"
                            style={{ color: "#a1a1aa" }}
                        >
                            via Microsoft Store
                        </a>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

/* ── Footer ────────────────────────────────────────────────────── */

function Footer() {
    return (
        <footer className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div
                className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row text-[13px]"
                style={{ color: "#71717a" }}
            >
                <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        width={18}
                        height={18}
                        className="rounded"
                        src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN"
                        alt=""
                    />
                    <span>{META.name} · {META.short}</span>
                </div>
                <div className="flex items-center gap-6">
                    <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
                    <a href={SOCIAL_LINKS.discord} target="_blank" rel="noreferrer" className="hover:text-white">Discord</a>
                    <a href="/tos" className="hover:text-white">Terms</a>
                </div>
            </div>
        </footer>
    );
}
