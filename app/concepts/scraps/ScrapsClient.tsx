"use client";

import Image from "next/image";
import Link from "next/link";
import {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import { FaDiscord, FaGithub, FaPlane, FaWindows } from "react-icons/fa";

import versionInfo from "@/app/data/versionInfo";
import DitherFire from "../_shared/DitherFire";
import FolderCard, { PeekSheet } from "../_shared/FolderCard";
import ProgressButton from "../_shared/ProgressButton";
import { useDragTilt } from "../_shared/useDragTilt";
import { easing, palette, shadow } from "../_shared/tokens";
import ScrapArt, { CleanChip, MiniStrat, type ScrapId } from "./scrapArt";

/**
 * Concept 04/05 — "Scraps".
 *
 * Your strats deserve better than the group chat. The hero is a desk
 * scattered with the debris every team's playbook actually is — a napkin,
 * a chat fragment, a notes screenshot, torn graph paper, a crumpled ball —
 * and the visitor rescues each one by dragging it into the playbook folder.
 * Chaos in, order out; the toast states the thesis every time.
 */

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const GITHUB_URL = "https://github.com/SunkenInTime/icarus";
const DISCORD_URL = "https://discord.gg/PN2uKwCqYB";

const SCRAP_COUNT = 5;

const CSS = `
.sc-page { background: ${palette.bg}; color: ${palette.fg}; min-height: 100vh; }
.sc-page ::selection { background: rgba(124, 58, 237, 0.45); }
.sc-page a:focus-visible, .sc-page button:focus-visible, .sc-page [role="button"]:focus-visible {
    outline: 2px solid ${palette.violet}; outline-offset: 3px;
}

/* Desk geometry: taller on phones so the debris and the folder both fit. */
.sc-desk { height: 640px; }
@media (min-width: 768px) { .sc-desk { height: 520px; } }

/* The crumpled ball relaxes on hover: creases fade, the strat peeks out. */
.scraps-crumple {
    border-radius: 46% 54% 44% 56% / 52% 46% 56% 48%;
    transition: border-radius 260ms ${easing.outCubic}, transform 260ms ${easing.outCubic};
}
.scraps-crumple:hover {
    border-radius: 28% 32% 26% 34% / 32% 28% 36% 30%;
    transform: scale(1.05);
}
.scraps-creases { transition: opacity 260ms ${easing.outCubic}; }
.scraps-crumple:hover .scraps-creases { opacity: 0.3; }
.scraps-peek { transition: opacity 260ms ${easing.outCubic}; }
.scraps-crumple:hover .scraps-peek { opacity: 1 !important; }

/* Typing indicator dots (static unless motion is allowed). */
.scraps-typing i {
    display: block; width: 4px; height: 4px; border-radius: 50%;
    background: ${palette.dim}; opacity: 0.5;
}

@media (prefers-reduced-motion: no-preference) {
    /* ...and with motion, the indicator types, loses its nerve, tries again. */
    .scraps-typing { animation: scGiveUp 8s ease-in-out infinite; }
    .scraps-typing i { animation: scDot 1.2s ease-in-out infinite; }
    .scraps-typing i:nth-child(2) { animation-delay: 0.15s; }
    .scraps-typing i:nth-child(3) { animation-delay: 0.3s; }
    @keyframes scDot {
        0%, 60%, 100% { opacity: 0.35; transform: none; }
        30% { opacity: 1; transform: translateY(-2px); }
    }
    @keyframes scGiveUp {
        0%, 52% { opacity: 1; }
        60%, 90% { opacity: 0.12; }
        100% { opacity: 1; }
    }

    .sc-deal { animation: scDeal 340ms ${easing.outQuart} both; }
    @keyframes scDeal {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: none; }
    }
    .sc-chip-in { animation: scChipIn 240ms ${easing.outQuart} both; }
    @keyframes scChipIn {
        from { opacity: 0; transform: translate(-50%, 14px) scale(0.92); }
        to { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
    .sc-toast-enter { animation: scToastIn 220ms ${easing.outQuart} both; }
    @keyframes scToastIn {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    .sc-clean-enter { animation: scCleanIn 420ms ${easing.outCubic} 240ms both; }
    @keyframes scCleanIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: none; }
    }
    .sc-pop { display: inline-block; animation: scPop 240ms ${easing.outQuart} both; }
    @keyframes scPop {
        from { transform: scale(0.6); opacity: 0.4; }
        to { transform: scale(1); opacity: 1; }
    }
}
`;

/* ── Small shared pieces ───────────────────────────────────────── */

function Callsign({ children, style }: { children: ReactNode; style?: CSSProperties }) {
    return (
        <p className="callsign" style={{ margin: 0, color: palette.dim, ...style }}>
            {children}
        </p>
    );
}

function SectionHeading({ children }: { children: ReactNode }) {
    return (
        <h2
            className="font-onest"
            style={{
                margin: "14px 0 0",
                fontSize: "clamp(28px, 3.6vw, 42px)",
                lineHeight: 1.08,
                fontWeight: 600,
                letterSpacing: "-0.02em",
            }}
        >
            {children}
        </h2>
    );
}

function BodyCopy({ children, style }: { children: ReactNode; style?: CSSProperties }) {
    return (
        <p
            style={{
                margin: "16px auto 0",
                maxWidth: 580,
                fontSize: 15.5,
                lineHeight: 1.65,
                color: palette.muted,
                ...style,
            }}
        >
            {children}
        </p>
    );
}

/* ── The desk ──────────────────────────────────────────────────── */

type DeskSpot = {
    id: ScrapId;
    tag: string;
    label: string;
    rot: number;
    z: number;
    left: string;
    top: string;
};

const DESK_SPOTS: DeskSpot[] = [
    {
        id: "napkin",
        tag: "exhibit: napkin, b-site, 2024",
        label: "the napkin sketch",
        rot: -3.2,
        z: 2,
        left: "2%",
        top: "6%",
    },
    {
        id: "chat",
        tag: "exhibit: group chat, 11:58 pm",
        label: "the group-chat plan",
        rot: 1.8,
        z: 3,
        left: "min(38%, calc(100% - 260px))",
        top: "0%",
    },
    {
        id: "notes",
        tag: "exhibit: notes app, (final)(v2)",
        label: "the notes-app screenshot",
        rot: -2.4,
        z: 2,
        left: "min(64%, calc(100% - 224px))",
        top: "26%",
    },
    {
        id: "graph",
        tag: "exhibit: graph paper, torn where it mattered",
        label: "the torn lineup diagram",
        rot: 3.4,
        z: 1,
        left: "5%",
        top: "46%",
    },
    {
        id: "crumple",
        tag: "exhibit: paper ball, gave up mid-fold",
        label: "the crumpled strat",
        rot: -2,
        z: 1,
        left: "min(40%, calc(100% - 150px))",
        top: "56%",
    },
];

const TOASTS = [
    "Filed. It never left your machine.",
    "Filed. Still no cloud involved.",
    "Three rescued. The group chat is grieving.",
    "Four. The napkin industry just felt a chill.",
    "All five. Your playbook is a playbook now.",
] as const;

type Ghost = {
    id: ScrapId;
    left: number;
    top: number;
    dx: number;
    dy: number;
    active: boolean;
};

type Chip = { id: ScrapId; phase: "in" | "file" };

function DeskScrap({
    spot,
    hidden,
    dealIndex,
    onProbe,
    onRelease,
    onDirectFile,
}: {
    spot: DeskSpot;
    hidden: boolean;
    dealIndex: number;
    onProbe: (rect: DOMRect) => void;
    onRelease: (id: ScrapId, rect: DOMRect, moved: boolean) => void;
    onDirectFile: (id: ScrapId, rect: DOMRect) => void;
}) {
    const { ref, isDragging } = useDragTilt<HTMLDivElement>({
        settle: "return",
        disabled: hidden,
        onDrag: () => {
            const el = ref.current;
            if (el) onProbe(el.getBoundingClientRect());
        },
        onDragEnd: ({ moved }) => {
            const el = ref.current;
            if (el) onRelease(spot.id, el.getBoundingClientRect(), moved);
        },
    });

    return (
        <div
            className="sc-deal"
            style={{
                position: "absolute",
                left: spot.left,
                top: spot.top,
                zIndex: isDragging ? 60 : spot.z,
                visibility: hidden ? "hidden" : "visible",
                pointerEvents: hidden ? "none" : undefined,
                animationDelay: `${dealIndex * 70}ms`,
            }}
        >
            <div style={{ transform: `rotate(${spot.rot}deg)` }}>
                <div
                    ref={ref}
                    role="button"
                    tabIndex={hidden ? -1 : 0}
                    aria-label={`File ${spot.label} into the team playbook`}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            const el = ref.current;
                            if (el && !hidden) onDirectFile(spot.id, el.getBoundingClientRect());
                        }
                    }}
                >
                    <ScrapArt id={spot.id} />
                </div>
                <p
                    aria-hidden
                    style={{
                        margin: "7px 0 0 2px",
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: palette.dim,
                        whiteSpace: "nowrap",
                    }}
                >
                    {spot.tag}
                </p>
            </div>
        </div>
    );
}

