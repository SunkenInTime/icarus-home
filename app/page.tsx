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
