"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, motion } from "framer-motion";

import { palette } from "../_shared/tokens";
import { ChipFace, EXTRAS, ExtrasInventory, type Extra } from "./extras";

/**
 * The extras, riding a thermal. Feature chips rise through the section in a
 * continuous stream — no interaction required — swaying gently as they climb
 * and fading out near the top. Moving the cursor through the column stirs it:
 * chips get pushed and puffed upward, and stirring vigorously makes the
 * thermal give faster. Clicking releases a small burst from under the cursor.
 *
 * All per-frame work is one rAF loop with direct style writes (the page's
 * house style — see FlightPath/Altimeter); React only mounts/unmounts chips.
 * Reduced motion: a static chip grid.
 */

const HEIGHT = 560;
const MAX_CHIPS = 22;
const SPAWN_EVERY_S = 0.8;
const STIR_SPAWN_EVERY_S = 0.2;
const STIR_SPEED = 900; // px/s of pointer movement that counts as stirring
const STIR_WINDOW_MS = 600;
const POINTER_RADIUS = 150;

type ChipPhys = {
    el: HTMLDivElement | null;
    xBase: number;
    y: number;
    /** Climb speed, px/s. */
    vy: number;
    swayPhase: number;
    swayFreq: number;
    swayAmp: number;
    /** Accumulated pointer shove and its velocity. */
    push: number;
    pushV: number;
    rot: number;
    t: number;
};

type ChipItem = { id: number; extra: Extra };

type Ember = { left: number; size: number; duration: number; delay: number };

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

