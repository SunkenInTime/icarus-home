"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { FaDiscord, FaGithub } from "react-icons/fa";

import versionInfo from "@/app/data/versionInfo";
import DitherFire from "../_shared/DitherFire";
import ProgressButton from "../_shared/ProgressButton";
import { palette } from "../_shared/tokens";

/**
 * The payoff. The final section IS the DitherFire field: visible as a faint
 * glow on the horizon from the previous section, growing hotter and more
 * violet as you approach (scroll drives progress 0 → 0.75). The download
 * button lives inside it; the real download drives progress the rest of the
 * way to 1.0 — completing the download completes the sun.
 */

const win = versionInfo.platforms.windows;

function DriftingFeather() {
    // Once per visit: a single feather detaches near the top of the sun and
    // drifts down. The wings are fine.
    return (
        <div aria-hidden className="pointer-events-none absolute left-[58%] top-[4%] z-10">
            <motion.div
                initial={{ y: -30, x: 0, rotate: 8, opacity: 0 }}
                animate={{
                    y: [-30, 90, 210, 330, 440],
                    x: [0, -34, 18, -26, 6],
                    rotate: [8, -16, 14, -12, 4],
                    opacity: [0, 1, 1, 1, 0],
                }}
                transition={{ duration: 6.5, ease: "easeInOut", times: [0, 0.22, 0.5, 0.78, 1] }}
            >
                <Image
                    src="/assets/feather.png"
                    alt=""
                    width={44}
                    height={44}
                    style={{ opacity: 0.85 }}
                />
            </motion.div>
            <motion.span
                className="callsign absolute left-[-40px] top-[460px] whitespace-nowrap"
                style={{ color: palette.dim, fontSize: 10 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 4.5, delay: 4.8, times: [0, 0.15, 0.75, 1] }}
            >
                cosmetic. the wings are fine.
            </motion.span>
        </div>
    );
}

export default function SunSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();
    const featherArmed = useInView(sectionRef, { once: true, margin: "-25% 0px" });

    const [scrollHeat, setScrollHeat] = useState(0);
    const [downloadHeat, setDownloadHeat] = useState(0);
    const [hoverHeat, setHoverHeat] = useState(false);
    const [done, setDone] = useState(false);
    const [markLanded, setMarkLanded] = useState(false);
    const hoverTimer = useRef(0);

    // The wordmark fades in when the traveler morphs into the logo (and back
    // out if it lifts off again). Under reduced motion the traveler never
    // flies, so being in view stands in for landing.
    useEffect(() => {
        const onMorph = (e: Event) => setMarkLanded(Boolean((e as CustomEvent).detail));
        window.addEventListener("ctts-logo-morph", onMorph);
        return () => window.removeEventListener("ctts-logo-morph", onMorph);
    }, []);
    const markShown = markLanded || (reduceMotion === true && featherArmed);

    // 0 when the section is still a viewport away, 0.75 when its heart is centered.
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 200%", "center center"],
    });
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        setScrollHeat(Math.round(v * 75) / 100);
    });

    useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

    function leanVioletForABeat() {
        if (downloadHeat > 0 || done) return;
        setHoverHeat(true);
        window.clearTimeout(hoverTimer.current);
        hoverTimer.current = window.setTimeout(() => setHoverHeat(false), 900);
    }

    const progress = Math.min(
        1,
        Math.max(scrollHeat, downloadHeat > 0 ? 0.75 + 0.25 * downloadHeat : 0) +
            (hoverHeat && downloadHeat === 0 ? 0.12 : 0),
    );

    return (
        <section
            id="the-sun"
            ref={sectionRef}
            className="relative"
            onPointerEnter={leanVioletForABeat}
        >
            {/* The sun itself. */}
            <div className="absolute inset-0">
                <DitherFire progress={progress} cell={9} />
            </div>

            {/* Horizon fade: the glow emerges from the black above. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[38vh]"
                style={{ background: `linear-gradient(180deg, ${palette.bg} 0%, transparent 100%)` }}
            />

            {/* A comet crossing the still-dark sky above the sun. */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-[8%] top-[5%] z-10 hidden sm:block"
            >
                <Image
                    src="/assets/comet.png"
                    alt=""
                    width={150}
                    height={150}
                    style={{ opacity: 0.38, transform: "rotate(6deg)" }}
                />
            </div>

            {featherArmed && !reduceMotion && <DriftingFeather />}

            <div className="relative z-10 mx-auto flex min-h-[135vh] max-w-3xl flex-col items-center justify-center px-6 py-32 text-center">
                {/* The flight path ends here: wing meets sun. */}
                <span data-flight-anchor aria-hidden className="mb-8 block h-2 w-2" />

                <div
                    className="flex flex-col items-center rounded-3xl px-8 py-10"
                    style={{
                        background: "radial-gradient(closest-side, rgba(9,9,11,0.68), rgba(9,9,11,0.25) 70%, transparent)",
                    }}
                >
                    {/* The wordmark: real text in the stack, revealed by the
                        landing — same 480ms as the traveler's crossfade. */}
                    <motion.p
                        className="callsign mb-5"
                        style={{ fontSize: 12, letterSpacing: "0.24em", color: palette.muted }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: markShown ? 1 : 0 }}
                        transition={{ duration: 0.48, ease: "easeOut" }}
                    >
                        Icarus
                    </motion.p>
                    <h2
                        className="font-display"
                        style={{
                            fontSize: "clamp(40px, 6vw, 76px)",
                            lineHeight: 1,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Touch the sun.
                    </h2>
                    <div className="mt-9">
                        <ProgressButton
                            href={win.url}
                            label="Download"
                            downloadingLabel={(percent) => `Closing distance… ${percent}%`}
                            doneLabel="Contact. Check your downloads."
                            onProgress={(p) => {
                                setDownloadHeat(Math.round(p * 50) / 50);
                                if (p >= 1) setDone(true);
                            }}
                        />
                    </div>

                    <p className="callsign mt-5" style={{ color: palette.muted, fontSize: 10 }}>
                        v{versionInfo.version} · {versionInfo.released}
                    </p>
                    <motion.p
                        className="font-display mt-10 text-[19px] font-medium"
                        style={{ color: palette.fg }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={done ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                        aria-hidden={!done}
                    >
                        Your wings. Your machine. Fly.
                    </motion.p>
                </div>

                {/* Quiet footer, inside the sun. */}
                <div
                    className="mt-24 flex items-center gap-7 text-[13px]"
                    style={{ color: palette.muted }}
                >
                    <a
                        href="https://github.com/SunkenInTime/icarus"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                        <FaGithub aria-hidden /> GitHub
                    </a>
                    <a
                        href="https://discord.gg/PN2uKwCqYB"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                        <FaDiscord aria-hidden /> Discord
                    </a>
                    <span aria-hidden style={{ color: palette.dim }}>
                        ·
                    </span>
                    <span style={{ color: palette.dim }}>MIT, all the way down</span>
                </div>
            </div>
        </section>
    );
}
