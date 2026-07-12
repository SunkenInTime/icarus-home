"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { palette, penColors, penSizes, shadow } from "../_shared/tokens";

/**
 * The page's working pen. A fixed full-viewport canvas sits at z-1 — above
 * the dot lattice, below the copy — and the tool dock drives it. Strokes are
 * stored in document coordinates so ink stays where you put it when the page
 * scrolls. No free-running rAF: the canvas only redraws on input, scroll,
 * resize, or during the (bounded) clear sweep.
 */

type Tool = "pen" | "arrow" | "eraser";
type Pt = { x: number; y: number };
type Stroke = {
    color: string;
    size: number;
    dashed: boolean;
    kind: "free" | "arrow";
    points: Pt[];
    yMin: number;
    yMax: number;
};

const MIN_DIST = 3; // the app's freehand smoothing threshold
const ERASE_RADIUS = 15;
const PEN_NAMES = ["white", "red", "blue", "yellow", "green"] as const;

function distToSegment(p: Pt, a: Pt, b: Pt): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export default function DrawingBoard({ enabled }: { enabled: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const readoutRef = useRef<HTMLSpanElement>(null);

    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState<string>(penColors[0]);
    const [size, setSize] = useState<number>(penSizes[1]);
    const [dashed, setDashed] = useState(false);
    const [toast, setToast] = useState(false);

    const strokes = useRef<Stroke[]>([]);
    const settings = useRef({ tool, color, size, dashed });
    useEffect(() => {
        settings.current = { tool, color, size, dashed };
    });

    const engine = useRef<{ undo(): void; clearSweep(): void } | null>(null);
    const toastShown = useRef(false);
    const toastTimer = useRef(0);

    useEffect(() => {
        if (!enabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let dpr = 1;
        let w = 0;
        let h = 0;
        let raf = 0;
        let current: Stroke | null = null;
        let erasing = false;
        let sweep = -1; // -1 idle, 0..1 clearing
        let sweepRaf = 0;

        function drawStroke(s: Stroke) {
            ctx!.strokeStyle = s.color;
            ctx!.lineWidth = s.size;
            ctx!.lineCap = "round";
            ctx!.lineJoin = "round";
            // The app's dashed pen renders as round dots marching along the path.
            ctx!.setLineDash(s.dashed ? [1, s.size * 2.8] : []);

            const pts = s.points;
            if (s.kind === "arrow") {
                const a = pts[0];
                const b = pts[pts.length - 1];
                ctx!.beginPath();
                ctx!.moveTo(a.x, a.y);
                ctx!.lineTo(b.x, b.y);
                ctx!.stroke();
                // Arrowhead is always solid, like the app's.
                ctx!.setLineDash([]);
                const ang = Math.atan2(b.y - a.y, b.x - a.x);
                const hl = 8 + s.size * 2.2;
                ctx!.beginPath();
                ctx!.moveTo(b.x, b.y);
                ctx!.lineTo(b.x - hl * Math.cos(ang - 0.46), b.y - hl * Math.sin(ang - 0.46));
                ctx!.moveTo(b.x, b.y);
                ctx!.lineTo(b.x - hl * Math.cos(ang + 0.46), b.y - hl * Math.sin(ang + 0.46));
                ctx!.stroke();
            } else if (pts.length === 1) {
                ctx!.setLineDash([]);
                ctx!.fillStyle = s.color;
                ctx!.beginPath();
                ctx!.arc(pts[0].x, pts[0].y, s.size * 0.62 + 0.6, 0, Math.PI * 2);
                ctx!.fill();
            } else {
                ctx!.beginPath();
                ctx!.moveTo(pts[0].x, pts[0].y);
                if (pts.length === 2) {
                    ctx!.lineTo(pts[1].x, pts[1].y);
                } else {
                    for (let i = 1; i < pts.length - 1; i++) {
                        const mx = (pts[i].x + pts[i + 1].x) / 2;
                        const my = (pts[i].y + pts[i + 1].y) / 2;
                        ctx!.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
                    }
                    const last = pts[pts.length - 1];
                    ctx!.lineTo(last.x, last.y);
                }
                ctx!.stroke();
            }
        }

        function sweepX(): number {
            const eased = 1 - Math.pow(1 - sweep, 3); // easeOutCubic
            return -40 + (w + 80) * eased;
        }

        function redraw() {
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx!.clearRect(0, 0, w, h);
            const sy = window.scrollY;

            ctx!.save();
            if (sweep >= 0) {
                const sx = sweepX();
                ctx!.beginPath();
                ctx!.rect(sx, 0, w - sx + 60, h);
                ctx!.clip();
            }
            ctx!.translate(0, -sy);
            const list = current ? [...strokes.current, current] : strokes.current;
            for (const s of list) {
                const pad = 60 + s.size;
                if (s.yMax < sy - pad || s.yMin > sy + h + pad) continue;
                drawStroke(s);
            }
            ctx!.restore();

            if (sweep >= 0) {
                const sx = sweepX();
                const grad = ctx!.createLinearGradient(sx - 44, 0, sx, 0);
                grad.addColorStop(0, "rgba(124,58,237,0)");
                grad.addColorStop(1, "rgba(124,58,237,0.30)");
                ctx!.fillStyle = grad;
                ctx!.fillRect(sx - 44, 0, 44, h);
                ctx!.fillStyle = "rgba(196,181,253,0.75)";
                ctx!.fillRect(sx - 1, 0, 1.5, h);
            }
        }

        function schedule() {
            if (!raf) {
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    redraw();
                });
            }
        }

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas!.width = Math.max(1, Math.floor(w * dpr));
            canvas!.height = Math.max(1, Math.floor(h * dpr));
            redraw();
        }

        function docPt(e: PointerEvent): Pt {
            return { x: e.clientX, y: e.clientY + window.scrollY };
        }

        function commit(s: Stroke) {
            strokes.current.push(s);
            if (!toastShown.current) {
                toastShown.current = true;
                setToast(true);
                toastTimer.current = window.setTimeout(() => setToast(false), 3000);
            }
        }

        function eraseAt(p: Pt) {
            const arr = strokes.current;
            let removed = false;
            for (let i = arr.length - 1; i >= 0; i--) {
                const s = arr[i];
                const r = ERASE_RADIUS + s.size / 2;
                if (p.y < s.yMin - r || p.y > s.yMax + r) continue;
                const pts = s.points;
                let hit = pts.length === 1 && Math.hypot(p.x - pts[0].x, p.y - pts[0].y) <= r;
                for (let j = 0; !hit && j < pts.length - 1; j++) {
                    hit = distToSegment(p, pts[j], pts[j + 1]) <= r;
                }
                if (hit) {
                    arr.splice(i, 1);
                    removed = true;
                }
            }
            if (removed) schedule();
        }

        function onPointerDown(e: PointerEvent) {
            if (e.button !== 0) return;
            e.preventDefault();
            canvas!.setPointerCapture(e.pointerId);
            const p = docPt(e);
            const s = settings.current;
            if (s.tool === "eraser") {
                erasing = true;
                eraseAt(p);
                return;
            }
            current = {
                color: s.color,
                size: s.size,
                dashed: s.dashed,
                kind: s.tool === "arrow" ? "arrow" : "free",
                points: [p],
                yMin: p.y,
                yMax: p.y,
            };
            schedule();
        }

        function onPointerMove(e: PointerEvent) {
            if (erasing) {
                eraseAt(docPt(e));
                return;
            }
            if (!current) return;
            const p = docPt(e);
            if (current.kind === "arrow") {
                current.points = [current.points[0], p];
            } else {
                const last = current.points[current.points.length - 1];
                if (Math.hypot(p.x - last.x, p.y - last.y) < MIN_DIST) return;
                current.points.push(p);
            }
            current.yMin = Math.min(current.yMin, p.y);
            current.yMax = Math.max(current.yMax, p.y);
            schedule();
        }

        function onPointerUp() {
            if (erasing) {
                erasing = false;
                return;
            }
            if (!current) return;
            if (current.kind === "arrow") {
                const [a, b] = [current.points[0], current.points[current.points.length - 1]];
                if (current.points.length > 1 && Math.hypot(b.x - a.x, b.y - a.y) > 8) {
                    commit(current);
                }
            } else {
                commit(current);
            }
            current = null;
            schedule();
        }

        function undo() {
            if (strokes.current.length) {
                strokes.current.pop();
                schedule();
            }
        }

        function clearSweep() {
            if (!strokes.current.length && !current) return;
            current = null;
            erasing = false;
            if (reduceMotion) {
                strokes.current = [];
                redraw();
                return;
            }
            if (sweepRaf) return;
            const keep = strokes.current.length;
            const start = performance.now();
            const duration = 340;
            function step(now: number) {
                sweep = Math.min(1, (now - start) / duration);
                redraw();
                if (sweep < 1) {
                    sweepRaf = requestAnimationFrame(step);
                } else {
                    sweep = -1;
                    sweepRaf = 0;
                    strokes.current = strokes.current.slice(keep);
                    redraw();
                }
            }
            sweepRaf = requestAnimationFrame(step);
        }

        engine.current = { undo, clearSweep };

        function onKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
                e.preventDefault();
                undo();
            }
        }

        // Cursor dot + coordinate readout: refs and direct style writes only.
        function onWindowMove(e: PointerEvent) {
            const over = e.target === canvas;
            const c = cursorRef.current;
            if (c) {
                c.style.opacity = over ? "1" : "0";
                if (over) {
                    c.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
                }
            }
            const r = readoutRef.current;
            if (r) {
                const gx = String(Math.max(0, Math.round(e.clientX / 9.5))).padStart(3, "0");
                const gy = String(Math.max(0, Math.round((e.clientY + window.scrollY) / 9.5))).padStart(3, "0");
                r.textContent = `${gx} · ${gy} — A-site, probably`;
            }
        }
        function onWindowOut(e: PointerEvent) {
            if (!e.relatedTarget && cursorRef.current) {
                cursorRef.current.style.opacity = "0";
            }
        }
        function onScroll() {
            schedule();
        }

        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);
        window.addEventListener("pointermove", onWindowMove, { passive: true });
        window.addEventListener("pointerout", onWindowOut);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", resize);
        window.addEventListener("keydown", onKeyDown);
        resize();

        return () => {
            if (raf) cancelAnimationFrame(raf);
            if (sweepRaf) cancelAnimationFrame(sweepRaf);
            window.clearTimeout(toastTimer.current);
            engine.current = null;
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            window.removeEventListener("pointermove", onWindowMove);
            window.removeEventListener("pointerout", onWindowOut);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", resize);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [enabled]);

    if (!enabled) return null;

    const cursorDot =
        tool === "eraser"
            ? {
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "1.5px solid #ef4444",
                  background: "rgba(239,68,68,0.08)",
              }
            : {
                  width: size * 2 + 3,
                  height: size * 2 + 3,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 8px ${color}55`,
              };

    return (
        <>
            {/* The board surface. Above the lattice, below every word. */}
            <canvas
                ref={canvasRef}
                aria-hidden
                className="fixed inset-0 z-[1]"
                style={{ width: "100%", height: "100%", cursor: "none", touchAction: "none" }}
            />

            {/* Pen cursor — a dot in the current ink, or the app's red eraser ring. */}
            <div
                ref={cursorRef}
                aria-hidden
                className="pointer-events-none fixed left-0 top-0 z-[80]"
                style={{ opacity: 0, willChange: "transform" }}
            >
                <div style={{ transform: "translate(-50%, -50%)", ...cursorDot }} />
            </div>

            {/* Tool dock — the app's drawing toolbar, compact. */}
            <div
                role="toolbar"
                aria-label="Drawing tools"
                className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-0.5 lg:bottom-auto lg:top-4"
                style={{
                    background: "rgba(24,24,27,0.96)",
                    border: `1px solid ${palette.border}`,
                    borderRadius: 12,
                    padding: "5px 7px",
                    boxShadow: shadow.menuLift,
                }}
            >
                {penColors.map((c, i) => {
                    const selected = color === c && tool !== "eraser";
                    return (
                        <button
                            key={c}
                            type="button"
                            title={`${PEN_NAMES[i]} pen`}
                            aria-label={`${PEN_NAMES[i]} pen`}
                            aria-pressed={selected}
                            onClick={() => {
                                setColor(c);
                                setTool((t) => (t === "eraser" ? "pen" : t));
                            }}
                            className="grid h-8 w-7 place-items-center rounded-lg transition-colors hover:bg-white/[0.06]"
                        >
                            <span
                                className="h-3.5 w-3.5 rounded-full"
                                style={{
                                    background: c,
                                    outline: selected
                                        ? `2px solid ${palette.violet}`
                                        : "1px solid rgba(255,255,255,0.14)",
                                    outlineOffset: 2,
                                }}
                            />
                        </button>
                    );
                })}

                <Divider />

                {penSizes.map((s) => (
                    <ToolButton
                        key={s}
                        label={`${s}px stroke`}
                        active={size === s}
                        onClick={() => setSize(s)}
                    >
                        <span
                            className="rounded-full"
                            style={{ width: s + 3, height: s + 3, background: "currentColor" }}
                        />
                    </ToolButton>
                ))}

                <Divider />

                <ToolButton label="Dashed line" active={dashed} onClick={() => setDashed((d) => !d)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                            d="M2 12.5 13.5 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="0.5 4.4"
                        />
                    </svg>
                </ToolButton>
                <ToolButton
                    label="Arrow tool"
                    active={tool === "arrow"}
                    onClick={() => setTool((t) => (t === "arrow" ? "pen" : "arrow"))}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                            d="M3 13 12.5 3.5M12.5 3.5H7M12.5 3.5V9"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </ToolButton>

                <Divider />

                <ToolButton
                    label="Eraser"
                    active={tool === "eraser"}
                    onClick={() => setTool((t) => (t === "eraser" ? "pen" : "eraser"))}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                            d="M5.5 14h8M2.4 9.6 8.6 3.4a1.6 1.6 0 0 1 2.3 0l1.8 1.8a1.6 1.6 0 0 1 0 2.3l-4.4 4.4H6l-3.6-2.3Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </ToolButton>
                <ToolButton label="Undo (Ctrl+Z)" onClick={() => engine.current?.undo()}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                            d="M2.5 6.5h7a3.5 3.5 0 1 1 0 7H6M2.5 6.5 5.5 3.5M2.5 6.5l3 3"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </ToolButton>
                <ToolButton label="Clear the board" onClick={() => engine.current?.clearSweep()}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                            d="M2.5 4h11M6 4V2.5h4V4M4 4l.8 9.5h6.4L12 4M6.7 6.8v4M9.3 6.8v4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </ToolButton>
            </div>

            {/* Coordinate readout — the board humoring you. */}
            <span
                ref={readoutRef}
                aria-hidden
                className="callsign fixed bottom-4 right-4 z-[55] hidden lg:block"
                style={{ fontSize: 10, color: palette.dim }}
            >
                000 · 000 — A-site, probably
            </span>

            {/* First-stroke toast. */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                        className="fixed bottom-[76px] left-1/2 z-[65] flex items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 lg:bottom-6"
                        style={{
                            x: "-50%",
                            background: palette.card,
                            borderColor: palette.border,
                            boxShadow: shadow.menuLift,
                        }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                                d="m4 12.5 5.5 5.5L20 6.5"
                                stroke={palette.allyGreen}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="text-[13px]" style={{ color: palette.fg }}>
                            Auto-saved. Locally, of course.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function Divider() {
    return <span aria-hidden className="mx-1 h-5 w-px" style={{ background: palette.border }} />;
}

function ToolButton({
    label,
    active = false,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={onClick}
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-white/[0.06]"
            style={{
                color: active ? palette.lavender : palette.muted,
                background: active ? "rgba(124,58,237,0.16)" : undefined,
            }}
        >
            {children}
        </button>
    );
}
