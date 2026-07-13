"use client";

import { useEffect, useRef } from "react";
import MorphTraveler, { MorphTravelerHandle } from "./MorphTraveler";

/**
 * The fall, drawn: one dashed line down the right-hand gutter of the page,
 * fluttering like something dropped — glide, stall, dive — with a single
 * loop-the-loop on the way. The traveler rides it — morphing per section
 * (see MorphTraveler) and somersaulting through the loop, because the
 * path's heading IS its rotation. The line self-reveals ahead of the
 * traveler as you scroll.
 *
 * Scroll maps to path *length* via a monotonic per-sample scroll parameter
 * (descent advances it 1:1, the loop's non-descending arcs advance it by a
 * fraction of arc length) — a plain y-lookup would skip the loop, since y
 * isn't monotonic through it.
 *
 * All scroll work is rAF-throttled with direct style writes; the loop stops
 * when the velocity tilt settles. Under prefers-reduced-motion the full
 * path renders statically and the traveler rests at the top.
 *
 * The whole flight is a companion to scrolling, not a screen resident: it
 * fades out once scrolling settles and fades back in on the next scroll,
 * and only a short tail of the trail stays lit behind the traveler (a
 * fainter, longer tail under a brighter, shorter one reads as dissolving).
 * On narrow viewports the traveler shrinks, the sway tightens, and the
 * loop-the-loop is skipped so the path stays out of the copy.
 */

const STEP_Y = 10; // fine sampling keeps the traveler glued to the route
const SWAY_AMP = 48;
/** Vertical span of one plunge-and-glide swoop, before the seeded jitter. */
const SWOOP_MIN_H = 240;
const SWOOP_H_JITTER = 220;
/** Sink rate kept through the cross-glide, as a fraction of the plunge. */
const GLIDE_SINK = 0.22;
/** Slow off-centerline wander, like being carried by air. */
const DRIFT_AMP = 18;
const DRIFT_WAVELENGTH = 2800;
/** Resample floor: stall points cluster; merging them keeps the bank calm. */
const MIN_SEG = 6;
const LOOP_RADIUS = 54;
const LOOP_POINTS = 26;
/** Scroll px consumed per px of non-descending path (how fast the loop plays). */
const LOOP_SCROLL_RATE = 0.3;
const MAX_VEL_TILT = 9;
// Reveal only the dot beneath the leading edge: the object draws the route.
const REVEAL_LEAD = 10;
const SIZE = 48;
// Trail tail lengths (path px): bright recent segment over a fainter one.
const TAIL_CORE = 180;
const TAIL_SOFT = 460;
// Idle fade: hide after this much settled time, revive fast on scroll.
const IDLE_FADE_DELAY_MS = 1000;
const MOBILE_MAX_W = 640;

type Sample = { x: number; y: number; bank: number; len: number; sy: number };

function smoothstep(t: number) {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped * clamped * (3 - 2 * clamped);
}