function Desk({ touch }: { touch: boolean }) {
    const [filed, setFiled] = useState<ScrapId[]>([]);
    const [hovering, setHovering] = useState(false);
    const [ghost, setGhost] = useState<Ghost | null>(null);
    const [chip, setChip] = useState<Chip | null>(null);
    const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
    const [dealSeed, setDealSeed] = useState(0);

    const hitRef = useRef(false);
    const filedRef = useRef<ScrapId[]>([]);
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

    // Two-phase ghost: mount at the drop position, then flip `active` next
    // frame so the transition carries it into the pocket.
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

    const clearTimers = useCallback(() => {
        timers.current.forEach((id) => window.clearTimeout(id));
        timers.current = [];
    }, []);

    const file = useCallback(
        (id: ScrapId, from: DOMRect) => {
            if (filedRef.current.includes(id)) return;
            const drop = dropRef.current;

            filedRef.current = [...filedRef.current, id];
            const toastText = TOASTS[Math.min(filedRef.current.length - 1, TOASTS.length - 1)];
            setFiled(filedRef.current);

            if (reduceRef.current || !drop) {
                setToast({ id: Date.now(), text: toastText });
                return;
            }

            // 1. The scrap itself flies into the pocket…
            const b = drop.getBoundingClientRect();
            const dx = b.left + b.width / 2 - (from.left + from.width / 2);
            const dy = b.top + 44 - (from.top + from.height / 2);
            clearTimers();
            setGhost({ id, left: from.left, top: from.top, dx, dy, active: false });

            // 2. …the clean strat-tile materializes above the folder…
            timers.current.push(
                window.setTimeout(() => {
                    setGhost(null);
                    setChip({ id, phase: "in" });
                }, 380),
            );
            // 3. …then files in, and the toast lands the thesis.
            timers.current.push(
                window.setTimeout(() => {
                    setChip({ id, phase: "file" });
                    setToast({ id: Date.now(), text: toastText });
                }, 1220),
            );
            timers.current.push(window.setTimeout(() => setChip(null), 1580));
        },
        [clearTimers],
    );

    const probe = useCallback((rect: DOMRect) => {
        const drop = dropRef.current;
        if (!drop) return;
        const b = drop.getBoundingClientRect();
        const hit =
            rect.left < b.right && rect.right > b.left && rect.top < b.bottom && rect.bottom > b.top;
        if (hit !== hitRef.current) {
            hitRef.current = hit;
            setHovering(hit);
        }
    }, []);

    const release = useCallback(
        (id: ScrapId, rect: DOMRect, moved: boolean) => {
            const wasHit = hitRef.current;
            hitRef.current = false;
            setHovering(false);
            if (wasHit && moved) file(id, rect);
            // Touch fallback: a plain tap files the scrap from where it sits.
            else if (!moved && touch) file(id, rect);
        },
        [file, touch],
    );

    const reset = useCallback(() => {
        clearTimers();
        filedRef.current = [];
        setFiled([]);
        setGhost(null);
        setChip(null);
        setToast(null);
        setDealSeed((s) => s + 1);
    }, [clearTimers]);

    const remaining = SCRAP_COUNT - filed.length;
    const clean = remaining === 0;

    const peeks =
        filed.length > 0
            ? [...filed]
                  .reverse()
                  .slice(0, 3)
                  .map((id) => (
                      <PeekSheet key={id}>
                          <MiniStrat id={id} />
                      </PeekSheet>
                  ))
            : undefined;

    return (
        <div className="relative mx-auto mt-16 max-w-[1160px] px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Callsign>
                    {`the desk — scraps (${remaining})`}
                    {clean ? " · better." : ""}
                </Callsign>
                <Callsign style={{ fontSize: 10 }}>
                    {clean
                        ? "nothing left to rescue"
                        : touch
                          ? "tap a scrap to file it into the playbook"
                          : "drag a scrap into the playbook folder — it knows what to do"}
                </Callsign>
            </div>

            {/* The desk surface. */}
            <div
                className="sc-desk relative mt-6"
                style={{
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 18px 32px -22px rgba(0,0,0,0.9)",
                }}
            >
                <div
                    aria-hidden
                    className="tactical-dots absolute inset-0"
                    style={{
                        opacity: 0.5,
                        maskImage: "radial-gradient(75% 90% at 50% 40%, black, transparent)",
                        WebkitMaskImage: "radial-gradient(75% 90% at 50% 40%, black, transparent)",
                    }}
                />

                {DESK_SPOTS.map((spot, i) => (
                    <DeskScrap
                        key={`${dealSeed}-${spot.id}`}
                        spot={spot}
                        dealIndex={i}
                        hidden={filed.includes(spot.id)}
                        onProbe={probe}
                        onRelease={release}
                        onDirectFile={file}
                    />
                ))}

                {/* The cleaned desk. */}
                {clean && (
                    <div
                        className="sc-clean-enter absolute inset-0 z-[5] grid place-items-center"
                        style={{ pointerEvents: "none" }}
                    >
                        <div style={{ textAlign: "center", pointerEvents: "auto" }}>
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: MONO,
                                    fontSize: "clamp(22px, 3vw, 30px)",
                                    letterSpacing: "0.08em",
                                    color: palette.fg,
                                }}
                            >
                                better.
                            </p>
                            <button
                                type="button"
                                onClick={reset}
                                className="callsign"
                                style={{
                                    marginTop: 14,
                                    fontSize: 10,
                                    color: palette.muted,
                                    background: "transparent",
                                    border: `1px solid ${palette.border}`,
                                    borderRadius: 6,
                                    padding: "7px 12px",
                                    cursor: "pointer",
                                }}
                            >
                                {"make a mess again"}
                            </button>
                        </div>
                    </div>
                )}

                {/* The playbook — the only violet on the desk. */}
                <div
                    className="absolute z-10"
                    style={{ right: "clamp(8px, 8%, 140px)", bottom: 14 }}
                >
                    <div ref={dropRef} style={{ display: "inline-block", position: "relative" }}>
                        <FolderCard
                            name="Team playbook"
                            baseColor={palette.violet}
                            scale={1.2}
                            open={hovering || chip !== null ? true : undefined}
                            highlight={hovering}
                            peeks={peeks}
                            footer={
                                <span>
                                    <span key={filed.length} className="sc-pop">
                                        {filed.length}
                                    </span>
                                    {` of ${SCRAP_COUNT} rescued · saved locally`}
                                </span>
                            }
                        />

                        {/* The clean strat-tile, materializing then filing in. */}
                        {chip && (
                            <div
                                aria-hidden
                                className={chip.phase === "in" ? "sc-chip-in" : undefined}
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: -70,
                                    zIndex: 30,
                                    pointerEvents: "none",
                                    transform:
                                        chip.phase === "file"
                                            ? "translate(-50%, 96px) scale(0.4)"
                                            : "translate(-50%, 0) scale(1)",
                                    opacity: chip.phase === "file" ? 0 : 1,
                                    transition:
                                        chip.phase === "file"
                                            ? `transform 320ms ${easing.outQuart}, opacity 260ms ${easing.outQuart} 60ms`
                                            : undefined,
                                    willChange: "transform, opacity",
                                }}
                            >
                                <CleanChip id={chip.id} />
                            </div>
                        )}
                    </div>
                    <p
                        className="callsign"
                        style={{ margin: "10px 0 0", fontSize: 9, color: palette.dim, textAlign: "center" }}
                    >
                        {"drop zone · pocket gapes when you're close"}
                    </p>
                </div>
            </div>

            {/* Ghost scrap flying into the pocket. */}
            {ghost && (
                <div
                    aria-hidden
                    style={{
                        position: "fixed",
                        left: ghost.left,
                        top: ghost.top,
                        zIndex: 70,
                        pointerEvents: "none",
                        transform: ghost.active
                            ? `translate3d(${ghost.dx.toFixed(1)}px, ${ghost.dy.toFixed(1)}px, 0) scale(0.3) rotate(-5deg)`
                            : "translate3d(0, 0, 0) scale(1)",
                        opacity: ghost.active ? 0 : 1,
                        transition: `transform 360ms ${easing.outQuart}, opacity 300ms ${easing.outQuart} 120ms`,
                        willChange: "transform, opacity",
                    }}
                >
                    <ScrapArt id={ghost.id} />
                </div>
            )}

            {/* Toast — the thesis, one line at a time. */}
            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    className="sc-toast-enter"
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
                        <path
                            d="m9 13 2 2 4-4"
                            stroke={palette.lavender}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span style={{ fontSize: 13, color: palette.fg }}>{toast.text}</span>
                </div>
            )}
        </div>
    );
}

