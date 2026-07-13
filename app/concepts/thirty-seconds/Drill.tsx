"use client";

import {
    RefObject,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

import DitherFire from "../_shared/DitherFire";
import { easing, palette, penColors } from "../_shared/tokens";
import { useDragTilt } from "../_shared/useDragTilt";

/**
 * The drill — a tactical timeout you actually play through.
 *
 * Four steps run the whole Icarus loop in miniature: open the board,
 * place your duo, draw the call, share it. The 0:30 clock is theater;
 * the milliseconds are not.
 */

const TIMEOUT_MS = 30_000;
const SHARE_CODE = "ICARUS-B-EXEC-7F2K";
const GRID = 16; // matches .tactical-dots pitch — pucks snap onto the dots
const ENEMY = { fx: 0.62, fy: 0.3 };
const PEN_YELLOW = penColors[3]; // #eab308 — the IGL special

type Frac = { fx: number; fy: number };

type PuckApi = {
    flyTo: (fx: number, fy: number, ms: number) => void;
    isPlaced: () => boolean;
};

type DrawApi = {
    auto: () => void;
};

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setReduced(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return reduced;
}

function fmtPlay(ms: number) {
    const tenths = Math.floor(ms / 100);
    const t = tenths % 10;
    const s = Math.floor(tenths / 10) % 60;
    const m = Math.floor(tenths / 600);
    return `${m}:${String(s).padStart(2, "0")}.${t}`;
}

/* ── Keyed micro-animations ────────────────────────────────────── */

/** One digit that does a tiny odometer roll when it changes. */
function Roll({ char }: { char: string }) {
    return (
        <span style={{ display: "inline-block", overflow: "hidden" }}>
            <span
                key={char}
                className="ts-anim"
                style={{
                    display: "inline-block",
                    animation: `ts-roll 150ms ${easing.outCubic}`,
                }}
            >
                {char}
            </span>
        </span>
    );
}

function FlipWord({ word, color }: { word: string; color: string }) {
    return (
        <span
            className="callsign"
            style={{ display: "inline-block", overflow: "hidden", color }}
        >
            <span
                key={word}
                className="ts-anim"
                style={{
                    display: "inline-block",
                    animation: `ts-roll 200ms ${easing.outCubic}`,
                }}
            >
                {word}
            </span>
        </span>
    );
}

/* ── Ally puck (drag, snap, keyboard fallback) ─────────────────── */

type AllyPuckProps = {
    id: string;
    initials: string;
    name: string;
    anchor: Frac;
    mapRef: RefObject<HTMLDivElement | null>;
    interactive: boolean;
    reduced: boolean;
    register: (id: string, api: PuckApi) => void;
    onPlaced: (id: string, at: Frac) => void;
};

function AllyPuck({
    id,
    initials,
    name,
    anchor,
    mapRef,
    interactive,
    reduced,
    register,
    onPlaced,
}: AllyPuckProps) {
    const placedRef = useRef(false);
    const [placedLabel, setPlacedLabel] = useState(false);
    const lastSnapRef = useRef<Frac | null>(null);
    const correctionRef = useRef({ x: 0, y: 0 });
    const flyTimer = useRef(0);

    const { ref, isDragging } = useDragTilt<HTMLButtonElement>({
        settle: "stay",
        onDragEnd: ({ x, y }) => {
            const el = ref.current;
            const map = mapRef.current;
            if (!el || !map) return;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const m = map.getBoundingClientRect();
            const pad = 22;
            const inside =
                cx > m.left + pad &&
                cx < m.right - pad &&
                cy > m.top + pad &&
                cy < m.bottom - pad;

            if (inside) {
                // Snap onto the same 16px lattice as the dot grid.
                const gx = m.left + Math.round((cx - m.left) / GRID) * GRID;
                const gy = m.top + Math.round((cy - m.top) / GRID) * GRID;
                setCorrection(
                    correctionRef.current.x + gx - cx,
                    correctionRef.current.y + gy - cy,
                );
                const at = { fx: (gx - m.left) / m.width, fy: (gy - m.top) / m.height };
                lastSnapRef.current = at;
                if (!placedRef.current) {
                    placedRef.current = true;
                    setPlacedLabel(true);
                    onPlaced(id, at);
                }
            } else if (placedRef.current && lastSnapRef.current) {
                // Already on site: dropped in the void, walk back to the last snap.
                const s = lastSnapRef.current;
                const sx = m.left + s.fx * m.width;
                const sy = m.top + s.fy * m.height;
                setCorrection(
                    correctionRef.current.x + sx - cx,
                    correctionRef.current.y + sy - cy,
                );
            } else {
                // Never placed: glide back to the tray slot.
                setCorrection(-x, -y);
            }
        },
    });

    function setCorrection(nx: number, ny: number, ms = reduced ? 0 : 150) {
        const el = ref.current;
        if (!el) return;
        correctionRef.current = { x: nx, y: ny };
        el.style.transition = ms
            ? `left ${ms}ms ${easing.outCubic}, top ${ms}ms ${easing.outCubic}`
            : "none";
        el.style.left = `${nx.toFixed(1)}px`;
        el.style.top = `${ny.toFixed(1)}px`;
    }

    function flyTo(fx: number, fy: number, ms: number) {
        const el = ref.current;
        const map = mapRef.current;
        if (!el || !map) return;
        const r = el.getBoundingClientRect();
        const m = map.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const tx = m.left + fx * m.width;
        const ty = m.top + fy * m.height;
        const duration = reduced ? 0 : ms;
        setCorrection(
            correctionRef.current.x + tx - cx,
            correctionRef.current.y + ty - cy,
            duration,
        );
        lastSnapRef.current = { fx, fy };
        if (!placedRef.current) {
            placedRef.current = true;
            setPlacedLabel(true);
            window.clearTimeout(flyTimer.current);
            flyTimer.current = window.setTimeout(
                () => onPlaced(id, { fx, fy }),
                duration,
            );
        }
    }

    useEffect(() => {
        register(id, { flyTo, isPlaced: () => placedRef.current });
    });

    useEffect(() => () => window.clearTimeout(flyTimer.current), []);

    return (
        <button
            ref={ref}
            type="button"
            aria-label={
                placedLabel
                    ? `${name} — placed on site`
                    : `${name} — drag onto the site, or press Enter to place`
            }
            title={name}
            onClick={(e) => {
                // Keyboard "click" (detail 0): place without a pointer.
                if (e.detail === 0 && !placedRef.current) {
                    flyTo(anchor.fx, anchor.fy, 320);
                }
            }}
            className="font-mono"
            style={{
                position: "relative",
                left: 0,
                top: 0,
                zIndex: 5,
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                background: palette.allyGreen,
                color: "#dcfce7",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                boxShadow: `0 0 0 2px ${palette.allyOutline}, 0 0 14px rgba(105, 240, 175, 0.22)`,
                cursor: isDragging ? "grabbing" : "grab",
                pointerEvents: interactive ? "auto" : "none",
                touchAction: "none",
            }}
        >
            {initials}
        </button>
    );
}

/* ── Draw layer (freehand dashed arrow) ────────────────────────── */

type DrawLayerProps = {
    active: boolean;
    reduced: boolean;
    register: (api: DrawApi) => void;
    onComplete: () => void;
    onTooShort: () => void;
};

function DrawLayer({ active, reduced, register, onComplete, onTooShort }: DrawLayerProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const ptsRef = useRef<Array<{ x: number; y: number }>>([]);
    const lenRef = useRef(0);
    const drawingRef = useRef(false);
    const doneRef = useRef(false);
    const [doneStyle, setDoneStyle] = useState(false);
    const autoTimer = useRef(0);

    function toLocal(e: React.PointerEvent) {
        const r = svgRef.current!.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function buildPath(pts: Array<{ x: number; y: number }>) {
        if (pts.length < 2) return "";
        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 1; i < pts.length - 1; i += 1) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
        }
        const last = pts[pts.length - 1];
        d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
        return d;
    }

    function onPointerDown(e: React.PointerEvent) {
        if (doneRef.current || e.button !== 0) return;
        e.preventDefault();
        svgRef.current?.setPointerCapture(e.pointerId);
        drawingRef.current = true;
        lenRef.current = 0;
        ptsRef.current = [toLocal(e)];
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!drawingRef.current) return;
        const p = toLocal(e);
        const pts = ptsRef.current;
        const last = pts[pts.length - 1];
        const dist = Math.hypot(p.x - last.x, p.y - last.y);
        if (dist < 6) return; // min-distance smoothing
        lenRef.current += dist;
        pts.push(p);
        pathRef.current?.setAttribute("d", buildPath(pts));
    }

    function onPointerUp() {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        if (lenRef.current > 60) {
            doneRef.current = true;
            setDoneStyle(true);
            onComplete();
        } else {
            pathRef.current?.setAttribute("d", "");
            ptsRef.current = [];
            onTooShort();
        }
    }

    useEffect(() => {
        register({
            auto: () => {
                const svg = svgRef.current;
                const path = pathRef.current;
                if (!svg || !path || doneRef.current) return;
                doneRef.current = true;
                setDoneStyle(true);
                const r = svg.getBoundingClientRect();
                const route: Array<[number, number]> = [
                    [0.1, 0.84],
                    [0.26, 0.72],
                    [0.38, 0.7],
                    [0.48, 0.55],
                    [0.56, 0.42],
                ];
                const pts = route.map(([fx, fy]) => ({ x: fx * r.width, y: fy * r.height }));
                path.setAttribute("d", buildPath(pts));
                if (reduced) {
                    onComplete();
                    return;
                }
                // Reveal along the stroke, then hand back the dashed pen style.
                const total = path.getTotalLength();
                path.style.strokeDasharray = `${total}`;
                path.style.strokeDashoffset = `${total}`;
                path.style.markerEnd = "none";
                // Force layout so the transition starts from the hidden state.
                path.getBoundingClientRect();
                path.style.transition = `stroke-dashoffset 650ms ${easing.outQuart}`;
                path.style.strokeDashoffset = "0";
                autoTimer.current = window.setTimeout(() => {
                    path.style.transition = "none";
                    path.style.strokeDasharray = "";
                    path.style.strokeDashoffset = "";
                    path.style.markerEnd = "";
                    onComplete();
                }, 680);
            },
        });
    });

    useEffect(() => () => window.clearTimeout(autoTimer.current), []);

    return (
        <svg
            ref={svgRef}
            role="img"
            aria-label="Drawing surface — drag once across the board to draw the call"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: active && !doneStyle ? "auto" : "none",
                cursor: active && !doneStyle ? "crosshair" : "default",
                touchAction: "none",
                zIndex: 3,
            }}
        >
            <defs>
                <marker
                    id="ts-arrowhead"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={PEN_YELLOW} />
                </marker>
            </defs>
            <path
                ref={pathRef}
                d=""
                fill="none"
                stroke={PEN_YELLOW}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10 8"
                markerEnd="url(#ts-arrowhead)"
            />
        </svg>
    );
}