/** Tiny seeded PRNG: the flutter is irregular but stable across rebuilds. */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export default function FlightPath() {
    const svgLayerRef = useRef<HTMLDivElement>(null);
    const travelerLayerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const dashRef = useRef<SVGPathElement>(null);
    const maskCoreRef = useRef<SVGPathElement>(null);
    const maskSoftRef = useRef<SVGPathElement>(null);
    const wingRef = useRef<HTMLDivElement>(null);
    const travelerRef = useRef<MorphTravelerHandle>(null);

    useEffect(() => {
        const svgLayer = svgLayerRef.current;
        const travelerLayer = travelerLayerRef.current;
        const svg = svgRef.current;
        const dash = dashRef.current;
        const maskCore = maskCoreRef.current;
        const maskSoft = maskSoftRef.current;
        const wing = wingRef.current;
        const container = svgLayer?.parentElement;
        if (
            !svgLayer ||
            !travelerLayer ||
            !svg ||
            !dash ||
            !maskCore ||
            !maskSoft ||
            !wing ||
            !container
        )
            return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let samples: Sample[] = [];
        let anchorYs: number[] = [];
        let totalLen = 0;
        let flightEndY = 0;
        let raf = 0;
        let lastScrollY = window.scrollY;
        let vel = 0;
        let tilt = 0;
        let travelerScale = 1;
        let idleTimer = 0;
        let hasScrolled = false;

        function setLayersOpacity(opacity: number, ms: number) {
            for (const el of [svgLayer!, travelerLayer!]) {
                el.style.transition = `opacity ${ms}ms ease`;
                el.style.opacity = `${opacity}`;
            }
        }

        function placeTraveler(s: Sample, tiltDeg: number, targetY: number) {
            // Layer an irregular loose-object roll over the true path heading.
            // The loop's heading still supplies its complete somersault.
            const tumble = Math.sin(s.len / 78) * 11 + Math.sin(s.len / 31 + 0.8) * 4;
            const landing = smoothstep((targetY - (flightEndY - 320)) / 320);
            const rotation = (s.bank + tumble + tiltDeg) * (1 - landing);
            wing!.style.transform =
                `translate3d(${(s.x - SIZE / 2).toFixed(1)}px, ${(s.y - SIZE / 2).toFixed(1)}px, 0) ` +
                `rotate(${rotation.toFixed(2)}deg) scale(${travelerScale})`;

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
            // Each tail's dash is [tail, totalLen]; this offset parks the lit
            // segment so it ends at the reveal point and dissolves behind it.
            maskCore!.style.strokeDashoffset = `${(TAIL_CORE - reveal).toFixed(1)}`;
            maskSoft!.style.strokeDashoffset = `${(TAIL_SOFT - reveal).toFixed(1)}`;

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
                // Parked: after a beat, bow out until the next scroll — but
                // never at the sun, where the landed mark is part of the
                // section (SunSection's wordmark pairs with it).
                if (hasScrolled && targetY < flightEndY - 320) {
                    window.clearTimeout(idleTimer);
                    idleTimer = window.setTimeout(
                        () => setLayersOpacity(0, 700),
                        IDLE_FADE_DELAY_MS,
                    );
                }
            }
        }

        function kick() {
            if (!raf) raf = requestAnimationFrame(frame);
        }

        function scrollKick() {
            hasScrolled = true;
            window.clearTimeout(idleTimer);
            setLayersOpacity(1, 180);
            kick();
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
            const anchorPoints = anchors
                .map((a) => {
                    const r = a.getBoundingClientRect();
                    return {
                        x: r.left - rect.left + r.width / 2,
                        y: r.top - rect.top + r.height / 2,
                    };
                })
                .sort((a, b) => a.y - b.y);
            anchorYs = anchorPoints.map((point) => point.y);
            if (anchorYs.length < 2) return;

            const yStart = anchorYs[0];
            const yEnd = anchorYs[anchorYs.length - 1];
            const landingX = anchorPoints[anchorPoints.length - 1].x;
            flightEndY = yEnd;
            const gutterX = w - Math.min(180, Math.max(96, w * 0.12));

            // On narrow viewports the gutter is thin and copy runs close to
            // the edge: shrink the traveler, tighten the sway, skip the loop.
            const isMobile = w < MOBILE_MAX_W;
            travelerScale = isMobile ? 0.66 : 1;
            const swayAmp = isMobile ? SWAY_AMP / 2 : SWAY_AMP;

            // The falling line, as flutter rather than metronome: a dropped
            // thing doesn't ride a sine — each swing starts with a steep
            // plunge out of the stall, flattens into a cross-glide to the
            // far side, tips over, and plunges again. Swoops get seeded
            // irregular depths and reaches (with the occasional collapsed,
            // near-vertical one), and the whole fall wanders slowly off its
            // centerline like something carried by air.
            const rand = mulberry32(22);
            const drift = (y: number) =>
                DRIFT_AMP *
                (isMobile ? 0.4 : 1) *
                Math.sin(((y - yStart) * Math.PI * 2) / DRIFT_WAVELENGTH + 1.9);

            const raw: { x: number; y: number }[] = [];
            let side = rand() < 0.5 ? -1 : 1;
            let px = gutterX + drift(yStart) + side * swayAmp * 0.8;
            let py = yStart;
            raw.push({ x: px, y: py });
            while (py < yEnd) {
                const h = (isMobile ? 0.75 : 1) * (SWOOP_MIN_H + SWOOP_H_JITTER * rand());
                side = -side;
                // Every so often the swing collapses into a straight drop.
                const reach = rand() < 0.2 ? 0.25 : 0.8 + 0.7 * rand();
                const xTo = gutterX + drift(py + h) + side * swayAmp * reach;
                const x0 = px;
                const steps = Math.max(10, Math.round(h / STEP_Y));
                for (let k = 1; k <= steps; k += 1) {
                    const t = k / steps;
                    // Fall is front-loaded (the plunge out of the stall),
                    // reach is back-loaded (the flattening cross-glide).
                    const u = smoothstep(t);
                    const fall =
                        (1 - GLIDE_SINK) * (1 - Math.pow(1 - t, 2.2)) + GLIDE_SINK * t;
                    raw.push({
                        x: x0 + (xTo - x0) * u * u,
                        y: py + h * fall,
                    });
                }
                px = xTo;
                py += h;
            }

            // Bleed the flutter off into the touchdown point, drop the
            // overshoot past it, and resample: points cluster in the stalls,
            // and near-duplicates would jitter the heading-derived bank.
            const pts: { x: number; y: number }[] = [raw[0]];
            for (const p of raw.slice(1)) {
                if (p.y >= yEnd) break;
                const landing = smoothstep((p.y - (yEnd - 520)) / 520);
                const q = { x: p.x + (landingX - p.x) * landing, y: p.y };
                const prev = pts[pts.length - 1];
                if (Math.hypot(q.x - prev.x, q.y - prev.y) >= MIN_SEG) pts.push(q);
            }
            pts.push({ x: landingX, y: yEnd });

            if (!isMobile) {
                // One loop-the-loop, early in the fall — entered on the
                // current heading mid-dive rather than bolted on, climbing
                // up and over, slightly egg-shaped: tighter across the top,
                // the way speed bleeds off in a real loop.
                const loopY =
                    anchorYs.length > 2
                        ? (anchorYs[1] + anchorYs[2]) / 2
                        : (yStart + yEnd) / 2;
                let li = 1;
                for (let i = 2; i < pts.length - 2; i += 1) {
                    if (Math.abs(pts[i].y - loopY) < Math.abs(pts[li].y - loopY)) li = i;
                }
                const entry = pts[li];
                const vx = entry.x - pts[li - 1].x;
                const vy = entry.y - pts[li - 1].y;
                const vm = Math.hypot(vx, vy) || 1;
                // The center sits on the upward perpendicular of the dive.
                let nx = -vy / vm;
                let ny = vx / vm;
                if (ny > 0) {
                    nx = -nx;
                    ny = -ny;
                }
                const cx = entry.x + LOOP_RADIUS * nx;
                const cy = entry.y + LOOP_RADIUS * ny;
                const psi0 = Math.atan2(entry.y - cy, entry.x - cx);
                // Traverse whichever way leaves the entry along the heading.
                const dir = -Math.sin(psi0) * vx + Math.cos(psi0) * vy > 0 ? 1 : -1;
                const loopPts: { x: number; y: number }[] = [];
                for (let k = 1; k <= LOOP_POINTS; k += 1) {
                    const rel = (Math.PI * 2 * k) / LOOP_POINTS;
                    const psi = psi0 + dir * rel;
                    const r = LOOP_RADIUS * (1 - 0.08 * (1 - Math.cos(rel)));
                    loopPts.push({
                        x: cx + r * Math.cos(psi),
                        y: cy + r * Math.sin(psi),
                    });
                }
                pts.splice(li + 1, 0, ...loopPts);
            }

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
            maskCore!.setAttribute("d", d);
            maskSoft!.setAttribute("d", d);

            totalLen = dash!.getTotalLength();
            // One lit dash of tail length; the rest of the pattern is dark.
            // Start with the dash parked entirely before the path (offset =
            // tail, reveal = 0) so nothing flashes before the first frame.
            maskCore!.style.strokeDasharray = `${TAIL_CORE} ${totalLen}`;
            maskCore!.style.strokeDashoffset = `${TAIL_CORE}`;
            maskSoft!.style.strokeDasharray = `${TAIL_SOFT} ${totalLen}`;
            maskSoft!.style.strokeDashoffset = `${TAIL_SOFT}`;

            if (reduceMotion) {
                maskCore!.style.strokeDasharray = "none";
                maskCore!.style.strokeDashoffset = "0";
                placeTraveler(samples[0], 0, yStart);
            } else {
                kick();
            }
        }

        build();
        const resizeObserver = new ResizeObserver(() => build());
        resizeObserver.observe(container);

        if (!reduceMotion) {
            window.addEventListener("scroll", scrollKick, { passive: true });
        }

        return () => {
            if (raf) cancelAnimationFrame(raf);
            window.clearTimeout(idleTimer);
            resizeObserver.disconnect();
            window.removeEventListener("scroll", scrollKick);
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
                            {/* Faint long tail under a bright short one: the
                                trail dissolves behind the traveler instead of
                                accumulating down the whole page. */}
                            <path
                                ref={maskSoftRef}
                                fill="none"
                                stroke="#555555"
                                strokeWidth={14}
                                strokeLinecap="round"
                            />
                            <path
                                ref={maskCoreRef}
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
            <div
                ref={travelerLayerRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
            >
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