/* ── Chaos in, order out ───────────────────────────────────────── */

const PAIRS = [
    {
        before: "“trust me just W”",
        beforeSub: "the strat, in its entirety · sent 0:07 into the round",
        after: "A drawn route your duelist can actually follow.",
        afterSub: "dashed arrow, timed flash, zero interpretation required",
    },
    {
        before: "IMG_2047.PNG",
        beforeSub: "…and 13 more · the entire haven playbook",
        after: "Folders that know their maps and agents.",
        afterSub: "haven strats live in the haven folder. revolutionary.",
    },
    {
        before: "“who has the doc?”",
        beforeSub: "asked every scrim · answered never",
        after: "A share code anyone can open.",
        afterSub: "paste the code, see the board. that’s the tutorial.",
    },
] as const;

function PairArrow() {
    return (
        <>
            {/* Desktop: a dashed pen stroke pointing forward. */}
            <svg
                width="88"
                height="24"
                viewBox="0 0 88 24"
                fill="none"
                aria-hidden
                className="hidden md:block"
                style={{ flexShrink: 0, opacity: 0.6 }}
            >
                <path
                    d="M4 14 C 28 8, 52 18, 76 12"
                    stroke={palette.dim}
                    strokeWidth="1.4"
                    strokeDasharray="4 5"
                    strokeLinecap="round"
                />
                <path d="M76 12 l -8 -4 m 8 4 l -7.4 4.6" stroke={palette.dim} strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {/* Mobile: the same stroke, falling downward. */}
            <svg
                width="24"
                height="40"
                viewBox="0 0 24 40"
                fill="none"
                aria-hidden
                className="mx-auto block md:hidden"
                style={{ opacity: 0.6 }}
            >
                <path
                    d="M12 4 C 8 14, 16 22, 12 32"
                    stroke={palette.dim}
                    strokeWidth="1.4"
                    strokeDasharray="4 5"
                    strokeLinecap="round"
                />
                <path d="M12 32 l -4 -6 m 4 6 l 4.4 -5.6" stroke={palette.dim} strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        </>
    );
}

