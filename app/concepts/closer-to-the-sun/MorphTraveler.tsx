"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import Image from "next/image";
import icarusLogo from "../../../icarus-logo-svg.svg";

/**
 * The thing that falls down the flight path. Every stage is line art drawn
 * in the same hand — five strokes of two cubics each on a 64×64 grid — so
 * morphing between stages is a plain lerp of numbers plus per-stroke
 * opacity (a stage that needs fewer strokes fades the spares out). The
 * final stage gathers the strokes into a gesture of the logomark while the
 * real IcarusMark crossfades in over them.
 *
 * Stages are keyed to the sections the traveler passes:
 *   wing (hero) → dart (fast/free/yours) → reticle (agent bar) →
 *   folder (local-first) → heart (community) → comet (the torchlit extras) →
 *   logo (the sun).
 */

/** One stroke: [Mx,My, C1…C6, C1…C6] — a move and two cubics. */
type Stroke = number[];
type Shape = { strokes: Stroke[]; alpha: number[] };

const STROKES = 5;
const NUMS = 14;

/** Rotate directional artwork clockwise around the center of the 64px grid. */
function rotateShapeClockwise(shape: Shape): Shape {
    return {
        strokes: shape.strokes.map((stroke) => {
            const rotated: Stroke = [];
            for (let i = 0; i < stroke.length; i += 2) {
                rotated.push(64 - stroke[i + 1], stroke[i]);
            }
            return rotated;
        }),
        alpha: shape.alpha,
    };
}

const SHAPES: Record<string, Shape> = {
    // Layered gull wing: long leading edge, three feathers, a body line.
    wing: {
        strokes: [
            [5, 42, 12, 30, 24, 20, 38, 16, 45, 14, 52, 13, 59, 12],
            [12, 42, 20, 34, 30, 27, 40, 23, 45, 21, 50, 20, 54, 19],
            [20, 43, 27, 37, 34, 32, 41, 28, 44, 26, 47, 25, 50, 24],
            [28, 44, 33, 40, 38, 36, 42, 33, 44, 32, 45, 31, 47, 30],
            [5, 42, 8, 44, 12, 45, 17, 45, 20, 45, 23, 44, 26, 44],
        ],
        alpha: [1, 1, 1, 1, 1],
    },
    // Paper plane, nose right: top edge, bottom edge, inner fold, rear edge,
    // and a lighter fold shadow.
    dart: rotateShapeClockwise({
        strokes: [
            [6, 18, 20, 21.5, 34, 25, 45, 28, 49, 29.3, 53, 30.6, 56, 32],
            [6, 50, 20, 46, 34, 41, 45, 37, 49, 35.6, 53, 34.3, 56, 32],
            [6, 18, 16, 25, 24, 30, 30, 33, 26, 38, 22, 43, 18, 47],
            [6, 18, 7.5, 26, 7.5, 34, 7, 42, 6.8, 45, 6.5, 47.5, 6, 50],
            [12, 46, 22, 42.5, 32, 39, 42, 35.5, 46, 34.3, 51, 33.1, 55, 32],
        ],
        alpha: [1, 1, 1, 1, 0.45],
    }),
    // Scope reticle: full circle (two arcs) crossed by full axes.
    reticle: {
        strokes: [
            [32, 14, 42, 14, 50, 22, 50, 32, 50, 42, 42, 50, 32, 50],
            [32, 50, 22, 50, 14, 42, 14, 32, 14, 22, 22, 14, 32, 14],
            [32, 6, 32, 14, 32, 22, 32, 32, 32, 42, 32, 50, 32, 58],
            [6, 32, 14, 32, 22, 32, 32, 32, 42, 32, 50, 32, 58, 32],
            [32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32],
        ],
        alpha: [1, 1, 1, 1, 0],
    },
    // Proper folder outline: tab, top edge, right, bottom, left.
    folder: {
        strokes: [
            [8, 24, 8, 21, 10, 19, 13, 19, 18, 19, 21, 19, 24, 21],
            [24, 21, 26, 23, 28, 24, 31, 24, 39, 24, 47, 24, 54, 24],
            [54, 24, 56, 24, 57, 25, 57, 27, 57, 33, 57, 39, 57, 44],
            [57, 44, 57, 46, 56, 47, 54, 47, 40, 47, 25, 47, 11, 47],
            [11, 47, 9, 47, 8, 46, 8, 44, 8, 38, 8, 31, 8, 24],
        ],
        alpha: [1, 1, 1, 1, 1],
    },
    // Heart with three small rays above it.
    heart: {
        strokes: [
            [32, 26, 28, 16, 14, 14, 12, 25, 10, 36, 22, 44, 32, 52],
            [32, 26, 36, 16, 50, 14, 52, 25, 54, 36, 42, 44, 32, 52],
            [20, 9, 20.7, 10.7, 21.3, 12.3, 22, 14, 22, 14, 22, 14, 22, 14],
            [44, 9, 43.3, 10.7, 42.7, 12.3, 42, 14, 42, 14, 42, 14, 42, 14],
            [32, 2, 32, 3.7, 32, 5.3, 32, 7, 32, 7, 32, 7, 32, 7],
        ],
        alpha: [1, 1, 0.7, 0.7, 0.7],
    },
    // Comet: round head, three tapering tails, a sparkle ahead.
    comet: rotateShapeClockwise({
        strokes: [
            [45, 25, 53, 27, 55, 36, 49, 41, 44, 45, 36, 42, 36, 34],
            [40, 25, 31, 22.5, 22, 20.5, 15, 19.3, 12, 18.8, 9, 18.4, 6, 18],
            [36, 31, 27, 30.7, 18, 30.4, 13, 30.3, 11, 30.2, 8, 30.1, 5, 30],
            [39, 38, 30, 40, 21, 41.8, 14, 43, 11, 43.5, 8, 44, 5, 44.5],
            [51, 15, 52, 16.7, 53, 18.3, 54, 20, 54, 20, 54, 20, 54, 20],
        ],
        alpha: [1, 1, 1, 1, 0.7],
    }),
    // A gesture of the logomark; the real mark fades in over it.
    logo: {
        strokes: [
            [20, 44, 26, 34, 33, 26, 40, 18, 42, 15, 45, 13, 47, 10],
            [16, 30, 23, 32, 29, 37, 34, 42, 36, 44, 38, 46, 40, 48],
            [44, 20, 49, 23, 51, 29, 50, 35, 49.6, 37, 49, 39, 48, 40],
            [42, 50, 45, 46, 50, 48, 48, 53, 47, 54.5, 45, 54, 44, 52],
            [30, 20, 30, 20, 30, 20, 30, 20, 30, 20, 30, 20, 30, 20],
        ],
        alpha: [1, 1, 1, 1, 0],
    },
};

