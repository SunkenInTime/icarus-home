"use client";

import { useEffect, useRef, useState } from "react";

import DitherLight from "../_shared/DitherLight";
import { usePrefersReducedMotion } from "../_shared/usePrefersReducedMotion";

/**
 * Swing B — the first screen answers the pointer. The torchlight pool from
 * TorchlitExtras, moved to the hero backdrop and steered by the cursor: the
 * dot grid stops being wallpaper and starts being a surface you disturb.
 *
 * The whole page is otherwise a function of scrollY, which is worth nothing
 * at scroll zero. This is the cheapest thing that gives the hero a reason to
 * move before anyone commits to scrolling.
 *
 * Pointer work is rAF-throttled to one commit per frame (DitherLight runs its
 * own render loop and reads the latest value), matching the house style.
 * Reduced motion renders nothing and leaves the plain dot grid in place.
 */

const RESTING_LIGHT = { x: 0.5, y: 0.4 };
const IDLE_PROGRESS = 0.13;
const LIT_PROGRESS = 0.2;

export default function PointerField() {
    const hostRef = useRef<HTMLDivElement>(null);
    const reduceMotion = usePrefersReducedMotion();
    const [light, setLight] = useState(RESTING_LIGHT);
    const [lit, setLit] = useState(false);

    useEffect(() => {
        if (reduceMotion) return;
        const host = hostRef.current;
        if (!host) return;

        const next = { ...RESTING_LIGHT };
        let raf = 0;

        function commit() {
            raf = 0;
            setLight({ x: next.x, y: next.y });
        }

        function onMove(event: PointerEvent) {
            const rect = host!.getBoundingClientRect();
            // Outside the hero the pool would be pinned to an edge; let it go
            // back to resting instead so the effect belongs to this section.
            const inside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;

            if (inside) {
                next.x = (event.clientX - rect.left) / Math.max(1, rect.width);
                next.y = (event.clientY - rect.top) / Math.max(1, rect.height);
            } else {
                next.x = RESTING_LIGHT.x;
                next.y = RESTING_LIGHT.y;
            }
            setLit(inside);
            if (!raf) raf = requestAnimationFrame(commit);
        }

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            if (raf) cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onMove);
        };
    }, [reduceMotion]);

    // The static grid lives here rather than on the section, so the hero never
    // has to ask about reduced motion to decide what its backdrop is.
    if (reduceMotion) {
        return (
            <div aria-hidden className="tactical-dots pointer-events-none absolute inset-0" />
        );
    }

    return (
        <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0">
            <DitherLight
                progress={lit ? LIT_PROGRESS : IDLE_PROGRESS}
                light={light}
                cell={9}
            />
        </div>
    );
}