/* ── Map sketch (approximate B site) ───────────────────────────── */

const BRONZE = "rgba(178, 124, 64, 0.55)";
const BRONZE_DIM = "rgba(178, 124, 64, 0.3)";
const BRONZE_FILL = "rgba(178, 124, 64, 0.07)";

function MapSketch() {
    return (
        <>
            <svg
                aria-hidden
                viewBox="0 0 100 58"
                preserveAspectRatio="none"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
                {/* Site perimeter */}
                <path
                    d="M 50 6 L 94 6 L 94 42 L 72 42 L 72 32 L 50 32 Z"
                    fill={BRONZE_FILL}
                    stroke={BRONZE}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                />
                {/* Crates on site */}
                <rect x="58" y="11" width="8" height="8" fill={BRONZE_FILL} stroke={BRONZE_DIM} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <rect x="78" y="24" width="7" height="7" fill={BRONZE_FILL} stroke={BRONZE_DIM} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <rect x="66" y="20" width="5" height="5" fill={BRONZE_FILL} stroke={BRONZE_DIM} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                {/* Main — the lane your duo walks */}
                <path
                    d="M 4 52 L 30 52 L 30 38 L 50 38"
                    fill="none"
                    stroke={BRONZE_DIM}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M 4 44 L 24 44 L 24 32 L 44 32"
                    fill="none"
                    stroke={BRONZE_DIM}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                />
                {/* Spawn barrier — the app's dashed style */}
                <line
                    x1="8"
                    y1="44"
                    x2="8"
                    y2="52"
                    stroke="rgba(250, 250, 250, 0.35)"
                    strokeWidth={1.5}
                    strokeDasharray="2.5 2"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            {/* Site letter as HTML so the aspect stretch never warps it */}
            <span
                aria-hidden
                className="font-mono"
                style={{
                    position: "absolute",
                    right: "10%",
                    top: "16%",
                    fontSize: "clamp(48px, 9vw, 84px)",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "rgba(240, 130, 52, 0.12)",
                    userSelect: "none",
                }}
            >
                B
            </span>
            <span
                aria-hidden
                className="callsign"
                style={{
                    position: "absolute",
                    right: 12,
                    bottom: 8,
                    fontSize: 10,
                    color: "#52525b",
                }}
            >
                not to scale. the real maps are.
            </span>
        </>
    );
}

