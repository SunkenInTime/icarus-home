"use client";

import { useEffect, useRef } from "react";
import MorphTraveler, { MorphTravelerHandle } from "./MorphTraveler";

/**
 * The fall, drawn: one dashed line down the right-hand gutter of the page,
 * swaying like something dropped, with a single loop-the-loop on the way.
 * The traveler rides it — morphing per section (see MorphTraveler) and
 * somersaulting through the loop, because the path's heading IS its
 * rotation. The line self-reveals ahead of the traveler as you scroll.
 *
 * Scroll maps to path *length* via a monotonic per-sample scroll parameter
 * (descent advances it 1:1, the loop's non-descending arcs advance it by a
 * fraction of arc length) — a plain y-lookup would skip the loop, since y
 * isn't monotonic through it.
 *
 * All scroll work is rAF-throttled with direct style writes; the loop stops
 * when the velocity tilt settles. Under prefers-reduced-motion the full
 * path renders statically and the traveler rests at the top.
 */

const STEP_Y = 10; // fine sampling keeps the traveler glued to the route
const SWAY_AMP = 42;
const SWAY_WAVELENGTH = 520;
const LOOP_RADIUS = 54;
const LOOP_POINTS = 26;
/** Scroll px consumed per px of non-descending path (how fast the loop plays). */
const LOOP_SCROLL_RATE = 0.3;
const MAX_VEL_TILT = 9;
// Reveal only the dot beneath the leading edge: the object draws the route.
const REVEAL_LEAD = 10;
const SIZE = 48;

type Sample = { x: number; y: number; bank: number; len: number; sy: number };