/** Stage order along the page; index = nearest flight anchor, clamped. */
export const STAGES = [
    "wing", // hero headline — the falling wing begins the journey
    "dart", // why icarus
    "reticle", // agent bar
    "folder", // local-first
    "heart", // community
    "comet", // extras (two anchors)
    "comet",
    "logo", // the sun — the traveler resolves into the Icarus mark
] as const;

const MORPH_MS = 480;

function outCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

function strokeD(s: number[]): string {
    const n = (i: number) => s[i].toFixed(1);
    return (
        `M ${n(0)} ${n(1)} ` +
        `C ${n(2)} ${n(3)}, ${n(4)} ${n(5)}, ${n(6)} ${n(7)} ` +
        `C ${n(8)} ${n(9)}, ${n(10)} ${n(11)}, ${n(12)} ${n(13)}`
    );
}

export type MorphTravelerHandle = {
    /** Morph toward the stage nearest the given flight-anchor index. */
    setStage: (anchorIndex: number) => void;
};

const MorphTraveler = forwardRef<MorphTravelerHandle, { size?: number }>(
    function MorphTraveler({ size = 48 }, ref) {
        const pathRefs = useRef<(SVGPathElement | null)[]>([]);
        const strokesRef = useRef<SVGSVGElement>(null);
        const planeRef = useRef<HTMLDivElement>(null);
        const cometRef = useRef<HTMLDivElement>(null);
        const logoRef = useRef<HTMLDivElement>(null);

        const current = useRef<number[][]>(SHAPES.wing.strokes.map((s) => [...s]));
        const currentAlpha = useRef<number[]>([...SHAPES.wing.alpha]);
        const stageKey = useRef<string>("wing");
        const planeShown = useRef(0);
        const cometShown = useRef(0);
        const logoShown = useRef(0);
        const raf = useRef(0);

        useImperativeHandle(ref, () => ({
            setStage(anchorIndex: number) {
                const key =
                    STAGES[Math.max(0, Math.min(STAGES.length - 1, anchorIndex))];
                if (key === stageKey.current) return;
                stageKey.current = key;

                // Let the page react to the mark arriving/leaving (the sun
                // section fades its wordmark in step with the crossfade).
                window.dispatchEvent(
                    new CustomEvent("ctts-logo-morph", { detail: key === "logo" }),
                );

                const reduceMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                ).matches;

                const from = current.current.map((s) => [...s]);
                const fromAlpha = [...currentAlpha.current];
                const to = SHAPES[key];
                const planeFrom = planeShown.current;
                const planeTo = key === "dart" ? 1 : 0;
                const cometFrom = cometShown.current;
                const cometTo = key === "comet" ? 1 : 0;
                const logoFrom = logoShown.current;
                const logoTo = key === "logo" ? 1 : 0;
                const start = performance.now();

                cancelAnimationFrame(raf.current);

                const apply = (t: number) => {
                    for (let i = 0; i < STROKES; i += 1) {
                        for (let j = 0; j < NUMS; j += 1) {
                            current.current[i][j] =
                                from[i][j] + (to.strokes[i][j] - from[i][j]) * t;
                        }
                        currentAlpha.current[i] =
                            fromAlpha[i] + (to.alpha[i] - fromAlpha[i]) * t;
                        const el = pathRefs.current[i];
                        if (el) {
                            el.setAttribute("d", strokeD(current.current[i]));
                            el.style.opacity = currentAlpha.current[i].toFixed(3);
                        }
                    }
                    planeShown.current = planeFrom + (planeTo - planeFrom) * t;
                    if (planeRef.current) {
                        planeRef.current.style.opacity = planeShown.current.toFixed(3);
                    }
                    cometShown.current = cometFrom + (cometTo - cometFrom) * t;
                    if (cometRef.current) {
                        cometRef.current.style.opacity = cometShown.current.toFixed(3);
                    }
                    logoShown.current = logoFrom + (logoTo - logoFrom) * t;
                    if (logoRef.current) {
                        logoRef.current.style.opacity = logoShown.current.toFixed(3);
                        logoRef.current.style.transform = `scale(${(0.7 + 1.3 * logoShown.current).toFixed(3)})`;
                    }
                    if (strokesRef.current) {
                        strokesRef.current.style.opacity = (
                            1 -
                            Math.max(
                                planeShown.current,
                                cometShown.current,
                                logoShown.current,
                            )
                        ).toFixed(3);
                    }
                };

                if (reduceMotion) {
                    apply(1);
                    return;
                }

                const tick = (now: number) => {
                    const t = Math.min(1, (now - start) / MORPH_MS);
                    apply(outCubic(t));
                    if (t < 1) raf.current = requestAnimationFrame(tick);
                };
                raf.current = requestAnimationFrame(tick);
            },
        }));

        return (
            <div
                aria-hidden
                style={{ position: "relative", width: size, height: size }}
            >
                <svg
                    ref={strokesRef}
                    viewBox="0 0 64 64"
                    width={size}
                    height={size}
                    fill="none"
                    style={{ opacity: 1 }}
                >
                    {SHAPES.wing.strokes.map((stroke, i) => (
                        <path
                            key={i}
                            ref={(el) => {
                                pathRefs.current[i] = el;
                            }}
                            d={strokeD(SHAPES.wing.strokes[i])}
                            stroke="#fafafa"
                            strokeWidth={3.2}
                            strokeLinecap="round"
                            style={{ opacity: SHAPES.wing.alpha[i] }}
                        />
                    ))}
                </svg>
                <div
                    ref={planeRef}
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        transform: "rotate(90deg)",
                        transformOrigin: "center",
                    }}
                >
                    <Image
                        src="/assets/paper-plane.png"
                        alt=""
                        width={size}
                        height={size}
                        style={{
                            display: "block",
                            width: size,
                            height: size,
                            objectFit: "contain",
                        }}
                    />
                </div>
                <div
                    ref={cometRef}
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        transform: "rotate(90deg)",
                        transformOrigin: "center",
                    }}
                >
                    <Image
                        src="/assets/comet.png"
                        alt=""
                        width={size}
                        height={size}
                        style={{
                            display: "block",
                            width: size,
                            height: size,
                            objectFit: "contain",
                        }}
                    />
                </div>
                <div
                    ref={logoRef}
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: size,
                        opacity: 0,
                        transform: "scale(0.7)",
                        transformOrigin: `${size / 2}px ${size / 2}px`,
                    }}
                >
                    <Image
                        src={icarusLogo}
                        alt=""
                        width={size}
                        height={size}
                        style={{ display: "block", width: size, height: size }}
                    />
                </div>
            </div>
        );
    },
);

export default MorphTraveler;
