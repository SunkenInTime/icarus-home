"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FolderCard from "../_shared/FolderCard";
import { useDragTilt } from "../_shared/useDragTilt";
import { easing, palette, penColors, shadow } from "../_shared/tokens";

/**
 * Exhibit 02 — the filing cabinet. A loose strat sheet the visitor drags
 * into a folder. While the sheet hovers the pocket, the folder gapes; on
 * drop the sheet flies into the pocket, the count ticks up on a tiny
 * odometer, and a toast states the thesis: saved, locally, that is the
 * whole trick. A fresh sheet slides in so the visitor can keep going.
 */

const SHEET_W = 216;
const SHEET_H = 104;
const START_COUNT = 27;

const SHEETS = [
    { title: "yoru flash — b main, 0:31", pen: penColors[1] },
    { title: "double sage wall (why not)", pen: penColors[3] },
    { title: "garage smoke, retake anchor", pen: penColors[2] },
    { title: "the lurk that always works", pen: penColors[4] },
] as const;

const TOASTS = [
    "Saved. Locally. That's the whole trick.",
    "Saved again. Still no server. Still yours.",
    "That one never left your machine either.",
    "Four for four. The cloud remains uninvolved.",
    "You get it. It just goes in the folder.",
] as const;

const CAPTION = "unsaved sheet — drag it into the folder";
const FALLBACK = "no mouse? file it anyway";
const GAPE_NOTE = "while a sheet hovers, the pocket gapes. drop it.";

type Ghost = {
    left: number;
    top: number;
    dx: number;
    dy: number;
    active: boolean;
    sheetIndex: number;
};

/** The loose sheet: dot-grid paper, one pen doodle, an honest "unsaved" tag. */
function StratSheet({ title, pen }: { title: string; pen: string }) {
    return (
        <div
            style={{
                width: SHEET_W,
                height: SHEET_H,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "#141416",
                backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "9.5px 9.5px",
                boxShadow: shadow.cardForeground,
                padding: "10px 13px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <p
                style={{
                    margin: 0,
                    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: palette.muted,
                }}
            >
                {title}
            </p>
            <svg width="150" height="52" viewBox="0 0 150 52" fill="none" aria-hidden style={{ marginTop: 4 }}>
                <path
                    d="M10 42 C 38 40, 44 18, 74 16 S 118 26, 132 12"
                    stroke={pen}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="1 8"
                    opacity="0.85"
                />
                <path
                    d="M132 12 l -8 -1.5 m 8 1.5 l -3.5 7"
                    stroke={pen}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.85"
                />
                <circle cx="16" cy="42" r="5" stroke="rgba(250,250,250,0.5)" strokeWidth="2.5" />
            </svg>
            <span
                style={{
                    position: "absolute",
                    right: 10,
                    bottom: 8,
                    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: palette.dim,
                }}
            >
                unsaved
            </span>
        </div>
    );
}

/** Per-digit odometer roll for the folder's sheet count. */
function Odometer({ value }: { value: number }) {
    const digits = String(value).split("").map(Number);
    return (
        <span className="fl-odo" style={{ display: "inline-flex", verticalAlign: "bottom" }}>
            <span className="sr-only">{value}</span>
            {digits.map((d, i) => (
                <span
                    key={digits.length - i}
                    aria-hidden
                    style={{ display: "inline-block", height: "1.3em", overflow: "hidden" }}
                >
                    <span
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            transform: `translateY(-${(d * 1.3).toFixed(1)}em)`,
                            transition: `transform 420ms ${easing.outCubic}`,
                        }}
                    >
                        {Array.from({ length: 10 }, (_, n) => (
                            <span key={n} style={{ height: "1.3em", lineHeight: 1.3 }}>
                                {n}
                            </span>
                        ))}
                    </span>
                </span>
            ))}
        </span>
    );
}