function AllyPing() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden style={{ flexShrink: 0, marginTop: 3 }}>
            <circle cx="8" cy="8" r="6" fill="rgba(105,240,175,0.12)" stroke={palette.allyOutline} strokeWidth="1.6" />
            <circle cx="8" cy="8" r="1.8" fill={palette.allyOutline} />
        </svg>
    );
}

function StorySection() {
    return (
        <section className="px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-[900px]">
                <div className="text-center">
                    <Callsign>{"the conversion process"}</Callsign>
                    <SectionHeading>Chaos in. Order out.</SectionHeading>
                    <BodyCopy>
                        {"Every scrap on that desk has a clean, drawn, findable version of itself waiting in Icarus. Same idea. Fewer apologies."}
                    </BodyCopy>
                </div>

                <div className="mt-16 flex flex-col gap-12">
                    {PAIRS.map((pair) => (
                        <div
                            key={pair.before}
                            className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-6"
                        >
                            {/* Before: debris. */}
                            <div
                                className="md:flex-1"
                                style={{
                                    background: palette.card,
                                    border: `1px solid ${palette.border}`,
                                    borderRadius: 10,
                                    padding: "16px 18px",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontFamily: MONO,
                                        fontSize: 14,
                                        color: palette.muted,
                                    }}
                                >
                                    {pair.before}
                                </p>
                                <p
                                    style={{
                                        margin: "6px 0 0",
                                        fontFamily: MONO,
                                        fontSize: 9.5,
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        color: palette.dim,
                                    }}
                                >
                                    {pair.beforeSub}
                                </p>
                            </div>

                            <PairArrow />

                            {/* After: board annotation. */}
                            <div className="flex items-start gap-3 md:flex-[1.15]" style={{ padding: "4px 2px" }}>
                                <AllyPing />
                                <div>
                                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: palette.fg }}>
                                        {pair.after}
                                    </p>
                                    <p
                                        style={{
                                            margin: "5px 0 0",
                                            fontFamily: MONO,
                                            fontSize: 10,
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                            color: palette.dim,
                                        }}
                                    >
                                        {pair.afterSub}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Local-first ───────────────────────────────────────────────── */

function LocalFirstSection() {
    return (
        <section className="px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-[980px]">
                <div className="text-center">
                    <Callsign>{"where it lives"}</Callsign>
                    <SectionHeading>The folder is a real folder.</SectionHeading>
                </div>

                <div className="mt-14 flex flex-col items-center gap-12 lg:flex-row lg:justify-center lg:gap-20">
                    <div className="flex flex-col items-center gap-5">
                        <span
                            className="callsign"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                fontSize: 10,
                                color: palette.muted,
                                border: `1px solid ${palette.border}`,
                                borderRadius: 999,
                                padding: "6px 13px",
                            }}
                        >
                            <FaPlane aria-hidden size={9} style={{ transform: "rotate(-20deg)" }} />
                            {"airplane-mode compatible"}
                        </span>
                        <FolderCard
                            name="Team playbook"
                            baseColor={palette.violet}
                            scale={1.35}
                            footer={"5 strats · 0 accounts · 1 disk (yours)"}
                            peeks={[
                                <PeekSheet key="napkin">
                                    <MiniStrat id="napkin" />
                                </PeekSheet>,
                                <PeekSheet key="chat">
                                    <MiniStrat id="chat" />
                                </PeekSheet>,
                                <PeekSheet key="notes">
                                    <MiniStrat id="notes" />
                                </PeekSheet>,
                            ]}
                        />
                    </div>

                    <div style={{ maxWidth: 440 }}>
                        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: palette.muted }}>
                            {"No account. No sync you didn’t ask for. Your playbook is a real folder on your real disk — files you can see, back up, or carry to a LAN on a USB stick like precious cargo. Close the app, unplug the router: the strats are still there, because they never went anywhere."}
                        </p>
                        <p
                            style={{
                                margin: "16px 0 0",
                                fontFamily: MONO,
                                fontSize: 11,
                                lineHeight: 1.7,
                                letterSpacing: "0.06em",
                                color: palette.dim,
                            }}
                        >
                            {"(pro sync is coming — opt-in, for teams. the folder stays yours.)"}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Proof ─────────────────────────────────────────────────────── */

function ProofSection() {
    return (
        <section className="px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-[1020px]">
                <div className="text-center">
                    <Callsign>{"primary source"}</Callsign>
                    <SectionHeading>Where the scraps end up.</SectionHeading>
                </div>

                <div className="relative mt-12">
                    <div
                        style={{
                            borderRadius: 14,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.10)",
                            boxShadow: "0 40px 90px -40px rgba(0,0,0,0.9)",
                        }}
                    >
                        <Image
                            src="/board-preview.png"
                            alt="The Icarus strategy board: a VALORANT map with drawn executes, agent markers, and the strat library"
                            width={2048}
                            height={1280}
                            className="block h-auto w-full"
                        />
                    </div>

                    <div
                        style={{
                            position: "relative",
                            zIndex: 2,
                            marginTop: -30,
                            marginLeft: "clamp(12px, 4vw, 40px)",
                            display: "inline-block",
                            background: palette.card,
                            border: `1px solid ${palette.border}`,
                            borderRadius: 8,
                            padding: "13px 17px",
                            boxShadow: shadow.menuLift,
                            maxWidth: 480,
                            textAlign: "left",
                        }}
                    >
                        <p className="callsign" style={{ margin: 0, fontSize: 10, color: palette.muted }}>
                            {"exhibit — after"}
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.55, color: palette.muted }}>
                            {"The same call, drawn like you meant it. 60fps canvas, agent pings, timed utility, folders per map. Formerly a napkin."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Download ──────────────────────────────────────────────────── */

function DownloadSection() {
    const [progress, setProgress] = useState(0);
    const win = versionInfo.platforms.windows;

    // Quantize so the shader energizes without re-rendering every rAF tick.
    const onProgress = useCallback((p: number) => {
        setProgress((prev) => {
            const q = Math.round(p * 24) / 24;
            return q === prev ? prev : q;
        });
    }, []);

    return (
        <section id="download" className="px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-[640px] text-center">
                <Callsign>{"the rescue continues"}</Callsign>
                <SectionHeading>Rescue the rest of them.</SectionHeading>
                <BodyCopy>
                    {`Icarus is free, MIT-licensed, and ${win.size} — smaller than your screenshots folder. Download it, drag the chaos in, and hand your five-stack something they can actually follow.`}
                </BodyCopy>
            </div>

            <div
                className="mx-auto mt-12 max-w-[560px]"
                style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${palette.border}`,
                    background: palette.card,
                    boxShadow: shadow.menuLift,
                }}
            >
                <div style={{ height: 180, position: "relative", background: "#0b0a10" }}>
                    <DitherFire progress={progress} cell={9} />
                    <span
                        style={{
                            position: "absolute",
                            left: 14,
                            bottom: 10,
                            fontFamily: MONO,
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: palette.dim,
                        }}
                    >
                        {"burns while the installer lands — your scraps' welcome party"}
                    </span>
                </div>

                <div style={{ padding: "26px 28px 28px", textAlign: "center" }}>
                    <ProgressButton
                        href={win.url}
                        label="Download for Windows"
                        downloadingLabel={(p) => `Downloading… ${p}%`}
                        doneLabel="In your downloads. Go rescue."
                        onProgress={onProgress}
                        style={{ width: "100%" }}
                    />
                    <p
                        style={{
                            margin: "14px 0 0",
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: palette.dim,
                        }}
                    >
                        {`v${versionInfo.version} · ${win.size} · ${versionInfo.released}`}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 12.5, color: palette.muted }}>
                        {"Free · MIT · No accounts"}
                    </p>

                    <div
                        className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
                        style={{ fontSize: 12.5 }}
                    >
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                            style={{ color: palette.muted }}
                        >
                            <FaGithub aria-hidden size={13} /> GitHub
                        </a>
                        <a
                            href={DISCORD_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                            style={{ color: palette.muted }}
                        >
                            <FaDiscord aria-hidden size={13} /> Discord
                        </a>
                        {win.secondaryUrl ? (
                            <a
                                href={win.secondaryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                                style={{ color: palette.muted }}
                            >
                                <FaWindows aria-hidden size={12} /> Microsoft Store
                            </a>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Page ──────────────────────────────────────────────────────── */

function subscribeCoarsePointer(callback: () => void) {
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
}

export default function ScrapsClient() {
    // Touch devices get tap-to-file instead of drag-and-drop.
    const touch = useSyncExternalStore(
        subscribeCoarsePointer,
        () => window.matchMedia("(pointer: coarse)").matches,
        () => false,
    );

    return (
        <div className="sc-page relative overflow-x-clip">
            <style>{CSS}</style>

            {/* Concept badge. */}
            <Link
                href="/concepts"
                className="callsign"
                style={{
                    position: "fixed",
                    top: 18,
                    left: 20,
                    zIndex: 90,
                    fontSize: 10,
                    color: palette.muted,
                    background: "rgba(9, 9, 11, 0.82)",
                    border: `1px solid ${palette.border}`,
                    borderRadius: 6,
                    padding: "7px 11px",
                    backdropFilter: "blur(8px)",
                    textDecoration: "none",
                }}
            >
                {"Concept 04/05 — Scraps"}
            </Link>

            {/* Hero: the desk. */}
            <section className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
                <div className="relative mx-auto max-w-[1140px] px-6 text-center">
                    <Callsign>{"icarus — evidence collection"}</Callsign>
                    <h1
                        className="font-onest"
                        style={{
                            margin: "22px 0 0",
                            fontSize: "clamp(42px, 7vw, 92px)",
                            lineHeight: 1.0,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Your strats deserve better.
                    </h1>
                    <p
                        style={{
                            margin: "26px auto 0",
                            maxWidth: 620,
                            fontFamily: MONO,
                            fontSize: 12,
                            lineHeight: 1.7,
                            letterSpacing: "0.06em",
                            color: palette.dim,
                        }}
                    >
                        {"than the napkin. than the screenshots. than the voice memo nobody opened."}
                    </p>
                    <BodyCopy style={{ maxWidth: 620 }}>
                        {"Right now the plan for B site lives on a napkin, in four screenshots, and in a Discord message that says “trust me just W.” Icarus is a free, open-source strategy board that gives every one of them a home — drawn properly, filed by map, saved on your machine. Start by cleaning the desk."}
                    </BodyCopy>
                    <p style={{ margin: "18px 0 0" }}>
                        <a
                            href="#download"
                            className="callsign"
                            style={{ fontSize: 10, color: palette.muted, textDecoration: "none" }}
                        >
                            {"or skip the chores and download ↓"}
                        </a>
                    </p>
                </div>

                <Desk touch={touch} />
            </section>

            <StorySection />
            <LocalFirstSection />
            <ProofSection />
            <DownloadSection />

            {/* Footer, with the mandatory confession. */}
            <footer className="border-t px-6 py-10" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-4 sm:flex-row">
                    <p
                        className="callsign"
                        style={{
                            margin: 0,
                            fontSize: 10,
                            color: palette.dim,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden style={{ flexShrink: 0 }}>
                            <circle
                                cx="9"
                                cy="9"
                                r="6.5"
                                fill="none"
                                stroke="rgba(128,84,44,0.55)"
                                strokeWidth="2.4"
                            />
                            <circle cx="9" cy="9" r="4" fill="none" stroke="rgba(128,84,44,0.22)" strokeWidth="1.2" />
                        </svg>
                        {"the coffee stain in the hero is vector. we're not proud."}
                    </p>
                    <div className="flex items-center gap-6" style={{ fontSize: 12 }}>
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-white"
                            style={{ color: palette.dim }}
                        >
                            GitHub
                        </a>
                        <a
                            href={DISCORD_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-white"
                            style={{ color: palette.dim }}
                        >
                            Discord
                        </a>
                        <Link
                            href="/concepts"
                            className="transition-colors hover:text-white"
                            style={{ color: palette.dim }}
                        >
                            All concepts
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
