"use client";

import type { CSSProperties } from "react";

import DitherFire from "../_shared/DitherFire";

/**
 * Swing A — the sun, foreshadowed. A cold slice of the same DitherFire field
 * that blazes at the bottom of the page, brought up into the hero so the
 * payoff at the end is something the page hinted at rather than sprung.
 *
 * The open question is where to put it. `horizon` (the first pass) washes the
 * whole top edge, which reads well but sits directly behind the headline. The
 * rest keep the same field and move it off the copy:
 *
 *   corona   — pooled around the sun, leaning inward, as the sun's own heat
 *   hairline — a thin band pinned to the very top edge of the viewport
 *   vignette — the four corners of the first screen, centre left clean
 *   sunward  — a vignette pulled off-centre so the sun's corner burns hottest
 *
 * `sunward` exists because corona and vignette are arguing different things:
 * corona says the field belongs to the sun, vignette says it belongs to the
 * page. Weighting a vignette toward the corner the sun is in gets both, and
 * unlike corona it still works when the sun is hidden.
 *
 * `warm` shares the download button's hover beat, so both ends of the page
 * answer the same gesture.
 */

export type PreEchoShape =
    | "horizon"
    | "corona"
    | "hairline"
    | "vignette"
    | "sunward";

export const PRE_ECHO_SHAPES: PreEchoShape[] = [
    "corona",
    "hairline",
    "vignette",
    "sunward",
    "horizon",
];

const VERTICAL_FADE =
    "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)";

type ShapeConfig = {
    box: CSSProperties;
    mask: string;
    opacity: number;
    cell: number;
    /** Field energy at rest, and while the download button is hovered. */
    idle: number;
    warm: number;
    /** For shapes that only make sense while the sun they answer is on screen. */
    needsSun?: boolean;
};

/**
 * Each shape is tuned separately, because masking away most of the field also
 * masks away most of its presence: the shapes that survive on a thin sliver
 * need more energy than the ones that get the whole top of the page.
 */
const SHAPES: Record<PreEchoShape, ShapeConfig> = {
    horizon: {
        box: { top: 0, left: 0, right: 0, height: "48vh" },
        mask: VERTICAL_FADE,
        opacity: 0.5,
        cell: 10,
        idle: 0.1,
        warm: 0.28,
    },
    // Deliberately off-centre from the sun: the pool leans down and inward,
    // like light spilling off the artwork rather than a halo drawn around it.
    // Tied to the sun's own breakpoint — below sm the sun is hidden, and a
    // corona with nothing to be the corona of is just a stain on the copy.
    corona: {
        box: { top: -160, right: -200, width: 760, height: 620 },
        mask: "radial-gradient(closest-side, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 46%, transparent 72%)",
        opacity: 0.68,
        cell: 9,
        idle: 0.15,
        warm: 0.34,
        needsSun: true,
    },
    // Shipped at 340px / heat 0.27: deep enough to read as sky, falloff still
    // front-loaded so the extra weight sits above the copy. A coarser lattice
    // than the other shapes — bolder dots read as more presence without
    // needing more room.
    hairline: {
        box: { top: 0, left: 0, right: 0, height: 340 },
        mask: "linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 34%, rgba(0,0,0,0.18) 66%, transparent 88%)",
        opacity: 0.76,
        cell: 10,
        idle: 0.27,
        warm: 0.49,
    },
    // The ellipse is wide enough to clear the copy column at every width the
    // headline holds; the field only survives in the four corners.
    vignette: {
        box: { top: 0, left: 0, right: 0, height: "100vh" },
        mask: "radial-gradient(ellipse 78% 70% at 46% 40%, transparent 0%, rgba(0,0,0,0.42) 64%, rgba(0,0,0,0.95) 100%)",
        opacity: 0.62,
        cell: 9,
        idle: 0.16,
        warm: 0.34,
    },
    // Same vignette, centre pulled down and left, which pushes the top-right
    // corner furthest outside the ellipse: the sun's corner burns hottest and
    // the other three stay a frame. One gradient, so no mask compositing.
    sunward: {
        box: { top: 0, left: 0, right: 0, height: "100vh" },
        mask: "radial-gradient(ellipse 74% 82% at 38% 46%, transparent 0%, rgba(0,0,0,0.32) 58%, rgba(0,0,0,0.95) 100%)",
        opacity: 0.62,
        cell: 9,
        idle: 0.16,
        warm: 0.34,
    },
};

/** Ranges the judging rig dials over. Defaults live in SHAPES above. */
export const DEPTH_RANGE = { min: 90, max: 340, step: 10 } as const;
export const HEAT_RANGE = { min: 0.04, max: 0.45, step: 0.01 } as const;

/** Depth is a pixel height, so it only applies to shapes measured that way. */
export function shapeTakesDepth(shape: PreEchoShape): boolean {
    return typeof SHAPES[shape].box.height === "number";
}

export function shapeDefaults(shape: PreEchoShape) {
    const config = SHAPES[shape];
    return {
        depth: typeof config.box.height === "number" ? config.box.height : null,
        heat: config.idle,
    };
}

export default function SunPreEcho({
    shape = "corona",
    warm = false,
    depth,
    heat,
}: {
    shape?: PreEchoShape;
    warm?: boolean;
    /** Overrides the band height, in px. Ignored by shapes sized in vh. */
    depth?: number;
    /** Overrides resting field energy; the hover lift is preserved on top. */
    heat?: number;
}) {
    const config = SHAPES[shape];
    const box =
        depth != null && typeof config.box.height === "number"
            ? { ...config.box, height: depth }
            : config.box;
    const idle = heat ?? config.idle;
    const warmed = Math.min(1, idle + (config.warm - config.idle));

    return (
        <div
            aria-hidden
            data-pre-echo={shape}
            className={`pointer-events-none absolute ${
                config.needsSun ? "hidden sm:block" : ""
            }`}
            style={box}
        >
            <div
                className="absolute inset-0"
                style={{
                    opacity: config.opacity,
                    maskImage: config.mask,
                    WebkitMaskImage: config.mask,
                }}
            >
                <DitherFire
                    progress={warm ? warmed : idle}
                    cell={config.cell}
                    speed={0.4}
                />
            </div>
        </div>
    );
}
