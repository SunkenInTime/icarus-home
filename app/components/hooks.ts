"use client";

import { RefObject, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Magnetic effect — element subtly translates toward the cursor when
 * hovered. Returns a ref to attach. Quiet by default; bump `strength`
 * for more pronounced motion.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.18): RefObject<T | null> {
    const ref = useRef<T>(null);
    const reduce = useReducedMotion();

    useEffect(() => {
        const el = ref.current;
        if (!el || reduce) return;

        let raf = 0;

        function move(e: MouseEvent) {
            const target = el!;
            const rect = target.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * strength;
            const dy = (e.clientY - cy) * strength;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                target.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
            });
        }

        function leave() {
            cancelAnimationFrame(raf);
            const target = el!;
            target.style.transform = "translate3d(0, 0, 0)";
        }

        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
        };
    }, [reduce, strength]);

    return ref;
}

/**
 * Subtle parallax — child element translates a few pixels in response
 * to the cursor moving anywhere over the parent. Returns refs for
 * `parent` (listener) and `child` (transformed). `range` is the
 * maximum pixel translation in either axis.
 */
export function useParallax<P extends HTMLElement, C extends HTMLElement>(
    range = 8
): { parent: RefObject<P | null>; child: RefObject<C | null> } {
    const parent = useRef<P>(null);
    const child = useRef<C>(null);
    const reduce = useReducedMotion();

    useEffect(() => {
        const p = parent.current;
        const c = child.current;
        if (!p || !c || reduce) return;

        let raf = 0;

        function move(e: MouseEvent) {
            const rect = p!.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                c!.style.transform = `translate3d(${(-x * range).toFixed(2)}px, ${(-y * range).toFixed(2)}px, 0)`;
            });
        }

        function leave() {
            cancelAnimationFrame(raf);
            c!.style.transform = "translate3d(0, 0, 0)";
        }

        p.addEventListener("mousemove", move);
        p.addEventListener("mouseleave", leave);
        return () => {
            cancelAnimationFrame(raf);
            p.removeEventListener("mousemove", move);
            p.removeEventListener("mouseleave", leave);
        };
    }, [range, reduce]);

    return { parent, child };
}

/**
 * Cursor-tracked spotlight — exposes CSS variables `--mx` and `--my`
 * (in percent of the element's bounding box) on the attached element.
 * Use them in a radial-gradient background to draw a glow that
 * follows the cursor.
 */
export function useSpotlight<T extends HTMLElement>(): RefObject<T | null> {
    const ref = useRef<T>(null);
    const reduce = useReducedMotion();

    useEffect(() => {
        const el = ref.current;
        if (!el || reduce) return;

        let raf = 0;

        function move(e: MouseEvent) {
            const rect = el!.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el!.style.setProperty("--mx", `${x.toFixed(2)}%`);
                el!.style.setProperty("--my", `${y.toFixed(2)}%`);
            });
        }

        el.addEventListener("mousemove", move);
        // start in a neutral position
        el.style.setProperty("--mx", "50%");
        el.style.setProperty("--my", "30%");
        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener("mousemove", move);
        };
    }, [reduce]);

    return ref;
}
