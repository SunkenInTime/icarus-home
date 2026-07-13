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
} from "react";
import { FaDiscord, FaGithub, FaThumbtack, FaWindows } from "react-icons/fa";

import versionInfo from "@/app/data/versionInfo";
import DitherFire from "../_shared/DitherFire";
import FolderCard, { PeekSheet } from "../_shared/FolderCard";
import ProgressButton from "../_shared/ProgressButton";
import { useDragTilt, type DragTiltOptions } from "../_shared/useDragTilt";
import { lerpHex, palette, shadow } from "../_shared/tokens";
import FilingExhibit from "./FilingExhibit";

/**
 * Concept 02/05 — "Functional Love".
 *
 * An archive room for the objects the app poured its love into: folders you
 * can pick up, a sheet you can file, spec-sheet annotations documenting the
 * physics, and one shader that only plays when you get something. The page
 * is built from the app's own parts (shared kit), so the claim is the demo.
 */

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const GITHUB_URL = "https://github.com/SunkenInTime/icarus";
const DISCORD_URL = "https://discord.gg/PN2uKwCqYB";

const CSS = `
.fl-page { background: ${palette.bg}; color: ${palette.fg}; min-height: 100vh; }
.fl-page ::selection { background: rgba(124, 58, 237, 0.45); }
.fl-page a:focus-visible, .fl-page button:focus-visible { outline: 2px solid ${palette.violet}; outline-offset: 3px; }
.fl-note { opacity: 0.8; }
@media (prefers-reduced-motion: no-preference) {
    .fl-wobble-run { animation: flWobble 1100ms cubic-bezier(0.215, 0.61, 0.355, 1) 300ms 1 both; }
    @keyframes flWobble {
        0%, 100% { transform: rotate(0deg); }
        18% { transform: rotate(2.1deg); }
        42% { transform: rotate(-1.5deg); }
        68% { transform: rotate(0.7deg); }
        86% { transform: rotate(-0.25deg); }
    }
    .fl-sheet-enter { animation: flSheetIn 300ms cubic-bezier(0.165, 0.84, 0.44, 1) both; }
    @keyframes flSheetIn {
        from { opacity: 0; transform: translateX(-16px) rotate(-2.5deg); }
        to { opacity: 1; transform: none; }
    }
    .fl-toast-enter { animation: flToastIn 220ms cubic-bezier(0.165, 0.84, 0.44, 1) both; }
    @keyframes flToastIn {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
}
@media (prefers-reduced-motion: reduce) {
    .fl-odo span { transition: none !important; }
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
                maxWidth: 560,
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

/* ── Spec-sheet annotations (exploded-drawing leader lines) ───── */

type SpecNoteProps = {
    text: string;
    style: CSSProperties;
    align?: "left" | "right";
    /** Line above the label (for notes placed below the object). */
    lineFirst?: boolean;
    /** Leader line; (x2, y2) is the object end and gets the terminus dot. */
    line: { w: number; h: number; x1: number; y1: number; x2: number; y2: number };
};

function SpecNote({ text, style, align = "left", lineFirst = false, line }: SpecNoteProps) {
    const svg = (
        <svg
            width={line.w}
            height={line.h}
            aria-hidden
            style={{ display: "block", marginLeft: align === "right" ? "auto" : 0 }}
        >
            <path
                d={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
                stroke="rgba(161, 161, 170, 0.45)"
                strokeWidth="1"
                strokeDasharray="3 4"
                fill="none"
            />
            <circle cx={line.x2} cy={line.y2} r="2" fill="rgba(161, 161, 170, 0.6)" />
        </svg>
    );
    return (
        <div
            className="fl-note hidden xl:block"
            style={{ position: "absolute", pointerEvents: "none", width: 200, textAlign: align, zIndex: 5, ...style }}
        >
            {lineFirst && svg}
            <p
                style={{
                    margin: lineFirst ? "4px 0 0" : "0 0 4px",
                    fontFamily: MONO,
                    fontSize: 10,
                    lineHeight: 1.6,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: palette.dim,
                }}
            >
                {text}
            </p>
            {!lineFirst && svg}
        </div>
    );
}

/* ── Draggable folder (the app's carry physics) ────────────────── */

function DraggableFolder({
    tilt = 0,
    innerRef,
    onDrag,
    onDragEnd,
    children,
}: {
    tilt?: number;
    innerRef?: React.RefObject<HTMLDivElement | null>;
    onDrag?: DragTiltOptions["onDrag"];
    onDragEnd?: DragTiltOptions["onDragEnd"];
    children: ReactNode;
}) {
    const { ref, isDragging } = useDragTilt<HTMLDivElement>({ settle: "return", onDrag, onDragEnd });
    return (
        <div
            style={{
                position: "relative",
                zIndex: isDragging ? 60 : "auto",
                transform: tilt ? `rotate(${tilt}deg)` : undefined,
            }}
        >
            <div ref={innerRef}>
                <div ref={ref} style={{ width: 232, height: 124 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ── Exhibit 01 — the shelf ────────────────────────────────────── */

const WHISPER = "careful — that's a real folder to someone";

function CursedIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3 22 20H2L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="17.2" r="0.9" fill="currentColor" />
        </svg>
    );
}

function Shelf() {
    const whisperRef = useRef<HTMLDivElement>(null);
    const whisperOn = useRef(false);
    const cursedRef = useRef<HTMLDivElement>(null);

    // Whimsy: the cursed folder wobbles once when it first scrolls into view.
    useEffect(() => {
        const el = cursedRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("fl-wobble-run");
                    io.disconnect();
                }
            },
            { threshold: 0.7 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Whimsy: dragging a folder near the viewport edge earns a mono whisper.
    // Direct style writes — no React state on pointermove.
    const handleDrag = useCallback((info: { x: number; y: number; event: PointerEvent }) => {
        const el = whisperRef.current;
        if (!el) return;
        const { clientX, clientY } = info.event;
        const m = 110;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const near = clientX < m || clientX > w - m || clientY < m || clientY > h - m;
        if (near !== whisperOn.current) {
            whisperOn.current = near;
            el.style.opacity = near ? "1" : "0";
        }
        if (near) {
            const x = Math.min(Math.max(clientX - 140, 16), w - 300);
            const y = Math.min(Math.max(clientY + 84 > h - 24 ? clientY - 56 : clientY + 44, 16), h - 48);
            el.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        whisperOn.current = false;
        const el = whisperRef.current;
        if (el) el.style.opacity = "0";
    }, []);

    return (
        <div className="relative mx-auto mt-20 max-w-[1200px] px-6">
            <Callsign style={{ textAlign: "center", marginBottom: 56 }}>
                {"exhibit 01 — the shelf · hands-on"}
            </Callsign>

            <div className="flex flex-wrap items-end justify-center gap-x-12 gap-y-20">
                {/* A-site executes — pinned, violet. */}
                <div className="relative">
                    <SpecNote
                        text="swings 3.4° from where you hold it — settles, never bounces"
                        style={{ left: -40, bottom: 132 }}
                        line={{ w: 90, h: 36, x1: 12, y1: 4, x2: 80, y2: 32 }}
                    />
                    <DraggableFolder tilt={-1.3} onDrag={handleDrag} onDragEnd={handleDragEnd}>
                        <FolderCard
                            name="A-site executes"
                            baseColor={palette.violet}
                            footer={"12 strats · Astra–Omen double smoke"}
                            nameAccessory={
                                <FaThumbtack
                                    size={10}
                                    aria-hidden
                                    style={{
                                        color: palette.favoriteAmber,
                                        transform: "rotate(38deg)",
                                        marginRight: 6,
                                        flexShrink: 0,
                                    }}
                                />
                            }
                        />
                    </DraggableFolder>
                </div>

                {/* Retakes — ally green. */}
                <div className="relative">
                    <SpecNote
                        text="front panel squashes 4.5% so the pocket gapes — paper physics"
                        style={{ top: 134, left: 56 }}
                        lineFirst
                        line={{ w: 70, h: 34, x1: 10, y1: 30, x2: 34, y2: 4 }}
                    />
                    <DraggableFolder tilt={0.9} onDrag={handleDrag} onDragEnd={handleDragEnd}>
                        <FolderCard
                            name="Retakes"
                            baseColor={palette.allyGreen}
                            footer={"9 strats · hit W together"}
                        />
                    </DraggableFolder>
                </div>

                {/* Anti-eco — pen blue. */}
                <div className="relative">
                    <SpecNote
                        text="220ms out-quart open · 180ms out-cubic close — asymmetric on purpose"
                        style={{ right: -50, bottom: 132 }}
                        align="right"
                        line={{ w: 90, h: 36, x1: 78, y1: 4, x2: 14, y2: 32 }}
                    />
                    <DraggableFolder tilt={-0.5} onDrag={handleDrag} onDragEnd={handleDragEnd}>
                        <FolderCard
                            name="Anti-eco"
                            baseColor="#3b82f6"
                            footer={"5 strats · respect the Sheriff"}
                        />
                    </DraggableFolder>
                </div>

                {/* Cursed strats — ember, wobbles once. */}
                <div className="relative">
                    <SpecNote
                        text="wobbles once on arrival. it knows what it is."
                        style={{ top: 134, right: -30 }}
                        align="right"
                        lineFirst
                        line={{ w: 70, h: 34, x1: 54, y1: 30, x2: 20, y2: 4 }}
                    />
                    <DraggableFolder
                        tilt={1.7}
                        innerRef={cursedRef}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                    >
                        <FolderCard
                            name="Cursed strats"
                            baseColor="#b25a33"
                            icon={<CursedIcon />}
                            footer={"3 strats · legally distinct from throwing"}
                            nameAccessory={
                                <span
                                    aria-hidden
                                    style={{
                                        fontFamily: MONO,
                                        fontSize: 8,
                                        letterSpacing: "0.14em",
                                        textTransform: "uppercase",
                                        color: lerpHex("#b25a33", "#ffffff", 0.4),
                                        border: `1px solid ${lerpHex("#b25a33", "#ffffff", 0.18)}`,
                                        borderRadius: 4,
                                        padding: "2px 5px",
                                        marginRight: 4,
                                        flexShrink: 0,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    do not run
                                </span>
                            }
                        />
                    </DraggableFolder>
                </div>
            </div>

            {/* The shelf ledge. */}
            <div
                aria-hidden
                className="mx-auto mt-1"
                style={{
                    maxWidth: 1080,
                    borderTop: "1px solid rgba(255, 255, 255, 0.10)",
                    boxShadow: "0 14px 28px -18px rgba(0, 0, 0, 0.9)",
                    height: 10,
                }}
            />

            <Callsign style={{ textAlign: "center", marginTop: 28 }}>
                {"pick one up — it hangs from where you grab it. the drag physics are the app's own, not a homage."}
            </Callsign>

            {/* Edge whisper (positioned via direct style writes during drag). */}
            <div
                ref={whisperRef}
                aria-hidden
                className="callsign"
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    zIndex: 70,
                    opacity: 0,
                    transition: "opacity 200ms ease",
                    pointerEvents: "none",
                    fontSize: 10,
                    color: palette.dim,
                    background: "rgba(9, 9, 11, 0.85)",
                    border: `1px solid ${palette.border}`,
                    borderRadius: 6,
                    padding: "6px 10px",
                    whiteSpace: "nowrap",
                }}
            >
                {WHISPER}
            </div>
        </div>
    );
}

/* ── Exhibit 03 — the reading room (personas) ──────────────────── */

const PERSONAS = [
    {
        name: "For the IGL",
        color: palette.violet,
        cover: "Mid-round calls, pre-barrier.",
        rising: "drawn before the barrier drops",
        footer: "Zero gap: open, click, draw.",
    },
    {
        name: "For the five-stack",
        color: palette.allyGreen,
        cover: "One code. Five on the same page.",
        rising: "no accounts — not even five",
        footer: "Share codes, not sign-ups.",
    },
    {
        name: "For the theorycrafter",
        color: "#3b82f6",
        cover: "Housing for 2 a.m. genius.",
        rising: "archive it. test it tuesday.",
        footer: "Folders deep enough to get lost in.",
    },
] as const;

function CoverSheet({ text }: { text: string }) {
    return (
        <PeekSheet>
            <div style={{ position: "absolute", inset: 0, padding: "7px 12px" }}>
                <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.35, color: palette.fg, fontWeight: 500 }}>
                    {text}
                </p>
            </div>
        </PeekSheet>
    );
}

function RisingSheet({ text, tone }: { text: string; tone: string }) {
    return (
        <PeekSheet>
            <div style={{ position: "absolute", inset: 0, padding: "5px 12px" }}>
                <p
                    style={{
                        margin: 0,
                        fontFamily: MONO,
                        fontSize: 9.5,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: tone,
                    }}
                >
                    {text}
                </p>
            </div>
        </PeekSheet>
    );
}

function ReadingRoom() {
    return (
        <section className="px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-[1140px] text-center">
                <Callsign>{"exhibit 03 — the reading room"}</Callsign>
                <SectionHeading>Three regulars.</SectionHeading>
                <BodyCopy>
                    {"Different jobs, same shelf. Hover a folder — the pocket already knows who it belongs to."}
                </BodyCopy>

                <div className="mt-16 flex flex-wrap items-start justify-center gap-x-10 gap-y-14">
                    {PERSONAS.map((p) => (
                        <div key={p.name} className="flex flex-col items-center">
                            <FolderCard
                                name={p.name}
                                baseColor={p.color}
                                scale={1.15}
                                footer={p.footer}
                                peeks={[
                                    <CoverSheet key="cover" text={p.cover} />,
                                    <RisingSheet key="rising" text={p.rising} tone={lerpHex(p.color, "#ffffff", 0.5)} />,
                                    <PeekSheet key="doodle" />,
                                ]}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Exhibit A — the board itself ──────────────────────────────── */

function BoardExhibit() {
    return (
        <section className="px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-[1020px]">
                <div className="text-center">
                    <Callsign>{"exhibit a — primary source"}</Callsign>
                    <SectionHeading>The board itself.</SectionHeading>
                </div>

                <div className="relative mt-12">
                    <div
                        style={{
                            borderRadius: 14,
                            overflow: "hidden",
                            border: "1px solid rgba(255, 255, 255, 0.10)",
                            boxShadow: "0 40px 90px -40px rgba(0, 0, 0, 0.9)",
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

                    {/* Museum placard, overlapping the frame. */}
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
                        <p
                            className="callsign"
                            style={{ margin: 0, fontSize: 10, color: palette.muted }}
                        >
                            {"exhibit a — the board itself"}
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.55, color: palette.muted }}>
                            {"60fps canvas, keyboard-first, yours. Mixed media: Flutter on Windows, 31 MB. On loan from your own machine."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── The gift shop — download ──────────────────────────────────── */

function GiftShop() {
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
                <Callsign>{"the gift shop — everything is free"}</Callsign>
                <SectionHeading>The last exhibit is a download button.</SectionHeading>
                <BodyCopy>
                    {"Icarus has exactly one shader. It doesn't decorate a hero section — it plays when you get something: the update dialog burns violet while a new build lands. Here it is, wired to the real installer. Celebration, as a function."}
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
                        {"dither_fire.frag — plays on download. this one is live."}
                    </span>
                </div>

                <div style={{ padding: "26px 28px 28px", textAlign: "center" }}>
                    <ProgressButton
                        href={win.url}
                        label="Download for Windows"
                        downloadingLabel={(p) => `Downloading… ${p}%`}
                        doneLabel="In your downloads. Go draw."
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

export default function FunctionalLoveClient() {
    return (
        <div className="fl-page relative overflow-x-clip">
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
                {"Concept 02/05 — Functional Love"}
            </Link>

            {/* Hero + shelf. */}
            <section className="relative overflow-hidden pb-24 pt-28 sm:pt-36">
                <div
                    aria-hidden
                    className="tactical-dots absolute inset-0"
                    style={{
                        opacity: 0.6,
                        maskImage: "radial-gradient(900px 520px at 50% 22%, black, transparent)",
                        WebkitMaskImage: "radial-gradient(900px 520px at 50% 22%, black, transparent)",
                    }}
                />
                <div className="relative mx-auto max-w-[1140px] px-6 text-center">
                    <Callsign>{"the icarus archive — room 02"}</Callsign>
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
                        Every pixel is load-bearing.
                    </h1>
                    <p
                        style={{
                            margin: "26px auto 0",
                            maxWidth: 640,
                            fontFamily: MONO,
                            fontSize: 12,
                            lineHeight: 1.7,
                            letterSpacing: "0.06em",
                            color: palette.dim,
                        }}
                    >
                        {"functional love (n.) — care for the user, shipped as working parts instead of ornament."}
                    </p>
                    <BodyCopy style={{ maxWidth: 620 }}>
                        {"Icarus is a free, open-source VALORANT strategy planner: draw the call, file the strat, hand your five-stack a code. Everything below is a real part from the app — not an illustration. Handle the exhibits."}
                    </BodyCopy>
                    <p style={{ margin: "18px 0 0" }}>
                        <a
                            href="#download"
                            className="callsign"
                            style={{ fontSize: 10, color: palette.muted, textDecoration: "none" }}
                        >
                            {"or skip to the gift shop ↓"}
                        </a>
                    </p>
                </div>

                <Shelf />
            </section>

            {/* Exhibit 02 — the filing cabinet. */}
            <section className="px-6 py-24 sm:py-28">
                <div className="mx-auto max-w-[1140px] text-center">
                    <Callsign>{"exhibit 02 — the filing cabinet · interactive"}</Callsign>
                    <SectionHeading>Filing is the feature.</SectionHeading>
                    <BodyCopy>
                        {"No accounts. No servers. No spinner asking you to wait for your own ideas. Saving a strat in Icarus means a sheet goes into a folder on your machine — and that is the entire supply chain. Try it."}
                    </BodyCopy>
                    <div className="mt-16">
                        <FilingExhibit />
                    </div>
                </div>
            </section>

            <ReadingRoom />
            <BoardExhibit />
            <GiftShop />

            {/* Footer. */}
            <footer className="border-t px-6 py-10" style={{ borderColor: "rgba(255, 255, 255, 0.07)" }}>
                <div className="mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="callsign" style={{ margin: 0, fontSize: 10, color: palette.dim }}>
                        {"concept 02/05 — the icarus archive · every exhibit is a real part from the app"}
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
