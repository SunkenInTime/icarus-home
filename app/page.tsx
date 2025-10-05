"use client";

import Head from "next/head";
import Link from "next/link";
import { FaGithub, FaDiscord, FaTwitter, FaDownload, FaArrowRight, FaHeart, FaCoffee, FaDonate } from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

type Platform = "windows" | "mac" | "linux";

/* Minimal palette */
const BG = "#0E0E10"; // deeper, cleaner dark
const DOT = "rgba(255,255,255,0.05)"; // subtle dot
const VIGNETTE = "radial-gradient(1000px 500px at 50% -10%, rgba(255,255,255,0.03), transparent)";
const ACCENT = "#7B61FF"; // calm ultraviolet
const ACCENT_HOVER = "#6B54E3";
const RING = "rgba(123, 97, 255, 0.45)";
const GLASS_BG = "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))";
const BORDER_SOFT = "rgba(255,255,255,0.10)";
const TEXT_SOFT = "#CFCFD4";

const PREVIEW_IMG = "https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UCnar5XbcjR2aezOZ4lNvPKq05MfxnY3hisyg1";

export default function Home() {
    const [activeTab, setActiveTab] = useState<Platform>("windows");
    const prefersReducedMotion = useReducedMotion();

    const latestVersion = {
        version: "1.5.0 Beta",
        released: "July 28, 2025",
        platforms: {
            windows: {
                url: "https://apps.microsoft.com/detail/9PBWHHZRQFW6?hl=en-us&gl=US&ocid=pdpshare",
                size: "31 MB",
            },
            mac: { url: "https://example.com/mac", size: "123 MB" },
            linux: { url: "https://example.com/linux", size: "123 MB" },
        },
    };

    const variants = useMemo(
        () => ({
            fadeUp: {
                initial: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            },
            fadeIn: {
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { duration: 0.4 } },
            },
            pop: {
                initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.985 },
                animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
            },
        }),
        [prefersReducedMotion]
    );

    return (
        <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: BG }}>
            {/* Background: darker, cleaner */}
            <div
                aria-hidden
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(${DOT} 1px, transparent 1px), ${VIGNETTE}`,
                    backgroundSize: "16px 16px, cover",
                    backgroundPosition: "center, center",
                }}
            />
            <Head>
                <title>Icarus – Valorant Strategy Planner</title>
                <meta name="description" content="Icarus is a local-first Valorant strategy planner. Minimal, fast, and private by default." />
                <link rel="icon" href="./favicon.svg" />
            </Head>

            {/* Header (subtle glass) */}
            <header className="relative z-10">
                <div className="border-b backdrop-blur-md" style={{ background: GLASS_BG, borderColor: BORDER_SOFT }}>
                    <div className="mx-auto max-w-6xl px-6">
                        <nav className="flex h-16 items-center justify-between" aria-label="Main">
                            <Link href="#hero" className="flex items-center gap-3">
                                <img width={28} height={28} className="rounded-md" src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN" alt="Icarus logo" />
                                <span className="text-base font-semibold tracking-tight">Icarus</span>
                            </Link>

                            <div className="hidden md:flex items-center gap-6 text-sm">
                                {[
                                    ["Features", "#features"],
                                    ["Compare", "#compare"],
                                    ["Roadmap", "#beta"],
                                    ["Donate", "#donate"],
                                    ["Community", "#community"],
                                ].map(([label, href]) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        className="text-gray-300 rounded px-1 focus-visible:outline-none focus-visible:ring-2"
                                        style={{
                                            borderColor: RING,
                                        }}
                                        whileHover={{ y: -2, color: "#fff", textShadow: "0 0 18px rgba(123,97,255,0.45)" }}
                                        whileTap={{ y: 0 }}
                                    >
                                        {label}
                                    </motion.a>
                                ))}
                            </div>

                            <motion.a
                                href="#download"
                                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                style={{
                                    backgroundColor: ACCENT,
                                    color: "#fff",
                                    borderColor: RING,

                                    WebkitTapHighlightColor: "transparent",
                                }}
                                whileHover={{ scale: 1.03, y: -1 }}
                                whileTap={{ scale: 0.97, y: 0 }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                            >
                                <FaDownload aria-hidden />
                                <span>Download</span>
                            </motion.a>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero */}
                <section id="hero" className="py-16 sm:py-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid items-center gap-10 md:grid-cols-2">
                            <motion.div initial="initial" animate="animate" variants={variants.fadeUp} className="space-y-5">
                                <span
                                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                                    style={{
                                        color: TEXT_SOFT,
                                        border: `1px solid ${BORDER_SOFT}`,
                                        background: "rgba(255,255,255,0.03)",
                                        backdropFilter: "blur(6px)",
                                    }}
                                >
                                    Beta
                                </span>

                                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                                    Plan smarter. Play sharper.
                                    <br />
                                    <span className="text-white/90">Icarus</span> for Valorant.
                                </h1>

                                <p className="max-w-xl text-gray-300">Local-first strategy planner with a minimal, fast workflow. Private by default. Built with the community.</p>

                                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                    <motion.a
                                        href="#download"
                                        className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                        style={{
                                            backgroundColor: ACCENT,
                                            color: "#fff",
                                            WebkitTapHighlightColor: "transparent",
                                        }}
                                        whileHover={{ scale: 1.03, y: -1 }}
                                        whileTap={{ scale: 0.97, y: 0 }}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                                    >
                                        <FaArrowRight aria-hidden />
                                        Download beta
                                    </motion.a>
                                    <motion.a
                                        href="#features"
                                        className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white/90 focus-visible:outline-none focus-visible:ring-2"
                                        style={{
                                            border: `1px solid ${BORDER_SOFT}`,
                                            background: "rgba(255,255,255,0.02)",
                                            backdropFilter: "blur(6px)",
                                            borderColor: RING,
                                        }}
                                        whileHover={{ y: -1, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
                                        whileTap={{ y: 0, scale: 0.98 }}
                                    >
                                        Learn more
                                    </motion.a>
                                </div>
                            </motion.div>

                            {/* App-like preview with tool dock and subtle glow */}
                            <motion.div initial="initial" animate="animate" variants={variants.pop}>
                                <div className="relative">
                                    {/* glow */}
                                    <div
                                        aria-hidden
                                        className="absolute -inset-6 rounded-[22px] blur-2xl"
                                        style={{
                                            background: "radial-gradient(60% 60% at 70% 30%, rgba(123,97,255,0.35), rgba(123,97,255,0.06) 60%, transparent 70%)",
                                        }}
                                    />
                                    <GlassDeviceFrame>
                                        <Parallax depth={10}>
                                            <div className="relative pt-9" style={{ height: 375 }}>
                                                {/* window chrome */}
                                                <AppWindowChrome />
                                                {/* main shot */}
                                                <img src={PREVIEW_IMG} alt="Icarus interface preview" className="block w-full" style={{ height: "calc(375px - 20px)", objectFit: "cover" }} />
                                                {/* tool dock (right) */}
                                                {/* <ToolDock /> */}
                                            </div>
                                        </Parallax>
                                    </GlassDeviceFrame>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <SectionShell id="features" title="Why choose Icarus?">
                    <p className="mt-3 text-gray-400 text-center">Focused on speed, privacy, and a clean workflow.</p>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
                        {features.map((f, i) => (
                            <motion.article
                                key={f.title}
                                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.35, delay: i * 0.04 }}
                                whileHover={{ y: -3, borderColor: ACCENT, boxShadow: "0 12px 30px rgba(123,97,255,0.12)" }}
                                className="rounded-lg p-5"
                                style={{
                                    border: `1px solid ${BORDER_SOFT}`,
                                    background: "rgba(255,255,255,0.02)",
                                    backdropFilter: "blur(6px)",
                                }}
                            >
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-semibold">{f.title}</h3>
                                <p className="mt-2 text-gray-400 text-sm">{f.description}</p>
                            </motion.article>
                        ))}
                    </div>
                </SectionShell>

                {/* Compare */}
                <SectionShell id="compare" title="Switch with confidence">
                    <p className="mt-3 text-gray-400 text-center">A quick look at how Icarus stacks up.</p>

                    <div
                        className="overflow-x-auto rounded-lg mt-10"
                        style={{
                            border: `1px solid ${BORDER_SOFT}`,
                            background: "rgba(255,255,255,0.02)",
                            backdropFilter: "blur(6px)",
                        }}
                    >
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="py-3 px-4">Feature</th>
                                    <th className="py-3 px-4 text-center">Icarus</th>
                                    <th className="py-3 px-4 text-center">Competitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonItems.map((item, idx) => (
                                    <motion.tr key={`${item.feature}-${idx}`} className="border-t hover:bg-white/5" style={{ borderColor: BORDER_SOFT, backgroundColor: "transparent" }} whileHover={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                                        <td className="py-3 px-4 text-gray-300">{item.feature}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={item.icarus ? "text-green-400" : "text-red-400"} aria-label={item.icarus ? "Yes" : "No"}>
                                                {item.icarus ? "✓" : "✗"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={item.competitors ? "text-green-400" : "text-red-400"} aria-label={item.competitors ? "Yes" : "No"}>
                                                {item.competitors ? "✓" : "✗"}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionShell>

                {/* Roadmap / Beta */}
                <section id="beta" className="py-16 sm:py-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid gap-10 md:grid-cols-2 items-center">
                            <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }} variants={variants.fadeIn}>
                                <GlassDeviceFrame rounded="lg">
                                    <img src={PREVIEW_IMG} alt="Icarus board" className="block w-full" style={{ maxHeight: 400, objectFit: "cover" }} />
                                </GlassDeviceFrame>
                            </motion.div>

                            <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }} variants={variants.fadeUp} className="space-y-4">
                                <span
                                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                                    style={{
                                        color: TEXT_SOFT,
                                        border: `1px solid ${BORDER_SOFT}`,
                                        background: "rgba(255,255,255,0.03)",
                                        backdropFilter: "blur(6px)",
                                    }}
                                >
                                    Roadmap
                                </span>
                                <h3 className="text-2xl font-semibold">Currently in Beta</h3>
                                <p className="text-gray-300">Iterating toward 1.0 with focused, useful releases. Join the community for early builds and feedback.</p>

                                <ul className="mt-2 space-y-2">
                                    {comingSoonFeatures.map((f) => (
                                        <li key={f} className="flex items-start gap-3">
                                            <span className="mt-0.5 text-white/70">•</span>
                                            <span className="text-gray-300">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Download */}
                <SectionShell id="download" title="Get started today">
                    <p className="mt-3 text-gray-400 text-center">Download the beta and start planning smarter.</p>

                    <div
                        className="overflow-hidden rounded-lg mt-10"
                        style={{
                            border: `1px solid ${BORDER_SOFT}`,
                            background: "rgba(255,255,255,0.02)",
                            backdropFilter: "blur(6px)",
                        }}
                    >
                        <div className="flex overflow-x-auto">
                            {(["windows", "mac", "linux"] as Platform[]).map((p) => {
                                const disabled = p === "mac" || p === "linux";
                                const isActive = activeTab === p;
                                return (
                                    <motion.button
                                        key={p}
                                        onClick={() => !disabled && setActiveTab(p)}
                                        className="flex-1 px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                                        style={{
                                            color: isActive ? "#fff" : "#BDBDBD",
                                            backgroundColor: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                                            opacity: disabled ? 0.6 : 1,
                                            cursor: disabled ? "not-allowed" : "pointer",
                                            borderColor: RING,
                                        }}
                                        whileHover={!disabled ? { y: -1 } : undefined}
                                        whileTap={!disabled ? { y: 0, scale: 0.98 } : undefined}
                                        aria-pressed={isActive}
                                        aria-disabled={disabled}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                        {disabled ? " (Coming soon)" : ""}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="p-6 sm:p-8">
                            <div className="grid gap-8 md:grid-cols-2 items-center">
                                <div>
                                    <h3 className="text-xl font-semibold">Download for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                                    <p className="mt-2 text-gray-400">
                                        {latestVersion.version} • Released {latestVersion.released}
                                    </p>

                                    <div className="mt-6 space-y-3">
                                        <motion.a
                                            href={latestVersion.platforms[activeTab].url}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                            style={{
                                                backgroundColor: ACCENT,
                                                color: "#fff",
                                                WebkitTapHighlightColor: "transparent",
                                            }}
                                            whileHover={{ scale: 1.02, y: -1 }}
                                            whileTap={{ scale: 0.97, y: 0 }}
                                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                                        >
                                            <FaDownload aria-hidden />
                                            Download now
                                        </motion.a>
                                        <p className="text-center text-xs text-gray-500">File size: {latestVersion.platforms[activeTab].size} • By downloading, you agree to our Terms of Service.</p>
                                    </div>
                                </div>

                                <div>
                                    <GlassDeviceFrame rounded="lg">
                                        <img src={PREVIEW_IMG} alt="Icarus app preview" className="block w-full" style={{ maxHeight: 320, objectFit: "cover" }} />
                                    </GlassDeviceFrame>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionShell>

                {/* Donations (simplified) */}
                <SectionShell id="donate" title="Support the project">
                    <p className="mt-3 text-gray-400 text-center max-w-2xl mx-auto">Icarus is open source. Your support helps fund maintenance and new features.</p>

                    <div className="grid gap-6 md:grid-cols-3 mt-10">
                        {donationOptions.map((opt, i) => (
                            <motion.a
                                key={opt.title}
                                href={opt.url}
                                target="_blank"
                                rel="noreferrer"
                                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.3, delay: i * 0.04 }}
                                className="rounded-lg p-5"
                                style={{
                                    border: `1px solid ${BORDER_SOFT}`,
                                    background: "rgba(255,255,255,0.02)",
                                    backdropFilter: "blur(6px)",
                                }}
                            >
                                <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                                    {opt.icon}
                                </div>
                                <h3 className="text-base font-semibold text-center">{opt.title}</h3>
                                <p className="mt-2 text-sm text-gray-400 text-center">{opt.description}</p>
                            </motion.a>
                        ))}
                    </div>
                </SectionShell>

                {/* Community */}
                <section id="community" className="py-16 sm:py-24">
                    <div className="mx-auto max-w-6xl px-6 text-center">
                        <h2 className="text-2xl sm:text-3xl font-semibold">Join the community</h2>
                        <p className="mt-3 mb-10 text-gray-400">Share strategies, request features, and help shape Icarus.</p>

                        <div className="flex flex-wrap justify-center gap-6">
                            {communityLinks.map((link, i) => (
                                <motion.a
                                    key={link.title}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.3, delay: i * 0.04 }}
                                    whileHover={{ y: -3, borderColor: ACCENT, boxShadow: "0 12px 30px rgba(123,97,255,0.12)" }}
                                    className="w-64 rounded-lg p-5 text-left"
                                    style={{
                                        border: `1px solid ${BORDER_SOFT}`,
                                        background: "rgba(255,255,255,0.02)",
                                        backdropFilter: "blur(6px)",
                                    }}
                                >
                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                                        {link.icon}
                                    </div>
                                    <h3 className="text-base font-semibold text-center">{link.title}</h3>
                                    <p className="mt-2 text-sm text-gray-400 text-center">{link.description}</p>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer
                className="relative z-10 backdrop-blur"
                style={{
                    borderTop: `1px solid ${BORDER_SOFT}`,
                    background: "rgba(255,255,255,0.03)",
                }}
            >
                <div className="mx-auto max-w-6xl px-6 py-10">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-2">
                            <img width={24} height={24} src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN" alt="Icarus logo small" />
                            <span className="text-base font-semibold">Icarus</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.a
                                href="https://github.com/SunkenInTime/icarus"
                                className="flex h-9 w-9 items-center justify-center rounded-full hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
                                aria-label="GitHub"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    borderColor: RING,
                                }}
                                whileHover={{
                                    scale: 1.12,
                                    rotate: 3,
                                    boxShadow: `0 0 0 2px ${RING}, 0 10px 24px rgba(123,97,255,0.18)`,
                                }}
                                whileTap={{ scale: 0.94, rotate: 0 }}
                            >
                                <FaGithub />
                            </motion.a>
                            <motion.a
                                href="https://discord.gg/PN2uKwCqYB"
                                className="flex h-9 w-9 items-center justify-center rounded-full hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
                                aria-label="Discord"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    borderColor: RING,
                                }}
                                whileHover={{ scale: 1.08, rotate: -2, boxShadow: `0 0 0 2px ${RING}` }}
                                whileTap={{ scale: 0.95, rotate: 0 }}
                            >
                                <FaDiscord />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
                                aria-label="Twitter"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    borderColor: RING,
                                }}
                                whileHover={{ scale: 1.08, rotate: 2, boxShadow: `0 0 0 2px ${RING}` }}
                                whileTap={{ scale: 0.95, rotate: 0 }}
                            >
                                <FaTwitter />
                            </motion.a>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Icarus. All rights reserved. Created by Dara.</p>
                </div>
            </footer>
        </div>
    );
}

/* Helpers */

function AppWindowChrome() {
    return (
        <div
            className="absolute left-0 right-0 top-0 h-9 flex items-center px-3 select-none"
            style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
                borderBottom: `1px solid ${BORDER_SOFT}`,
                backdropFilter: "blur(6px)",
            }}
        >
            {/* window controls */}
            <div className="flex items-center gap-2">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <span key={c} className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 0 1px rgba(0,0,0,0.25) inset` }} />
                ))}
            </div>
            <div className="mx-auto text-xs text-white/70 tracking-wide">Icarus – Strategy Planner</div>
            <div className="w-16" />
        </div>
    );
}