export default function FilingExhibit() {
    const [count, setCount] = useState(START_COUNT);
    const [sheetIndex, setSheetIndex] = useState(0);
    const [sheetVisible, setSheetVisible] = useState(true);
    const [hovering, setHovering] = useState(false);
    const [filing, setFiling] = useState(false);
    const [ghost, setGhost] = useState<Ghost | null>(null);
    const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

    const hitRef = useRef(false);
    const filedRef = useRef(0);
    const busyRef = useRef(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const timers = useRef<number[]>([]);
    const reduceRef = useRef(false);

    useEffect(() => {
        reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const stash = timers.current;
        return () => stash.forEach((id) => window.clearTimeout(id));
    }, []);

    useEffect(() => {
        if (!toast) return;
        const id = window.setTimeout(() => setToast(null), 3200);
        return () => window.clearTimeout(id);
    }, [toast]);

    // Two-phase ghost: mount at the drop position, then flip `active` on the
    // next frame so the transition carries it into the pocket.
    useEffect(() => {
        if (!ghost || ghost.active) return;
        let inner = 0;
        const outer = requestAnimationFrame(() => {
            inner = requestAnimationFrame(() =>
                setGhost((g) => (g && !g.active ? { ...g, active: true } : g)),
            );
        });
        return () => {
            cancelAnimationFrame(outer);
            if (inner) cancelAnimationFrame(inner);
        };
    }, [ghost]);

    const fileSheet = useCallback(
        (from: { left: number; top: number; width: number; height: number }) => {
            const drop = dropRef.current;
            if (!drop || busyRef.current) return;
            busyRef.current = true;

            const b = drop.getBoundingClientRect();
            const dx = b.left + b.width / 2 - (from.left + from.width / 2);
            const dy = b.top + 34 - (from.top + from.height / 2);

            setSheetVisible(false);
            setFiling(true);

            const finish = () => {
                setGhost(null);
                setFiling(false);
                setCount((c) => c + 1);
                const text = TOASTS[Math.min(filedRef.current, TOASTS.length - 1)];
                filedRef.current += 1;
                setToast({ id: Date.now(), text });
                timers.current.push(
                    window.setTimeout(
                        () => {
                            setSheetIndex((i) => (i + 1) % SHEETS.length);
                            setSheetVisible(true);
                            busyRef.current = false;
                        },
                        reduceRef.current ? 0 : 420,
                    ),
                );
            };

            if (reduceRef.current) {
                finish();
                return;
            }
            setGhost({ left: from.left, top: from.top, dx, dy, active: false, sheetIndex });
            timers.current.push(window.setTimeout(finish, 400));
        },
        [sheetIndex],
    );

    const { ref: dragRef } = useDragTilt<HTMLDivElement>({
        settle: "return",
        onDrag: () => {
            const el = dragRef.current;
            const drop = dropRef.current;
            if (!el || !drop) return;
            const a = el.getBoundingClientRect();
            const b = drop.getBoundingClientRect();
            const hit = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
            if (hit !== hitRef.current) {
                hitRef.current = hit;
                setHovering(hit);
            }
        },
        onDragEnd: ({ moved }) => {
            const wasHit = hitRef.current;
            hitRef.current = false;
            setHovering(false);
            const el = dragRef.current;
            if (wasHit && moved && el && sheetVisible) fileSheet(el.getBoundingClientRect());
        },
    });

    const sheet = SHEETS[sheetIndex];

    return (
        <div>
            <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16">
                {/* The loose sheet and its caption. */}
                <div className="flex flex-col items-center gap-4">
                    <div style={{ width: SHEET_W, height: SHEET_H, position: "relative" }}>
                        {/* Empty slot shown while a sheet is mid-flight. */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 8,
                                border: "1px dashed rgba(255,255,255,0.14)",
                                display: "grid",
                                placeItems: "center",
                                opacity: sheetVisible ? 0 : 1,
                                transition: "opacity 200ms ease",
                            }}
                        >
                            <span className="callsign" style={{ fontSize: 10, color: palette.dim }}>
                                filed.
                            </span>
                        </div>
                        {/* Drag element stays mounted so the tilt physics survive re-deals. */}
                        <div
                            ref={dragRef}
                            style={{
                                position: "absolute",
                                inset: 0,
                                cursor: "grab",
                                visibility: sheetVisible ? "visible" : "hidden",
                            }}
                        >
                            <div key={sheetIndex} className="fl-sheet-enter">
                                <StratSheet title={sheet.title} pen={sheet.pen} />
                            </div>
                        </div>
                    </div>
                    <p className="callsign" style={{ fontSize: 10, color: palette.dim, margin: 0 }}>
                        {CAPTION}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            const el = dragRef.current;
                            if (el && sheetVisible) fileSheet(el.getBoundingClientRect());
                        }}
                        className="callsign"
                        style={{
                            fontSize: 10,
                            color: palette.muted,
                            background: "transparent",
                            border: `1px solid ${palette.border}`,
                            borderRadius: 6,
                            padding: "7px 12px",
                            cursor: "pointer",
                        }}
                    >
                        {FALLBACK} {"→"}
                    </button>
                </div>

                {/* Dashed leader between sheet and folder. */}
                <svg
                    width="120"
                    height="40"
                    viewBox="0 0 120 40"
                    fill="none"
                    aria-hidden
                    className="hidden lg:block"
                    style={{ flexShrink: 0, opacity: 0.55 }}
                >
                    <path
                        d="M6 20 C 40 8, 80 32, 108 20"
                        stroke={palette.dim}
                        strokeWidth="1.2"
                        strokeDasharray="3 5"
                    />
                    <path d="M108 20 l -7 -4 m 7 4 l -7 4" stroke={palette.dim} strokeWidth="1.2" />
                </svg>

                {/* The target folder. */}
                <div className="flex flex-col items-center gap-4">
                    <div ref={dropRef} style={{ display: "inline-block" }}>
                        <FolderCard
                            name="Scrim notes"
                            baseColor={palette.violet}
                            scale={1.15}
                            open={hovering || filing ? true : undefined}
                            highlight={hovering}
                            footer={
                                <span style={{ display: "inline-flex", gap: 4, alignItems: "baseline" }}>
                                    <Odometer value={count} />
                                    <span>{"sheets · saved locally"}</span>
                                </span>
                            }
                        />
                    </div>
                    <p className="callsign hidden sm:block" style={{ fontSize: 10, color: palette.dim, margin: 0 }}>
                        {GAPE_NOTE}
                    </p>
                </div>
            </div>

            {/* Ghost sheet flying into the pocket. */}
            {ghost && (
                <div
                    aria-hidden
                    style={{
                        position: "fixed",
                        left: ghost.left,
                        top: ghost.top,
                        zIndex: 60,
                        pointerEvents: "none",
                        transform: ghost.active
                            ? `translate3d(${ghost.dx.toFixed(1)}px, ${ghost.dy.toFixed(1)}px, 0) scale(0.42) rotate(-4deg)`
                            : "translate3d(0, 0, 0) scale(1)",
                        opacity: ghost.active ? 0 : 1,
                        transition: `transform 360ms ${easing.outQuart}, opacity 300ms ${easing.outQuart} 120ms`,
                        willChange: "transform, opacity",
                    }}
                >
                    <StratSheet title={SHEETS[ghost.sheetIndex].title} pen={SHEETS[ghost.sheetIndex].pen} />
                </div>
            )}

            {/* Toast — the whole thesis in one line. */}
            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    className="fl-toast-enter"
                    style={{
                        position: "fixed",
                        left: "50%",
                        bottom: 28,
                        transform: "translate(-50%, 0)",
                        zIndex: 80,
                        background: palette.card,
                        border: `1px solid ${palette.border}`,
                        borderRadius: 10,
                        padding: "12px 18px",
                        boxShadow: shadow.menuLift,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        whiteSpace: "nowrap",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
                        <path
                            d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                            stroke={palette.lavender}
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                        />
                        <path d="m9 13 2 2 4-4" stroke={palette.lavender} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: palette.fg }}>{toast.text}</span>
                </div>
            )}
        </div>
    );
}