export default function FlightPath() {
    const svgLayerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const dashRef = useRef<SVGPathElement>(null);
    const maskRef = useRef<SVGPathElement>(null);
    const wingRef = useRef<HTMLDivElement>(null);
    const travelerRef = useRef<MorphTravelerHandle>(null);

    useEffect(() => {
        const svgLayer = svgLayerRef.current;
        const svg = svgRef.current;
        const dash = dashRef.current;
        const maskPath = maskRef.current;
        const wing = wingRef.current;
        const container = svgLayer?.parentElement;
        if (!svgLayer || !svg || !dash || !maskPath || !wing || !container) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let samples: Sample[] = [];
        let anchorYs: number[] = [];
        let totalLen = 0;
        let raf = 0;
        let lastScrollY = window.scrollY;
        let vel = 0;
        let tilt = 0;

        function placeTraveler(s: Sample, tiltDeg: number, targetY: number) {
            // Layer an irregular loose-object roll over the true path heading.
            // The loop's heading still supplies its complete somersault.
            const tumble = Math.sin(s.len / 78) * 11 + Math.sin(s.len / 31 + 0.8) * 4;
            wing!.style.transform =
                `translate3d(${(s.x - SIZE / 2).toFixed(1)}px, ${(s.y - SIZE / 2).toFixed(1)}px, 0) ` +
                `rotate(${(s.bank + tumble + tiltDeg).toFixed(2)}deg)`;

            // Morph toward the shape of whichever section we're nearest.
            if (anchorYs.length) {
                let nearest = 0;
                for (let i = 1; i < anchorYs.length; i += 1) {
                    if (
                        Math.abs(targetY - anchorYs[i]) <
                        Math.abs(targetY - anchorYs[nearest])
                    ) {
                        nearest = i;
                    }
                }
                travelerRef.current?.setStage(nearest);
            }
        }

        function currentTargetY(): number {
            const containerTop = container!.getBoundingClientRect().top + window.scrollY;
            return window.scrollY + window.innerHeight * 0.42 - containerTop;
        }

        function currentSample(targetY: number): Sample | null {
            if (samples.length === 0) return null;
            // Binary search the monotonic scroll parameter.
            let lo = 0;
            let hi = samples.length - 1;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (samples[mid].sy < targetY) lo = mid + 1;
                else hi = mid;
            }
            if (lo === 0) return samples[0];
            const a = samples[lo - 1];
            const b = samples[lo];
            const span = Math.max(0.001, b.sy - a.sy);
            const t = Math.max(0, Math.min(1, (targetY - a.sy) / span));
            return {
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t,
                bank: a.bank + (b.bank - a.bank) * t,
                len: a.len + (b.len - a.len) * t,
                sy: targetY,
            };
        }

        function frame() {
            raf = 0;
            const targetY = currentTargetY();
            const s = currentSample(targetY);
            if (!s) return;

            const reveal = Math.min(totalLen, s.len + REVEAL_LEAD);
            maskPath!.style.strokeDashoffset = `${Math.max(0, totalLen - reveal).toFixed(1)}`;

            const dy = window.scrollY - lastScrollY;
            lastScrollY = window.scrollY;
            vel += (dy - vel) * 0.2;
            const tiltTarget = Math.max(-MAX_VEL_TILT, Math.min(MAX_VEL_TILT, vel * 0.12));
            tilt += (tiltTarget - tilt) * 0.16;

            placeTraveler(s, tilt, targetY);

            // Keep animating until the tilt has settled, then park.
            if (Math.abs(vel) > 0.08 || Math.abs(tilt) > 0.08) {
                raf = requestAnimationFrame(frame);
            } else {
                tilt = 0;
                placeTraveler(s, 0, targetY);
            }
        }

        function kick() {
            if (!raf) raf = requestAnimationFrame(frame);
        }

        function build() {
            const rect = container!.getBoundingClientRect();
            const w = Math.max(1, container!.clientWidth);
            const h = Math.max(1, container!.scrollHeight);
            svg!.setAttribute("width", `${w}`);
            svg!.setAttribute("height", `${h}`);

            const anchors = Array.from(
                container!.querySelectorAll<HTMLElement>("[data-flight-anchor]"),
            );
            anchorYs = anchors
                .map((a) => {
                    const r = a.getBoundingClientRect();
                    return r.top - rect.top + r.height / 2;
                })
                .sort((a, b) => a - b);
            if (anchorYs.length < 2) return;

            const yStart = anchorYs[0];
            const yEnd = anchorYs[anchorYs.length - 1];
            const gutterX = w - Math.min(180, Math.max(96, w * 0.12));

            // The falling line: steady descent with a leaf-like sway.
            const pts: { x: number; y: number }[] = [];
            for (let y = yStart; y < yEnd; y += STEP_Y) {
                pts.push({
                    x:
                        gutterX +
                        SWAY_AMP * Math.sin(((y - yStart) * Math.PI * 2) / SWAY_WAVELENGTH),
                    y,
                });
            }
            pts.push({ x: gutterX, y: yEnd });

            // One loop-the-loop, early in the fall.
            const loopY =
                anchorYs.length > 2 ? (anchorYs[1] + anchorYs[2]) / 2 : (yStart + yEnd) / 2;
            const li = Math.max(
                2,
                Math.min(pts.length - 3, Math.round((loopY - yStart) / STEP_Y)),
            );
            const entry = pts[li];
            const center = { x: entry.x - LOOP_RADIUS, y: entry.y };
            const loopPts: { x: number; y: number }[] = [];
            for (let k = 1; k <= LOOP_POINTS; k += 1) {
                const theta = (-Math.PI * 2 * k) / LOOP_POINTS; // up and over, counterclockwise
                loopPts.push({
                    x: center.x + LOOP_RADIUS * Math.cos(theta),
                    y: center.y + LOOP_RADIUS * Math.sin(theta),
                });
            }
            pts.splice(li + 1, 0, ...loopPts);

            // Samples: cumulative length, heading-as-rotation, and the
            // monotonic scroll parameter.
            samples = [];
            let len = 0;
            let sy = yStart;
            for (let i = 0; i < pts.length; i += 1) {
                if (i > 0) {
                    const dx = pts[i].x - pts[i - 1].x;
                    const dySeg = pts[i].y - pts[i - 1].y;
                    const seg = Math.hypot(dx, dySeg);
                    len += seg;
                    sy += Math.max(dySeg, LOOP_SCROLL_RATE * seg);
                }
                samples.push({ x: pts[i].x, y: pts[i].y, bank: 0, len, sy });
            }
            // Rescale the scroll parameter so the traveler still arrives at
            // the sun exactly when the scroll does.
            const syEnd = samples[samples.length - 1].sy;
            const scale = (yEnd - yStart) / Math.max(1, syEnd - yStart);
            samples.forEach((s) => {
                s.sy = yStart + (s.sy - yStart) * scale;
            });
            for (let i = 0; i < samples.length; i += 1) {
                const a = samples[Math.max(0, i - 1)];
                const b = samples[Math.min(samples.length - 1, i + 1)];
                samples[i].bank = (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;
            }

            const d = pts
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                .join(" ");
            dash!.setAttribute("d", d);
            maskPath!.setAttribute("d", d);

            totalLen = dash!.getTotalLength();
            maskPath!.style.strokeDasharray = `${totalLen}`;
            // Start hidden so the first frame reveals from the traveler, not
            // a flash of the whole route.
            maskPath!.style.strokeDashoffset = `${totalLen}`;

            if (reduceMotion) {
                maskPath!.style.strokeDashoffset = "0";
                placeTraveler(samples[0], 0, yStart);
            } else {
                kick();
            }
        }

        build();
        const resizeObserver = new ResizeObserver(() => build());
        resizeObserver.observe(container);

        if (!reduceMotion) {
            window.addEventListener("scroll", kick, { passive: true });
        }

        return () => {
            if (raf) cancelAnimationFrame(raf);
            resizeObserver.disconnect();
            window.removeEventListener("scroll", kick);
        };
    }, []);

    return (
        <>
            {/* Path layer: behind section content. */}
            <div
                ref={svgLayerRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <svg ref={svgRef} className="absolute left-0 top-0" style={{ overflow: "visible" }}>
                    <defs>
                        <mask id="ctts-flight-reveal" maskUnits="userSpaceOnUse">
                            <path
                                ref={maskRef}
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth={14}
                                strokeLinecap="round"
                            />
                        </mask>
                    </defs>
                    <path
                        ref={dashRef}
                        fill="none"
                        stroke="rgba(250,250,250,0.4)"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray="1 11"
                        mask="url(#ctts-flight-reveal)"
                    />
                </svg>
            </div>

            {/* Traveler layer: above section content — the protagonist. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                <div
                    ref={wingRef}
                    className="absolute left-0 top-0"
                    style={{ willChange: "transform" }}
                >
                    <MorphTraveler ref={travelerRef} size={SIZE} />
                </div>
            </div>
        </>
    );
}
