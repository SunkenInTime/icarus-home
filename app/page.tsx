"use client";

import Head from "next/head";
import { useMemo } from "react";

import { motion, useReducedMotion } from "framer-motion";

import Hero from "@/app/components/Hero/Hero";
import Features from "@/app/components/Features/Features";
import Compare from "@/app/components/Compare/Compare";
import Roadmap from "@/app/components/Roadmap/Roadmap";
import Download from "@/app/components/Download/Download";
import Donations from "@/app/components/Donations/Donations";
import Community from "@/app/components/Community/Community";

import { BG, DOT, VIGNETTE, BORDER_SOFT } from "@/app/constants";

import { AnimationVariants } from "@/app/types/AnimationVariants";

export default function Home() {
    const prefersReducedMotion = useReducedMotion();

    const variants = useMemo<AnimationVariants>(
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

            <main className="relative z-10">
                {/* Hero */}
                <Hero variants={variants} />

                {/* Features */}
                <Features prefersReducedMotion />

                {/* Compare */}
                <Compare />

                {/* Roadmap / Beta */}
                <Roadmap variants={variants} />

                {/* Download */}
                <Download />

                {/* Donations */}
                <Donations prefersReducedMotion />

                {/* Community */}
                <Community prefersReducedMotion />
            </main>
        </div>
    );
}

// Keeping this because I couldn't figure out what its for and it isn't used anywhere.

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