/* ── Step list ─────────────────────────────────────────────────── */

type StepRow = {
    n: string;
    title: string;
    hint: string;
    caption: string;
    done: boolean;
    current: boolean;
};

function StepList({ steps }: { steps: StepRow[] }) {
    return (
        <ol className="flex flex-col gap-5" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {steps.map((s) => (
                <li key={s.n} className="flex gap-3">
                    <span
                        aria-hidden
                        style={{
                            flexShrink: 0,
                            width: 20,
                            height: 20,
                            marginTop: 1,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: s.done ? "none" : `1px solid ${s.current ? palette.violet : "#3f3f46"}`,
                            background: s.done ? palette.violet : "transparent",
                            transition: `background 150ms ${easing.outCubic}`,
                        }}
                    >
                        {s.done && (
                            <FiCheck
                                key="check"
                                size={12}
                                color="#fafafa"
                                strokeWidth={3.5}
                                className="ts-anim"
                                style={{ animation: `ts-stamp 150ms ${easing.outCubic}` }}
                            />
                        )}
                    </span>
                    <div style={{ minWidth: 0 }}>
                        <div
                            className="callsign"
                            style={{
                                color: s.done ? palette.dim : s.current ? palette.lavender : palette.dim,
                            }}
                        >
                            Step {s.n}
                        </div>
                        <div
                            className="mt-0.5 text-[15px] font-medium"
                            style={{ color: s.done || s.current ? palette.fg : palette.dim }}
                        >
                            {s.title}
                        </div>
                        {s.current && !s.done && (
                            <p
                                key="hint"
                                className="ts-anim mt-1 text-[13px] leading-[1.55]"
                                style={{ color: palette.muted, animation: `ts-fade 200ms ${easing.outCubic}` }}
                            >
                                {s.hint}
                            </p>
                        )}
                        {s.done && (
                            <p
                                key="caption"
                                className="ts-anim mt-1 text-[13px] leading-[1.55]"
                                style={{ color: palette.muted, animation: `ts-fade 250ms ${easing.outCubic}` }}
                            >
                                {s.caption}
                            </p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}

/* ── The drill run (everything resettable lives here) ──────────── */

function DrillRun({ onRunBack }: { onRunBack: () => void }) {
    const reduced = usePrefersReducedMotion();

    const [started, setStarted] = useState(false);
    const [openMs, setOpenMs] = useState<number | null>(null);
    const [placed, setPlaced] = useState(0);
    const [drawn, setDrawn] = useState(false);
    const [shared, setShared] = useState(false);
    const [expired, setExpired] = useState(false);
    const [finalMs, setFinalMs] = useState<number | null>(null);
    const [say, setSay] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [burst, setBurst] = useState(0);
    const [autoplay, setAutoplay] = useState(false);
    const [secDigits, setSecDigits] = useState("30");

    const stateRef = useRef({ started, placed, drawn, shared });
    useEffect(() => {
        stateRef.current = { started, placed, drawn, shared };
    });

    const startAtRef = useRef(0);
    const clockWrapRef = useRef<HTMLDivElement>(null);
    const tenthsRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const lastSecRef = useRef(30);

    const mapRef = useRef<HTMLDivElement>(null);
    const enemyRef = useRef<HTMLDivElement>(null);
    const dodgedRef = useRef(false);
    const placedCountRef = useRef(0);

    const puckApis = useRef<Record<string, PuckApi>>({});
    const drawApi = useRef<DrawApi | null>(null);
    const timers = useRef<number[]>([]);

    const finished = shared;

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((t) => window.clearTimeout(t));
    }, []);

    /* Clock loop — wall-clock accurate, pauses offscreen. */
    useEffect(() => {
        if (!started || finished || expired) return;
        const wrap = clockWrapRef.current;
        if (!wrap) return;

        let raf = 0;
        let visible = true;

        function tick() {
            raf = 0;
            const remaining = Math.max(0, TIMEOUT_MS - (performance.now() - startAtRef.current));
            const s = Math.floor(remaining / 1000);
            const tenth = Math.floor((remaining % 1000) / 100);
            if (tenthsRef.current) tenthsRef.current.textContent = String(tenth);
            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${(remaining / TIMEOUT_MS).toFixed(4)})`;
            }
            if (s !== lastSecRef.current) {
                lastSecRef.current = s;
                setSecDigits(String(s).padStart(2, "0"));
            }
            if (remaining <= 0) {
                setExpired(true);
                return;
            }
            if (visible) raf = requestAnimationFrame(tick);
        }

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !raf) raf = requestAnimationFrame(tick);
            else if (!visible && raf) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        });
        io.observe(wrap);
        raf = requestAnimationFrame(tick);

        return () => {
            io.disconnect();
            if (raf) cancelAnimationFrame(raf);
        };
    }, [started, finished, expired]);

    function later(ms: number, fn: () => void) {
        timers.current.push(window.setTimeout(fn, ms));
    }

    function openBoard() {
        if (stateRef.current.started) return;
        const t0 = performance.now();
        startAtRef.current = t0;
        setStarted(true);
        setSay("clock's running.");
        // Measure to the next frame — the honest number, not a vibe.
        requestAnimationFrame(() =>
            setOpenMs(Math.max(1, Math.round(performance.now() - t0))),
        );
    }

    function handlePlaced(id: string, at: Frac) {
        placedCountRef.current += 1;
        setPlaced(placedCountRef.current);
        setSay(placedCountRef.current === 1 ? "one on site." : "nice spacing. crisp.");

        // The lurker sidesteps — once, 120ms, no loop.
        const map = mapRef.current;
        const enemy = enemyRef.current;
        if (map && enemy && !dodgedRef.current) {
            const m = map.getBoundingClientRect();
            const dx = (at.fx - ENEMY.fx) * m.width;
            const dy = (at.fy - ENEMY.fy) * m.height;
            const dist = Math.hypot(dx, dy);
            if (dist < 80) {
                dodgedRef.current = true;
                const ux = dist > 0 ? -dx / dist : 1;
                const uy = dist > 0 ? -dy / dist : 0;
                enemy.style.transition = reduced ? "none" : `transform 120ms ${easing.outCubic}`;
                enemy.style.transform = `translate(-50%, -50%) translate(${(ux * 16).toFixed(1)}px, ${(uy * 16).toFixed(1)}px)`;
                setSay("the lurker scooted. he knows.");
            }
        }
    }

    function handleDrawn() {
        setDrawn(true);
        setSay("good route. they're watching mid, not you.");
    }

    function doShare() {
        if (!stateRef.current.drawn || stateRef.current.shared) return;
        const elapsed = performance.now() - startAtRef.current;
        setFinalMs(elapsed);
        setShared(true);
        setSay("sent. your five already see it.");
        setBurst(1);
        later(900, () => setBurst(0));
    }

    function watchInstead() {
        if (autoplay || stateRef.current.shared) return;
        setAutoplay(true);
        let delay = 0;
        if (!stateRef.current.started) {
            openBoard();
            delay = 700;
        }
        const jett = puckApis.current["jett"];
        const omen = puckApis.current["omen"];
        if (jett && !jett.isPlaced()) {
            later(delay, () => jett.flyTo(0.54, 0.42, 480));
            delay += 900;
        }
        if (omen && !omen.isPlaced()) {
            later(delay, () => omen.flyTo(0.7, 0.56, 480));
            delay += 900;
        }
        if (!stateRef.current.drawn) {
            later(delay, () => drawApi.current?.auto());
            delay += 1000;
        }
        later(delay, () => doShare());
        later(delay + 300, () => setAutoplay(false));
    }

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(SHARE_CODE);
            setCopied(true);
            later(1600, () => setCopied(false));
        } catch {
            // Clipboard denied — the chip is selectable, no drama.
        }
    }

    const steps: StepRow[] = useMemo(
        () => [
            {
                n: "01",
                title: "Open the board",
                hint: "One button between you and the board.",
                caption:
                    openMs !== null
                        ? `Opened in ${openMs}ms. That was the point — the real app holds the same line. Open, click, draw. No menus in the way.`
                        : "",
                done: started,
                current: !started,
            },
            {
                n: "02",
                title: "Place your duo",
                hint: "Drag both onto the site. They snap to the grid. (Enter works too.)",
                caption:
                    "Ally markers glow green, enemies red — every agent, every map. Theirs don't get a vote.",
                done: placed >= 2,
                current: started && placed < 2,
            },
            {
                n: "03",
                title: "Draw the call",
                hint: "Click and drag once across the board. Anything with intent counts.",
                caption:
                    "The real pen: five colors, three weights (3/5/8px), dashes, arrowheads. This was yellow, medium, dashed — the IGL special.",
                done: drawn,
                current: placed >= 2 && !drawn,
            },
            {
                n: "04",
                title: "Share it",
                hint: "Mint the code. Hand off the play.",
                caption:
                    "Real shares work exactly like this — a code, a link, no account. Your duo pastes it and sees the board.",
                done: shared,
                current: drawn && !shared,
            },
        ],
        [started, openMs, placed, drawn, shared],
    );

    const resultLine = finished
        ? expired
            ? `The play took ${fmtPlay(finalMs ?? 0)}. Past the buzzer — good thing the board doesn't expire.`
            : `The play took ${fmtPlay(finalMs ?? 0)}. The app opens faster.`
        : expired
            ? "ok. imagine you were faster. the drill keeps going."
            : null;

    return (
        <div>
            {/* ── The clock ──────────────────────────────────────── */}
            <div ref={clockWrapRef} className="mx-auto max-w-[420px]">
                <div className="flex items-center justify-between gap-4">
                    <FlipWord
                        word={finished ? "Tactical" : "Timeout"}
                        color={finished ? palette.lavender : palette.dim}
                    />
                    <div
                        className="font-mono"
                        style={{
                            fontSize: 44,
                            fontWeight: 600,
                            lineHeight: 1,
                            letterSpacing: "0.04em",
                            fontVariantNumeric: "tabular-nums",
                            color: expired && !finished ? palette.dim : palette.fg,
                        }}
                    >
                        0:
                        <Roll char={expired ? "0" : secDigits[0]} />
                        <Roll char={expired ? "0" : secDigits[1]} />
                        <span style={{ fontSize: 22, color: palette.dim }}>
                            .<span ref={tenthsRef}>0</span>
                        </span>
                    </div>
                    <span
                        className="callsign flex items-center gap-1.5"
                        style={{ color: palette.dim }}
                    >
                        {started && !finished && !expired && (
                            <span
                                aria-hidden
                                className="ts-anim inline-block h-1.5 w-1.5 rounded-full"
                                style={{
                                    background: palette.lavender,
                                    animation: "ts-blink 1s ease-in-out infinite",
                                }}
                            />
                        )}
                        {finished ? "GG" : started ? "Live" : "Ready"}
                    </span>
                </div>
                <div
                    aria-hidden
                    className="mt-3 h-[2px] w-full overflow-hidden rounded-full"
                    style={{ background: palette.border }}
                >
                    <div
                        ref={barRef}
                        className="h-full w-full origin-left"
                        style={{
                            background: palette.lavender,
                            transform: expired ? "scaleX(0)" : "scaleX(1)",
                        }}
                    />
                </div>
                {resultLine && (
                    <p
                        key={resultLine}
                        className="ts-anim mt-3 text-center font-mono text-[12.5px]"
                        style={{
                            color: finished ? palette.lavender : palette.muted,
                            animation: `ts-fade 250ms ${easing.outCubic}`,
                        }}
                    >
                        {resultLine}{" "}
                        <button
                            type="button"
                            onClick={onRunBack}
                            className="underline underline-offset-4 hover:text-white"
                            style={{ color: palette.muted }}
                        >
                            run it back
                        </button>
                    </p>
                )}
            </div>

            {/* ── Steps + board ──────────────────────────────────── */}
            <div className="mt-10 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                    <StepList steps={steps} />
                    {!finished && (
                        <button
                            type="button"
                            onClick={watchInstead}
                            disabled={autoplay}
                            className="callsign mt-7 underline underline-offset-4 transition-colors hover:text-white disabled:no-underline"
                            style={{
                                color: autoplay ? palette.dim : palette.muted,
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: autoplay ? "default" : "pointer",
                            }}
                        >
                            {autoplay ? "running it for you…" : "no mouse? watch it instead →"}
                        </button>
                    )}
                </div>

                {/* Board panel */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        background: palette.card,
                        border: `1px solid ${palette.border}`,
                        borderRadius: 16,
                    }}
                >
                    {/* Board header */}
                    <div
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{ borderBottom: `1px solid ${palette.border}` }}
                    >
                        <span className="callsign" style={{ color: palette.muted }}>
                            Untitled strat — B execute
                        </span>
                        <span className="callsign hidden sm:inline" style={{ color: palette.dim }}>
                            {placed >= 2 && !drawn
                                ? "Pen — yellow · 5px · dashed"
                                : "Range — B site"}
                        </span>
                    </div>

                    {!started ? (
                        /* Closed board */
                        <div
                            className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center"
                            style={{ minHeight: 340 }}
                        >
                            <span className="callsign" style={{ color: palette.dim }}>
                                Board — closed
                            </span>
                            <button
                                type="button"
                                onClick={openBoard}
                                className="rounded-lg px-6 py-3 text-[15px] font-semibold transition-transform active:scale-[0.98]"
                                style={{ background: palette.violet, color: "#f9fafb" }}
                            >
                                Open board
                            </button>
                            <span className="font-mono text-[12px]" style={{ color: palette.dim }}>
                                opens instantly. we timed it.
                            </span>
                        </div>
                    ) : (
                        <div className="ts-anim" style={{ animation: `ts-fade 200ms ${easing.outCubic}` }}>
                            {/* Map area */}
                            <div
                                ref={mapRef}
                                className="tactical-dots relative"
                                style={{ aspectRatio: "16 / 9", minHeight: 280 }}
                            >
                                <MapSketch />

                                {/* The lurker */}
                                <div
                                    ref={enemyRef}
                                    aria-hidden
                                    className="font-mono"
                                    style={{
                                        position: "absolute",
                                        left: `${ENEMY.fx * 100}%`,
                                        top: `${ENEMY.fy * 100}%`,
                                        transform: "translate(-50%, -50%)",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: palette.enemyRed,
                                        color: "#fecaca",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: "0.06em",
                                        boxShadow: `0 0 0 2px ${palette.enemyOutline}`,
                                        zIndex: 2,
                                    }}
                                >
                                    CY
                                </div>

                                <DrawLayer
                                    active={placed >= 2 && !drawn && !autoplay}
                                    reduced={reduced}
                                    register={(api) => {
                                        drawApi.current = api;
                                    }}
                                    onComplete={handleDrawn}
                                    onTooShort={() => setSay("barely a flick. draw it like you mean it.")}
                                />
                            </div>

                            {/* Tray */}
                            <div
                                className="relative flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                                style={{ borderTop: `1px solid ${palette.border}` }}
                            >
                                {drawn && (
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0"
                                        style={{
                                            opacity: burst > 0 ? 1 : 0,
                                            transition: "opacity 400ms ease",
                                        }}
                                    >
                                        <DitherFire progress={burst} cell={7} speed={1.4} />
                                    </div>
                                )}

                                <div className="relative flex items-center gap-4">
                                    <span className="callsign" style={{ color: palette.dim }}>
                                        Your duo
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {(
                                            [
                                                { id: "jett", initials: "JT", name: "Jett", anchor: { fx: 0.54, fy: 0.42 } },
                                                { id: "omen", initials: "OM", name: "Omen", anchor: { fx: 0.7, fy: 0.56 } },
                                            ] as const
                                        ).map((p) => (
                                            <span
                                                key={p.id}
                                                className="relative inline-block"
                                                style={{ width: 44, height: 44 }}
                                            >
                                                {/* Slot ghost — visible once the puck leaves */}
                                                <span
                                                    aria-hidden
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ border: "1px dashed #3f3f46" }}
                                                />
                                                <AllyPuck
                                                    id={p.id}
                                                    initials={p.initials}
                                                    name={p.name}
                                                    anchor={p.anchor}
                                                    mapRef={mapRef}
                                                    interactive={!autoplay}
                                                    reduced={reduced}
                                                    register={(id, api) => {
                                                        puckApis.current[id] = api;
                                                    }}
                                                    onPlaced={handlePlaced}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative flex items-center gap-3">
                                    {!shared ? (
                                        <button
                                            type="button"
                                            onClick={doShare}
                                            disabled={!drawn}
                                            className="rounded-lg px-4 py-2 text-[13.5px] font-semibold transition-colors"
                                            style={{
                                                background: drawn ? palette.violet : palette.raised,
                                                color: drawn ? "#f9fafb" : palette.dim,
                                                cursor: drawn ? "pointer" : "default",
                                            }}
                                        >
                                            Share
                                        </button>
                                    ) : (
                                        <span
                                            key="chip"
                                            className="ts-anim inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[12.5px]"
                                            style={{
                                                border: `1px solid ${palette.violet}`,
                                                color: palette.lavender,
                                                background: "rgba(124, 58, 237, 0.08)",
                                                animation: `ts-stamp 150ms ${easing.outCubic}`,
                                            }}
                                        >
                                            {SHARE_CODE}
                                            <button
                                                type="button"
                                                onClick={copyCode}
                                                aria-label="Copy share code"
                                                className="inline-flex items-center transition-colors hover:text-white"
                                                style={{
                                                    color: palette.muted,
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Commentary line */}
            <div className="mt-4 min-h-[20px] lg:pl-[300px]" aria-live="polite">
                {say && (
                    <p
                        key={say}
                        className="ts-anim font-mono text-[12px]"
                        style={{ color: palette.muted, animation: `ts-fade 200ms ${easing.outCubic}` }}
                    >
                        <span style={{ color: palette.dim }}>»</span> {say}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ── Public wrapper (holds the reset key) ──────────────────────── */

export default function Drill() {
    const [runId, setRunId] = useState(0);
    return <DrillRun key={runId} onRunBack={() => setRunId((i) => i + 1)} />;
}