function ToolDock() {
    const Icon = ({ children }: { children: React.ReactNode }) => (
        <motion.div
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.96, y: 0 }}
            className="flex h-10 w-10 items-center justify-center rounded-md"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER_SOFT}`,
            }}
        >
            {children}
        </motion.div>
    );

    return (
        <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
            <div
                className="flex flex-col items-center gap-2 p-2 rounded-xl"
                style={{
                    background: "rgba(0,0,0,0.25)",
                    border: `1px solid ${BORDER_SOFT}`,
                    backdropFilter: "blur(8px)",
                }}
            >
                <Icon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#E4E4E7" strokeWidth="2">
                        <path d="M7 13c3-2 2-8 7-8 2 0 3 2 3 4 0 5-5 7-5 10 0 1-1 2-2 2s-2-1-2-2c0-2 1-4-1-6z" />
                    </svg>
                </Icon>
                <Icon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#E4E4E7" strokeWidth="2">
                        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </Icon>
                <Icon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#E4E4E7" strokeWidth="2">
                        <path d="M3 17h18M6 13h12M9 9h6M11 5h2" />
                    </svg>
                </Icon>
                <Icon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#E4E4E7" strokeWidth="2">
                        <path d="M6 20l6-16 6 16" />
                    </svg>
                </Icon>
            </div>
        </div>
    );
}

function SectionShell({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-semibold">{title}</h2>
                </div>
                {children}
            </div>
        </section>
    );
}

function Parallax({ children, depth = 8 }: { children: React.ReactNode; depth?: number }) {
    return (
        <div
            className="transition-transform will-change-transform"
            style={{
                transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)",
            }}
            onMouseMove={(e) => {
                const t = e.currentTarget as HTMLDivElement;
                const r = t.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                t.style.transform = `perspective(900px) rotateX(${-y * depth}deg) rotateY(${x * depth}deg) translateZ(0)`;
            }}
            onMouseLeave={(e) => {
                const t = e.currentTarget as HTMLDivElement;
                t.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
            }}
        >
            {children}
        </div>
    );
}

function GlassDeviceFrame({ children, rounded = "xl" }: { children: React.ReactNode; rounded?: "lg" | "xl" }) {
    const radius = rounded === "lg" ? "0.75rem" : "1rem";
    return (
        <div
            className="relative overflow-hidden"
            style={{
                borderRadius: radius,
                border: `1px solid ${BORDER_SOFT}`,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
        >
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }} />
            {children}
        </div>
    );
}

/* Data */

const features = [
    {
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="#E4E4E7" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        ),
        title: "Local-first",
        description: "Your strategies stay on your device. No lock-in.",
    },
    {
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="#E4E4E7" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        title: "Minimal UX",
        description: "Clean, distraction-free interface for faster planning.",
    },
    {
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="#E4E4E7" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
        title: "Open source",
        description: "Built by and for the community.",
    },
];

const comparisonItems: {
    feature: string;
    icarus: boolean;
    competitors?: boolean;
}[] = [
    { feature: "Local storage", icarus: true, competitors: false },
    { feature: "No subscription", icarus: true, competitors: false },
    { feature: "Offline access", icarus: true, competitors: false },
    { feature: "Live collaboration", icarus: false, competitors: true },
    { feature: "Open source", icarus: true, competitors: false },
    { feature: "Custom line-ups", icarus: true, competitors: true },
    { feature: "Strategy sharing", icarus: true, competitors: false },
];

const communityLinks = [
    {
        icon: <FaGithub className="text-lg" color="#E4E4E7" aria-hidden />,
        title: "GitHub",
        description: "Contribute to the project, report issues, or suggest features.",
        url: "https://github.com/SunkenInTime/icarus",
    },
    {
        icon: <FaDiscord className="text-lg" color="#E4E4E7" aria-hidden />,
        title: "Discord",
        description: "Discuss strategies and get help from the community.",
        url: "https://discord.gg/PN2uKwCqYB",
    },
];

const donationOptions = [
    {
        icon: <FaDonate className="text-base" color="#E4E4E7" aria-hidden />,
        title: "GitHub Sponsors",
        description: "Recurring support with perks and transparency.",
        url: "https://github.com/sponsors/SunkenInTime",
    },
    {
        icon: <FaCoffee className="text-base" color="#E4E4E7" aria-hidden />,
        title: "Ko-fi",
        description: "One-time tips to fuel development.",
        url: "https://ko-fi.com/",
    },
    {
        icon: <FaHeart className="text-base" color="#E4E4E7" aria-hidden />,
        title: "OpenCollective",
        description: "Transparent community funding.",
        url: "https://opencollective.com/",
    },
];
const comingSoonFeatures = ["Optional online sync", "Advanced collaboration tools", "Agent-specific utilities", "Custom map annotations", "Multi-page support"];
