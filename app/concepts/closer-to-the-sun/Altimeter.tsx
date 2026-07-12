"use client";

import { useEffect, useRef } from "react";
import { palette } from "../_shared/tokens";

/**
 * Diegetic scroll progress: a fixed altimeter on the right edge. Altitude
 * climbs as you scroll (down is up today). Direct DOM writes from one
 * rAF-throttled scroll handler; nothing re-renders. Hidden below lg.
 */

const CEILING_METERS = 8848;
/** Fraction of scroll spent climbing in meters; past this it's just "close". */
const METER_ZONE = 0.86;

const TICK_COUNT = 25;

export default function Altimeter() {
    const readoutRef = useRef<HTMLSpanElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const needleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let raf = 0;

        function update() {
            raf = 0;
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

            if (readoutRef.current) {
                readoutRef.current.textContent =
                    p < METER_ZONE
                        ? `${Math.round((p / METER_ZONE) * CEILING_METERS).toLocaleString("en-US")} m`
                        : "sun: close";
            }
            if (needleRef.current && railRef.current) {
                const h = railRef.current.clientHeight;
                needleRef.current.style.transform = `translate3d(0, ${(p * h).toFixed(1)}px, 0)`;
            }
        }

        function onScroll() {
            if (!raf) raf = requestAnimationFrame(update);
        }

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            if (raf) cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return (
        <div
            aria-hidden
            className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
        >
            <div className="flex flex-col items-end">
                <span className="callsign" style={{ color: palette.dim, fontSize: 10 }}>
                    alt
                </span>
                <span
                    ref={readoutRef}
                    className="font-mono text-[13px] tabular-nums"
                    style={{ color: palette.fg }}
                >
                    0 m
                </span>
            </div>

            <div ref={railRef} className="relative h-[44vh] w-px" style={{ background: "rgba(255,255,255,0.12)" }}>
                {Array.from({ length: TICK_COUNT }, (_, i) => (
                    <span
                        key={i}
                        className="absolute right-0 h-px"
                        style={{
                            top: `${(i / (TICK_COUNT - 1)) * 100}%`,
                            width: i % 4 === 0 ? 10 : 5,
                            background: "rgba(255,255,255,0.16)",
                        }}
                    />
                ))}

                <div
                    ref={needleRef}
                    className="absolute -left-[5.5px] -top-[1.5px]"
                    style={{ willChange: "transform" }}
                >
                    <span
                        className="block h-[3px] w-3 rounded-full"
                        style={{ background: palette.violet, boxShadow: `0 0 8px ${palette.violet}88` }}
                    />
                </div>
            </div>
        </div>
    );
}
