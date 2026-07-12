"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import {
    FaFolderOpen,
    FaHashtag,
    FaKeyboard,
    FaLayerGroup,
    FaPlus,
    FaRegClone,
    FaShapes,
    FaSyncAlt,
} from "react-icons/fa";

import { palette, shadow } from "../_shared/tokens";

/**
 * The extras, as a box that keeps giving. It sits mid-section; scroll it into
 * view and a few feature chips tumble out on their own. Shake it (drag), tap
 * it, and it keeps ejecting chips — cycling the list forever, because the
 * point is abundance, not inventory. Chips arc out with a little toss physics
 * and settle scattered around the box.
 *
 * Reduced motion: the box renders inert with every chip laid out statically.
 */

type Extra = { tag: string; detail: string; icon: IconType };

const EXTRAS: Extra[] = [
    { tag: "custom folders", detail: "Recolor and organize them your way.", icon: FaFolderOpen },
    { tag: "keybinds", detail: "For everything you do twice.", icon: FaKeyboard },
    { tag: "multiple lineups", detail: "Per agent, per map, per mood.", icon: FaLayerGroup },
    { tag: "custom shapes", detail: "For when the pen isn't enough.", icon: FaShapes },
    { tag: "the pages bar", detail: "One strategy, many pages — every sequence gets its own beat.", icon: FaRegClone },
    { tag: "share codes", detail: "One code hands your five-stack the whole strat.", icon: FaHashtag },
    { tag: "auto-updates", detail: "Fixes ship while the meta is still warm.", icon: FaSyncAlt },
    { tag: "and more", detail: "We stopped listing. Keep shaking.", icon: FaPlus },
];

type Chip = {
    id: number;
    extra: Extra;
    /** Landing offset from box center, px. */
    tx: number;
    ty: number;
    /** Apex of the toss arc, px above spawn. */
    apex: number;
    rot: number;
};

const MAX_CHIPS = 36;
const EJECT_COOLDOWN_MS = 160;
const SHAKE_VELOCITY = 650;

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function ChipFace({ extra }: { extra: Extra }) {
    const Icon = extra.icon;
    return (
        <span
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2"
            style={{
                background: palette.card,
                borderColor: palette.border,
                boxShadow: shadow.cardForeground,
            }}
            title={extra.detail}
        >
            <Icon size={11} color={palette.lavender} aria-hidden />
            <span className="callsign" style={{ color: palette.fg, fontSize: 10 }}>
                {extra.tag}
            </span>
        </span>
    );
}

export default function GivingBox() {
    const containerRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const inView = useInView(containerRef, { once: true, margin: "-20% 0px" });

    const [chips, setChips] = useState<Chip[]>([]);
    const nextId = useRef(0);
    const nextExtra = useRef(0);
    const lastEject = useRef(0);

    function eject(count: number) {
        const half = Math.min(430, (containerRef.current?.clientWidth ?? 800) / 2 - 70);
        setChips((prev) => {
            const fresh: Chip[] = [];
            for (let i = 0; i < count; i += 1) {
                const tx = rand(-half, half);
                fresh.push({
                    id: nextId.current++,
                    extra: EXTRAS[nextExtra.current++ % EXTRAS.length],
                    tx,
                    // Clear the box itself: straight-down landings sit lower.
                    ty: Math.abs(tx) < 150 ? rand(150, 235) : rand(60, 235),
                    apex: -rand(90, 175),
                    rot: rand(-14, 14),
                });
            }
            return [...prev, ...fresh].slice(-MAX_CHIPS);
        });
    }

    function shake(velocityX: number, velocityY: number) {
        const now = performance.now();
        if (now - lastEject.current < EJECT_COOLDOWN_MS) return;
        if (Math.hypot(velocityX, velocityY) < SHAKE_VELOCITY) return;
        lastEject.current = now;
        eject(Math.random() < 0.3 ? 2 : 1);
    }

    // First gift is free: a few chips tumble out when the box scrolls in.
    useEffect(() => {
        if (!inView || reduceMotion) return;
        const timers = [300, 700, 1100].map((delay) =>
            window.setTimeout(() => eject(1), delay),
        );
        return () => timers.forEach((t) => window.clearTimeout(t));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, reduceMotion]);

    if (reduceMotion) {
        return (
            <div ref={containerRef} className="mt-12">
                <div className="flex flex-wrap gap-3">
                    {EXTRAS.map((extra) => (
                        <ChipFace key={extra.tag} extra={extra} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative mt-10 flex h-[520px] items-center justify-center"
        >
            {/* Screen-reader inventory of what the box holds. */}
            <ul className="sr-only">
                {EXTRAS.map((extra) => (
                    <li key={extra.tag}>
                        {extra.tag} — {extra.detail}
                    </li>
                ))}
            </ul>

            {chips.map((chip) => (
                <motion.div
                    key={chip.id}
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2"
                    initial={{ x: -50, y: -60, rotate: 0, opacity: 0, scale: 0.6 }}
                    animate={{
                        x: [-50, -50 + chip.tx * 0.55, -50 + chip.tx],
                        y: [-60, -60 + chip.apex, chip.ty],
                        rotate: [0, chip.rot * 1.5, chip.rot],
                        opacity: [0, 1, 1],
                        scale: [0.6, 1, 1],
                    }}
                    transition={{ duration: 0.9, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] }}
                >
                    <ChipFace extra={chip.extra} />
                </motion.div>
            ))}

            <motion.div
                drag
                dragSnapToOrigin
                dragElastic={0.4}
                dragMomentum={false}
                whileHover={{ rotate: -1.5 }}
                whileDrag={{ rotate: -3, scale: 1.04, cursor: "grabbing" }}
                onDrag={(_, info) => shake(info.velocity.x, info.velocity.y)}
                onTap={() => eject(2)}
                className="relative z-10 flex h-[168px] w-[248px] cursor-grab touch-none select-none flex-col items-center justify-center rounded-2xl border"
                style={{
                    background: palette.card,
                    borderColor: "rgba(255,255,255,0.16)",
                    boxShadow: shadow.cardForeground,
                }}
            >
                {/* Lid seam. */}
                <span
                    aria-hidden
                    className="absolute inset-x-0 top-9 h-px"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                />
                <span
                    aria-hidden
                    className="absolute left-1/2 top-9 h-2.5 w-8 -translate-x-1/2 rounded-b-md border-x border-b"
                    style={{ borderColor: "rgba(255,255,255,0.14)" }}
                />

                <span className="callsign" style={{ color: palette.fg }}>
                    the rest of it
                </span>
                <span className="callsign mt-2" style={{ color: palette.dim, fontSize: 10 }}>
                    shake it
                </span>
            </motion.div>
        </div>
    );
}