export default function Updraft() {
    const containerRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const inView = useInView(containerRef, { margin: "10% 0px" });

    const [chips, setChips] = useState<ChipItem[]>([]);
    const [embers, setEmbers] = useState<Ember[]>([]);
    const phys = useRef(new Map<number, ChipPhys>());
    const nextId = useRef(0);
    const nextExtra = useRef(0);
    const pointer = useRef<{ x: number; y: number } | null>(null);
    const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null);
    const stirUntil = useRef(0);

    // Ember params are random — generate after mount so SSR markup stays stable.
    useEffect(() => {
        setEmbers(
            Array.from({ length: 12 }, () => ({
                left: rand(22, 78),
                size: rand(2, 3.5),
                duration: rand(6, 13),
                delay: rand(0, 9),
            })),
        );
    }, []);

    useEffect(() => {
        if (reduceMotion) return;
        const container = containerRef.current;
        if (!container || !inView) return;

        function spawn(count: number, atX?: number, atY?: number) {
            const w = container!.clientWidth;
            const colHalf = Math.min(320, w * 0.32);
            const fresh: ChipItem[] = [];
            for (let i = 0; i < count; i += 1) {
                if (phys.current.size + fresh.length >= MAX_CHIPS) break;
                const id = nextId.current++;
                fresh.push({ id, extra: EXTRAS[nextExtra.current++ % EXTRAS.length] });
                phys.current.set(id, {
                    el: null,
                    xBase: atX !== undefined ? atX + rand(-60, 60) : w / 2 + rand(-colHalf, colHalf),
                    y: atY !== undefined ? atY : HEIGHT + 30,
                    vy: rand(52, 84),
                    swayPhase: rand(0, Math.PI * 2),
                    swayFreq: rand(0.5, 0.9),
                    swayAmp: rand(14, 34),
                    push: 0,
                    pushV: 0,
                    rot: rand(-8, 8),
                    t: 0,
                });
            }
            if (fresh.length) setChips((prev) => [...prev, ...fresh]);
        }

        // Prime the column so it reads as already-flowing, not switched on.
        if (phys.current.size === 0) {
            for (let i = 0; i < 5; i += 1) {
                spawn(1, undefined, rand(HEIGHT * 0.2, HEIGHT + 20));
            }
        }

        let raf = 0;
        let last = performance.now();
        let spawnAcc = 0;

        function frame(now: number) {
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;

            spawnAcc += dt;
            const interval = now < stirUntil.current ? STIR_SPAWN_EVERY_S : SPAWN_EVERY_S;
            if (spawnAcc >= interval) {
                spawnAcc = 0;
                spawn(1);
            }

            const p = pointer.current;
            const dead: number[] = [];

            phys.current.forEach((c, id) => {
                if (!c.el) return;
                c.t += dt;
                c.y -= c.vy * dt;

                const sway = Math.sin(c.swayPhase + c.t * c.swayFreq * Math.PI * 2) * c.swayAmp;
                let x = c.xBase + sway + c.push;

                if (p) {
                    const dx = x - p.x;
                    const dy = c.y - p.y;
                    const d = Math.hypot(dx, dy);
                    if (d < POINTER_RADIUS && d > 1) {
                        const falloff = 1 - d / POINTER_RADIUS;
                        c.pushV += (dx / d) * falloff * 1500 * dt;
                        // Warm hand: chips near the cursor get an upward puff.
                        c.y -= falloff * 90 * dt;
                    }
                }
                c.push += c.pushV * dt;
                c.pushV *= Math.max(0, 1 - 2.4 * dt);
                c.push *= Math.max(0, 1 - 0.5 * dt);
                x = c.xBase + sway + c.push;

                const fadeIn = (HEIGHT + 30 - c.y) / 110;
                const fadeOut = c.y / 130;
                const opacity = Math.max(0, Math.min(1, fadeIn, fadeOut));

                c.el.style.transform = `translate3d(${x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0) translateX(-50%) rotate(${(c.rot + sway * 0.12).toFixed(2)}deg)`;
                c.el.style.opacity = opacity.toFixed(3);

                if (c.y < -60) dead.push(id);
            });

            if (dead.length) {
                dead.forEach((id) => phys.current.delete(id));
                setChips((prev) => prev.filter((chip) => !dead.includes(chip.id)));
            }

            raf = requestAnimationFrame(frame);
        }

        raf = requestAnimationFrame(frame);

        function localPoint(e: PointerEvent) {
            const rect = container!.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        function onPointerMove(e: PointerEvent) {
            const pt = localPoint(e);
            const now = performance.now();
            const prev = lastPointer.current;
            if (prev) {
                const dtMs = Math.max(1, now - prev.t);
                const speed = (Math.hypot(pt.x - prev.x, pt.y - prev.y) / dtMs) * 1000;
                if (speed > STIR_SPEED) stirUntil.current = now + STIR_WINDOW_MS;
            }
            lastPointer.current = { ...pt, t: now };
            pointer.current = pt;
        }

        function onPointerLeave() {
            pointer.current = null;
            lastPointer.current = null;
        }

        function onClick(e: MouseEvent) {
            const rect = container!.getBoundingClientRect();
            spawn(3, e.clientX - rect.left, HEIGHT + 10);
        }

        container.addEventListener("pointermove", onPointerMove);
        container.addEventListener("pointerleave", onPointerLeave);
        container.addEventListener("click", onClick);

        return () => {
            cancelAnimationFrame(raf);
            container.removeEventListener("pointermove", onPointerMove);
            container.removeEventListener("pointerleave", onPointerLeave);
            container.removeEventListener("click", onClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, reduceMotion]);

    if (reduceMotion) {
        return (
            <div className="mt-12 flex flex-wrap gap-3">
                {EXTRAS.map((extra) => (
                    <ChipFace key={extra.tag} extra={extra} />
                ))}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative mt-6 overflow-hidden"
            style={{ height: HEIGHT }}
        >
            <ExtrasInventory />

            {/* The heat source: a faint violet glow at the column's base. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
                style={{
                    background:
                        "radial-gradient(ellipse 55% 90% at 50% 105%, rgba(124,58,237,0.14), transparent 70%)",
                }}
            />

            {/* Embers riding the same air. */}
            {embers.map((ember, i) => (
                <motion.span
                    key={i}
                    aria-hidden
                    className="pointer-events-none absolute rounded-full"
                    style={{
                        left: `${ember.left}%`,
                        bottom: -6,
                        width: ember.size,
                        height: ember.size,
                        background: palette.lavender,
                    }}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: -(HEIGHT + 20), opacity: [0, 0.45, 0] }}
                    transition={{
                        duration: ember.duration,
                        delay: ember.delay,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {chips.map((chip) => (
                <div
                    key={chip.id}
                    aria-hidden
                    ref={(el) => {
                        const c = phys.current.get(chip.id);
                        if (c) c.el = el;
                    }}
                    className="pointer-events-none absolute left-0 top-0"
                    style={{ opacity: 0, willChange: "transform, opacity" }}
                >
                    <ChipFace extra={chip.extra} />
                </div>
            ))}

            <p
                className="callsign pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2"
                style={{ color: palette.dim, fontSize: 10 }}
            >
                stir it
            </p>
        </div>
    );
}
