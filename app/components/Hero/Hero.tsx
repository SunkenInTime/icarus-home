"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaArrowRight, FaGithub } from "react-icons/fa";

import { ACCENT, ACCENT_HOVER } from "@/app/constants";
import { CornerBrackets, CrosshairTick, TacticalBadge } from "@/app/components/ui/Tactical";
import { AnimationVariants } from "@/app/types/AnimationVariants";

const Hero = ({ variants }: { variants: AnimationVariants }) => {
    return (
        <section id="hero" className="relative pt-14 pb-24 sm:pt-20 sm:pb-32">
            {/* Layered atmospheres: violet vignette + tactical grid + horizontal hairlines */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 tactical-grid opacity-[0.55]"
                style={{ maskImage: "radial-gradient(900px 500px at 50% 30%, black, transparent 80%)" }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
                style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)" }}
            />

            <div className="relative mx-auto max-w-6xl px-6">
                {/* Top status row — mimics the app's titlebar callsigns */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.45 }}
                    className="mb-10 flex flex-wrap items-center justify-between gap-3 callsign"
                >
                    <div className="flex items-center gap-3">
                        <span style={{ color: ACCENT }}>{"// SYS:ICARUS"}</span>
                        <span style={{ color: "#52525b" }}>·</span>
                        <span>Local-first</span>
                        <span style={{ color: "#52525b" }}>·</span>
                        <span>v.beta</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        <span>Status</span>
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                className="inline-block h-1.5 w-1.5 rounded-full"
                                style={{ background: "#34d399", boxShadow: "0 0 8px #34d39955" }}
                            />
                            <span style={{ color: "#e4e4e7" }}>OPERATIONAL</span>
                        </span>
                    </div>
                </motion.div>

                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1.4fr]">
                    {/* Copy */}
                    <motion.div initial="initial" animate="animate" variants={variants.fadeUp} className="space-y-7">
                        <TacticalBadge>Beta · Built in the open</TacticalBadge>

                        <h1 className="font-display text-[44px] sm:text-6xl lg:text-[68px] font-semibold leading-[0.98] tracking-[-0.03em]">
                            Zero gap{" "}
                            <span className="relative inline-block">
                                <span
                                    aria-hidden
                                    className="absolute -bottom-1 left-0 right-0 h-[6px]"
                                    style={{
                                        background: `linear-gradient(90deg, ${ACCENT}, transparent)`,
                                        filter: "blur(2px)",
                                    }}
                                />
                                <span style={{ color: ACCENT }}>between idea</span>
                            </span>
                            <br />
                            and the&nbsp;board.
                        </h1>

                        <p className="max-w-xl text-[17px] leading-relaxed" style={{ color: "#d4d4d8" }}>
                            Icarus is a Valorant strategy planner designed for one job — getting what&rsquo;s
                            in your head onto the map as fast as your hands move. Local-first. Free.
                            Open source. Customizable to your team&rsquo;s workflow.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                            <motion.a
                                href="#download"
                                className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium"
                                style={{ backgroundColor: ACCENT, color: "#fff" }}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                            >
                                <span>Download for Windows</span>
                                <FaArrowRight aria-hidden />
                            </motion.a>
                            <motion.a
                                href="https://github.com/SunkenInTime/icarus"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium"
                                style={{
                                    border: "1px solid #27272a",
                                    background: "rgba(255,255,255,0.02)",
                                    color: "#fafafa",
                                }}
                                whileHover={{ y: -1, borderColor: "#3f3f46" }}
                                whileTap={{ y: 0, scale: 0.98 }}
                            >
                                <FaGithub aria-hidden />
                                <span>Star on GitHub</span>
                            </motion.a>
                        </div>

                        {/* Quick spec strip */}
                        <div className="grid grid-cols-3 gap-x-6 gap-y-2 pt-4 border-t" style={{ borderColor: "#27272a" }}>
                            {[
                                ["100%", "Local"],
                                ["$0", "Forever"],
                                ["MIT", "Open source"],
                            ].map(([n, l]) => (
                                <div key={l} className="pt-4">
                                    <div className="font-display text-2xl font-medium" style={{ color: "#fafafa" }}>
                                        {n}
                                    </div>
                                    <div className="callsign">{l}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Product preview — actual app screenshot in a tactical chrome */}
                    <motion.div initial="initial" animate="animate" variants={variants.pop} className="relative">
                        {/* Glow halo behind the frame */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10"
                            style={{
                                background:
                                    "radial-gradient(60% 50% at 50% 50%, rgba(124,58,237,0.25), transparent 70%)",
                            }}
                        />

                        {/* Floating offset annotations like the app's tooltips */}
                        <div className="hidden md:block absolute -top-6 -left-3 z-20">
                            <span className="callsign rounded px-2 py-1" style={{ background: "#0d0d10", border: "1px solid #27272a" }}>
                                ASCENT — B PUSH
                            </span>
                        </div>
                        <div className="hidden md:block absolute -bottom-4 right-4 z-20">
                            <span className="callsign rounded px-2 py-1" style={{ background: "#0d0d10", border: "1px solid #27272a", color: ACCENT }}>
                                SAVED · LOCAL
                            </span>
                        </div>

                        {/* App chrome */}
                        <div
                            className="relative overflow-hidden"
                            style={{
                                borderRadius: 14,
                                border: "1px solid #27272a",
                                background: "#0d0d10",
                                boxShadow:
                                    "0 30px 80px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
                            }}
                        >
                            {/* Title bar */}
                            <div
                                className="flex items-center justify-between px-3 py-2"
                                style={{ background: "#111114", borderBottom: "1px solid #1d1d20" }}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#3f3f46" }} />
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#3f3f46" }} />
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#3f3f46" }} />
                                </div>
                                <span className="callsign" style={{ fontSize: 10 }}>
                                    icarus.exe
                                </span>
                                <span className="callsign" style={{ fontSize: 10, color: ACCENT }}>
                                    REC
                                </span>
                            </div>

                            <div className="relative">
                                <Image
                                    src="/board-preview.png"
                                    alt="Icarus strategy board"
                                    width={2048}
                                    height={1280}
                                    priority
                                    className="block w-full h-auto"
                                />
                                <CornerBrackets size={16} color="rgba(124,58,237,0.6)" inset={10} thickness={1.2} />
                                <CrosshairTick className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={14} color="rgba(255,255,255,0.45)" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
