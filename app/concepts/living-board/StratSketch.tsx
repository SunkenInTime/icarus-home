"use client";

import { CSSProperties, useEffect, useState } from "react";
import { palette } from "../_shared/tokens";

/**
 * The pre-drawn strat that lays itself over the hero — an execute route
 * curling toward the primary CTA, a circle around "whiteboard", a cross,
 * and two ping dots. Decorative: aria-hidden, pointer-events none so ink
 * never blocks a click or a real pen stroke. Self-draws on mount via
 * stroke-dashoffset; under prefers-reduced-motion it just appears.
 *
 * Coordinates live in a 1000x620 viewBox stretched over the hero, so the
 * marks track the copy at any width without pixel math in the page.
 */

const PEN = "#c4b5fd";

// phase: "idle" before mount, "reduced" for prefers-reduced-motion (just
// show the ink), "draw" to run the self-draw animation.
type Phase = "idle" | "draw" | "reduced";

export default function StratSketch() {
    const [phase, setPhase] = useState<Phase>("idle");

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Defer both branches out of the synchronous effect body: reduced
        // motion resolves on the next tick, the self-draw after a short beat.
        const id = window.setTimeout(() => setPhase(reduce ? "reduced" : "draw"), reduce ? 0 : 260);
        return () => window.clearTimeout(id);
    }, []);

    const reduced = phase === "reduced";
    const drawn = phase === "draw";

    // Each path animates from fully-hidden (offset = length) to drawn (0).
    const stroke = (len: number, delay: number): CSSProperties =>
        reduced
            ? { strokeDasharray: "6 9" }
            : {
                  strokeDasharray: len,
                  strokeDashoffset: drawn ? 0 : len,
                  transition: `stroke-dashoffset ${Math.round(len * 1.1)}ms cubic-bezier(0.165,0.84,0.44,1) ${delay}ms`,
              };

    // Dashed variants keep the marching-dots look but still reveal on draw
    // by animating the offset of a large dash window laid over the pattern.
    const dashed = (len: number, delay: number): CSSProperties =>
        reduced
            ? { strokeDasharray: "1 10" }
            : {
                  strokeDasharray: `1 10`,
                  strokeDashoffset: drawn ? 0 : -len,
                  opacity: drawn ? 1 : 0,
                  transition: `stroke-dashoffset ${Math.round(len * 1.1)}ms cubic-bezier(0.165,0.84,0.44,1) ${delay}ms, opacity 200ms ease ${delay}ms`,
              };

    return (
        <svg
            aria-hidden
            viewBox="0 0 1000 620"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
        >
            {/* Execute route: sweeps in from the left, curls down toward the CTA. */}
            <path
                d="M60 250 C 210 170, 360 300, 470 300 S 700 360, 720 470"
                fill="none"
                stroke={PEN}
                strokeWidth={2.5}
                strokeLinecap="round"
                style={stroke(760, 120)}
            />
            {/* Arrowhead landing on the primary CTA. */}
            <path
                d="M720 470 l -16 -9 m 16 9 l 3 -18"
                fill="none"
                stroke={PEN}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={stroke(56, 900)}
            />

            {/* Loose circle lassoing the word "whiteboard". */}
            <path
                d="M150 372 C 120 352, 150 322, 250 320 C 400 318, 500 330, 500 358 C 500 388, 380 402, 250 400 C 175 399, 150 392, 150 372"
                fill="none"
                stroke={PEN}
                strokeWidth={2.5}
                strokeLinecap="round"
                style={stroke(980, 520)}
            />

            {/* A quick × mark, upper right. */}
            <path
                d="M812 150 l 34 34 M846 150 l -34 34"
                fill="none"
                stroke={PEN}
                strokeWidth={2.5}
                strokeLinecap="round"
                style={stroke(96, 780)}
            />

            {/* Ally ping — green dot with an outline glow. */}
            <circle cx="880" cy="330" r="7" fill={palette.allyGreen} style={dashed(1, 980)} />
            <circle
                cx="880"
                cy="330"
                r="15"
                fill="none"
                stroke={palette.allyOutline}
                strokeWidth={2}
                style={stroke(96, 1020)}
            />

            {/* Enemy ping — red dot with an outline glow. */}
            <circle cx="612" cy="128" r="7" fill={palette.enemyRed} style={dashed(1, 1080)} />
            <circle
                cx="612"
                cy="128"
                r="15"
                fill="none"
                stroke={palette.enemyOutline}
                strokeWidth={2}
                style={stroke(96, 1120)}
            />
        </svg>
    );
}
