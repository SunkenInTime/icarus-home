"use client";

import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import AppWindowChrome from "@/app/components/ui/AppWindowChrome";
import GlassDeviceFrame from "@/app/components/ui/GlassDeviceFrame";
import Parallax from "@/app/components/ui/Parallax";

import { TEXT_SOFT, BORDER_SOFT, ACCENT, ACCENT_HOVER, RING, PREVIEW_IMG } from "@/app/constants";

import { AnimationVariants } from "@/app/types/AnimationVariants";

const Hero = ({ variants }: { variants: AnimationVariants }) => {
    return (
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

                            <Parallax depth={10}>
                                <div className="relative pt-9" style={{ height: 375 }}>
                                    {/* window chrome */}

                                    {/* main shot */}
                                    <img src={PREVIEW_IMG} alt="Icarus interface preview" className="block w-full" style={{ height: "calc(375px )", objectFit: "cover" }} />
                                    {/* tool dock (right) */}
                                    {/* <ToolDock /> */}
                                </div>
                            </Parallax>

                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
