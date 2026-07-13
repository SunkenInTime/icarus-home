"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

import DitherLight from "../_shared/DitherLight";
import { palette } from "../_shared/tokens";
import { ChipFace, EXTRAS, ExtrasInventory, type Extra } from "./extras";
import IcarusMark from "./IcarusMark";

/**
 * The extras, found by torchlight. The section pins while the feature cards
 * emerge from a pool of dithered violet light at the center and spread
 * outward to a scattered constellation — each on its own bearing, staggered,
 * lit as it passes through the pool. Near the end the torch itself dims out,
 * leaving the lit cards floating in the dark, so the sun section below gets
 * to be the next light that grows.
 */

const CARD_W = 264;
const CARD_H = 168;

/** Final resting offsets as fractions of the available half-extent. */
const SPREAD: [number, number][] = [
    [-0.85, -0.72],
    [0.82, -0.78],
    [-0.52, 0.78],
    [0.72, 0.66],
    [-0.98, 0.1],
    [0.98, -0.08],
    [-0.16, -0.98],
    [0.22, 0.94],
];

/** Small per-card resting rotation, hand-placed feel. */
const TILT = [-3.5, 2.5, 3, -2, 1.5, -3, 2, -1.5];

function outCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

function CardFace({ extra }: { extra: Extra }) {
    const Icon = extra.icon;
    return (
        <>
            <Icon size={16} color={palette.lavender} aria-hidden />
            <p className="callsign mt-4" style={{ color: palette.fg }}>
                {extra.tag}
            </p>
            <p className="mt-2 text-[13.5px] leading-[1.6]" style={{ color: palette.muted }}>
                {extra.detail}
            </p>
        </>
    );
}

function FeatureCard({
    extra,
    x,
    y,
    scale,
    rotate,
    lit,
}: {
    extra: Extra;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    lit: number;
}) {
    return (
        <div
            className="absolute left-1/2 top-1/2 rounded-xl border p-6"
            style={{
                width: CARD_W,
                background: palette.card,
                borderColor: lit > 0.75 ? "rgba(196,181,253,0.35)" : palette.border,
                opacity: lit,
                transform: `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
                transition: "border-color 200ms ease",
            }}
        >
            <CardFace extra={extra} />
        </div>
    );
}

export default function TorchlitExtras() {
    const sectionRef = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();

    const [p, setP] = useState(0);
    const [viewport, setViewport] = useState({ w: 1280, h: 800 });

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        setP(Math.round(v * 250) / 250);
    });

    useEffect(() => {
        const measure = () =>
            setViewport({ w: window.innerWidth, h: window.innerHeight });
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    if (reduceMotion) {
        return (
            <section id="extras" className="relative py-24 sm:py-32">
                <div className="mx-auto max-w-[1000px] px-6">
                    <p className="callsign text-center" style={{ color: palette.dim }}>
                        and the rest
                    </p>
                    <div className="mt-10 flex justify-center" aria-hidden>
                        <IcarusMark size={104} />
                    </div>
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {EXTRAS.map((extra) => (
                            <ChipFace key={extra.tag} extra={extra} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Available spread extents, keeping every card fully on screen.
    const halfX = Math.max(120, viewport.w / 2 - CARD_W / 2 - 32);
    const halfY = Math.max(90, viewport.h / 2 - CARD_H / 2 - 88);

    // The torch: grows while the cards emerge, then dims out so the sun
    // below is the next light that rises.
    const torch = p < 0.7 ? (p / 0.7) * 0.62 : Math.max(0.1, 0.62 - ((p - 0.7) / 0.3) * 0.52);

    return (
        <section id="extras" ref={sectionRef} className="relative md:h-[240vh]">
            {/* Flight anchors: the comet falls past the pinned screens. */}
            <span data-flight-anchor aria-hidden className="absolute right-[18%] top-[6%] h-2 w-2" />
            <span data-flight-anchor aria-hidden className="absolute left-[16%] top-[92%] h-2 w-2" />

            <ExtrasInventory />

            {/* Mobile: the constellation doesn't fit, so the torch lights a
                plain stack instead — nothing lost. */}
            <div className="px-6 py-24 md:hidden" aria-hidden>
                <div className="flex flex-col items-center">
                    <Image src="/assets/torch.png" alt="" width={48} height={48} />
                    <p className="callsign mt-6" style={{ color: palette.muted }}>
                        and the rest
                    </p>
                    <div className="mt-10">
                        <IcarusMark
                            size={96}
                            style={{ display: "block", filter: "drop-shadow(0 0 18px rgba(196,181,253,0.28))" }}
                        />
                    </div>
                </div>
                <div className="mx-auto mt-12 flex max-w-[420px] flex-col gap-4">
                    {EXTRAS.map((extra, i) => (
                        <motion.div
                            key={extra.tag}
                            className="rounded-xl border p-6"
                            style={{
                                background: palette.card,
                                borderColor: palette.border,
                                rotate: TILT[i % TILT.length] * 0.4,
                            }}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <CardFace extra={extra} />
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="sticky top-0 hidden h-screen overflow-hidden md:block">
                <div className="absolute inset-0">
                    <DitherLight progress={torch} light={{ x: 0.5, y: 0.52 }} cell={9} />
                </div>

                {/* The torch itself, burning and dimming with its light. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-7 -translate-x-1/2"
                    style={{ opacity: Math.min(1, torch * 1.5) }}
                >
                    <Image src="/assets/torch.png" alt="" width={64} height={64} />
                </div>

                <p
                    className="callsign absolute left-1/2 top-28 -translate-x-1/2"
                    style={{ color: palette.muted, opacity: 0.35 + 0.65 * Math.min(1, p * 2) }}
                >
                    and the rest
                </p>

                <div aria-hidden className="absolute inset-0 z-10">
                    {EXTRAS.map((extra, i) => {
                        // Staggered departures from the pile at the light.
                        const start = 0.08 + i * 0.065;
                        const eased = outCubic(
                            Math.max(0, Math.min(1, (p - start) / 0.4)),
                        );
                        const [ux, uy] = SPREAD[i % SPREAD.length];
                        // A slight arc: overshoot the bearing early, settle late.
                        const drift = Math.sin(eased * Math.PI) * 18;
                        const x = ux * halfX * eased + (i % 2 === 0 ? drift : -drift);
                        const y = uy * halfY * eased - drift * 0.4;
                        // Pile jitter so the stack reads as a stack.
                        const jx = ((i % 3) - 1) * 12 * (1 - eased);
                        const jy = ((i % 2) - 0.5) * 16 * (1 - eased);
                        const lit = Math.min(1, eased * 1.8);
                        return (
                            <FeatureCard
                                key={extra.tag}
                                extra={extra}
                                x={x + jx}
                                y={y + jy}
                                scale={0.22 + 0.78 * eased}
                                rotate={TILT[i % TILT.length] * eased}
                                lit={lit}
                            />
                        );
                    })}
                </div>

                {/* The cards launch underneath this mark; it stays put after
                    the full constellation has settled. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(9,9,11,1) 0%, rgba(9,9,11,1) 45%, rgba(9,9,11,0.55) 68%, rgba(9,9,11,0) 100%)",
                        isolation: "isolate",
                    }}
                >
                    <span
                        className="relative z-10 flex items-center justify-center"
                        style={{ transform: "translateZ(0)", willChange: "transform" }}
                    >
                        <IcarusMark
                            size={112}
                            style={{ display: "block", filter: "drop-shadow(0 0 18px rgba(196,181,253,0.28))" }}
                        />
                    </span>
                </div>
            </div>
        </section>
    );
}
