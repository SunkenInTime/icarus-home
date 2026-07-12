"use client";

/**
 * The desk debris — five lovingly art-directed artifacts of how strats
 * actually live today, plus the clean strat tiles they become once filed.
 * Pure HTML/CSS/SVG; the filing "ghost" reuses the same components so the
 * scrap you drop is the scrap that flies into the pocket.
 */

export type ScrapId = "napkin" | "chat" | "notes" | "graph" | "crumple";

export const SCRAP_SIZES: Record<ScrapId, { w: number; h: number }> = {
    napkin: { w: 200, h: 184 },
    chat: { w: 252, h: 150 },
    notes: { w: 216, h: 186 },
    graph: { w: 200, h: 150 },
    crumple: { w: 128, h: 122 },
};

/** What each scrap becomes once Icarus gets its hands on it. */
export const CLEAN_STRATS: Record<ScrapId, { title: string; map: string }> = {
    napkin: { title: "B Execute — Double Flash", map: "Bind" },
    chat: { title: "A Hit — Jett Entry", map: "Ascent" },
    notes: { title: "Long Control — Smoke Default", map: "Haven" },
    graph: { title: "Snake Bite — B from Spawn", map: "Bind" },
    crumple: { title: "B Retake — Post-plant", map: "Split" },
};

const RED_PEN = "#c23b32";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

/* ── Exhibit A: the napkin ─────────────────────────────────────── */

function Napkin() {
    const { w, h } = SCRAP_SIZES.napkin;
    return (
        <div
            style={{
                width: w,
                height: h,
                position: "relative",
                background:
                    "radial-gradient(120% 95% at 30% 24%, #f3f0e6 0%, #e9e4d4 55%, #ded7c2 100%)",
                borderRadius: "16px 22px 14px 24px / 20px 16px 22px 15px",
                boxShadow:
                    "0 4px 12px rgba(0,0,0,0.54), inset 0 0 22px rgba(120,105,70,0.14)",
            }}
        >
            {/* fold creases */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    left: "50%",
                    top: 6,
                    bottom: 6,
                    width: 1,
                    background: "rgba(90,75,45,0.10)",
                }}
            />
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: "54%",
                    left: 6,
                    right: 6,
                    height: 1,
                    background: "rgba(90,75,45,0.08)",
                }}
            />
            {/* the (suspiciously perfect) coffee ring */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    right: 14,
                    top: 12,
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    border: "6px solid rgba(128,84,44,0.30)",
                    boxShadow:
                        "0 0 0 2px rgba(128,84,44,0.10), inset 0 0 6px rgba(128,84,44,0.14)",
                }}
            />
            {/* red pen: the entire B execute */}
            <svg
                viewBox={`0 0 ${w} ${h}`}
                aria-hidden
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                fill="none"
                stroke={RED_PEN}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* the site, drawn from memory */}
                <path d="M108 56 C 124 53, 144 54, 160 57 C 163 71, 162 86, 159 100 C 143 103, 124 102, 109 99 C 107 85, 106 70, 108 56 Z" />
                {/* a hand-drawn B */}
                <path d="M117 64 C 118 71, 118 78, 117 85" />
                <path d="M117 64 C 126 62, 128 70, 118 74 C 129 75, 130 84, 117 85" />
                {/* the two guys who are always there */}
                <path d="M142 64 l 8 8 M150 64 l -8 8" strokeWidth={2} />
                <path d="M134 84 l 8 8 M142 84 l -8 8" strokeWidth={2} />
                {/* the arrow that started it all */}
                <path d="M24 146 C 50 142, 72 122, 96 96" strokeWidth={2.6} />
                <path d="M96 96 l -11 3 m 11 -3 l -3 11" strokeWidth={2.6} />
                {/* emphasis scribble (meaning unclear, energy clear) */}
                <path d="M28 158 C 36 162, 44 156, 52 160 C 60 164, 66 158, 72 161" strokeWidth={1.8} />
            </svg>
        </div>
    );
}

/* ── Exhibit B: the group chat ─────────────────────────────────── */

function ChatScrap() {
    const { w } = SCRAP_SIZES.chat;
    return (
        <div
            style={{
                width: w,
                background: "#1b1c21",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 10,
                padding: "12px 14px 10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.54)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                    aria-hidden
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #41434b, #26272c)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#a1a1aa",
                        flexShrink: 0,
                    }}
                >
                    C
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>capfrag</span>
                <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#71717a" }}>
                    today at 11:47 PM
                </span>
            </div>
            <p
                style={{
                    margin: "8px 0 0",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "#d4d4d8",
                }}
            >
                ok new plan. jett u flash mid. no wait. actually—
            </p>
            <div
                style={{
                    marginTop: 6,
                    textAlign: "right",
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: "#71717a",
                }}
            >
                seen 11:58 PM
            </div>
            {/* the typing indicator that gives up */}
            <div
                className="scraps-typing"
                aria-hidden
                style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}
            >
                <i />
                <i />
                <i />
                <span
                    style={{
                        marginLeft: 4,
                        fontFamily: MONO,
                        fontSize: 9.5,
                        color: "#71717a",
                    }}
                >
                    capfrag is typing…
                </span>
            </div>
        </div>
    );
}

/* ── Exhibit C: the notes screenshot ───────────────────────────── */

function NotesScrap() {
    const { w } = SCRAP_SIZES.notes;
    return (
        <div
            style={{
                width: w,
                background: "#f6f3ea",
                borderRadius: 10,
                padding: "8px 14px 14px",
                color: "#1c1c1e",
                boxShadow: "0 4px 12px rgba(0,0,0,0.54)",
            }}
        >
            {/* the status bar that proves it is a screenshot */}
            <div
                aria-hidden
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: MONO,
                    fontSize: 8.5,
                    color: "#8e8e93",
                }}
            >
                <span>9:41</span>
                <svg width="18" height="8" viewBox="0 0 18 8" aria-hidden>
                    <rect x="0.5" y="0.5" width="14" height="7" rx="2" fill="none" stroke="#8e8e93" />
                    <rect x="2" y="2" width="7" height="4" rx="1" fill="#8e8e93" />
                    <rect x="15.5" y="2.5" width="2" height="3" rx="1" fill="#8e8e93" />
                </svg>
            </div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
                STRATS (REAL)(FINAL)(v2)
            </div>
            <div style={{ marginTop: 2, fontFamily: MONO, fontSize: 9, color: "#8e8e93" }}>
                edited march 3, 2:14 AM
            </div>
            <div
                aria-hidden
                style={{ margin: "9px 0", height: 1, background: "rgba(0,0,0,0.09)" }}
            />
            <ul
                style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    fontSize: 12,
                    lineHeight: 1.65,
                    color: "#48484a",
                }}
            >
                <li>- haven long: smoke the thing, then the other thing</li>
                <li>- if they rush B just kinda… be ready</li>
                <li>- ask marcus about the</li>
            </ul>
        </div>
    );
}

/* ── Exhibit D: the torn graph paper ───────────────────────────── */

function GraphScrap() {
    const { w, h } = SCRAP_SIZES.graph;
    return (
        <div style={{ width: w, height: h, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}>
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    background: "#edf0e9",
                    backgroundImage:
                        "linear-gradient(to right, rgba(96,130,180,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(96,130,180,0.22) 1px, transparent 1px)",
                    backgroundSize: "13px 13px",
                    clipPath:
                        "polygon(0 0, 79% 0, 84% 7%, 77% 14%, 85% 22%, 79% 31%, 87% 40%, 80% 49%, 88% 58%, 81% 67%, 89% 76%, 82% 85%, 90% 93%, 83% 100%, 0 100%)",
                }}
            >
                <svg
                    viewBox={`0 0 ${w} ${h}`}
                    aria-hidden
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                    fill="none"
                    stroke="#46628f"
                    strokeLinecap="round"
                >
                    <text
                        x="14"
                        y="18"
                        fontSize="8"
                        fill="#7a8699"
                        stroke="none"
                        style={{ fontFamily: MONO, letterSpacing: "0.12em" }}
                    >
                        FIG. 1 — B FROM SPAWN
                    </text>
                    {/* you, standing on the box */}
                    <path d="M32 114 l 8 8 M40 114 l -8 8" strokeWidth={2} />
                    {/* the throw */}
                    <path d="M42 112 Q 100 28, 152 50" strokeWidth={2} strokeDasharray="6 6" />
                    {/* where it lands (allegedly) */}
                    <circle cx="156" cy="53" r="9" strokeWidth={2} />
                    <circle cx="156" cy="53" r="1.6" fill="#46628f" stroke="none" />
                    {/* the crucial detail, torn off */}
                    <text
                        x="14"
                        y="138"
                        fontSize="10"
                        fill="#5b6a80"
                        stroke="none"
                        fontStyle="italic"
                    >
                        stand on the box, aim at the—
                    </text>
                </svg>
            </div>
        </div>
    );
}

/* ── Exhibit E: the crumpled ball ──────────────────────────────── */

function CrumpleScrap() {
    const { w, h } = SCRAP_SIZES.crumple;
    return (
        <div
            className="scraps-crumple"
            style={{
                width: w,
                height: h,
                position: "relative",
                background:
                    "radial-gradient(60% 55% at 32% 30%, #babbc1 0%, rgba(186,187,193,0) 70%), radial-gradient(50% 45% at 70% 62%, #94959b 0%, rgba(148,149,155,0) 75%), radial-gradient(80% 80% at 50% 50%, #85868c 0%, #5e5f65 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.54), inset -6px -8px 18px rgba(0,0,0,0.28)",
            }}
        >
            <svg
                className="scraps-creases"
                viewBox={`0 0 ${w} ${h}`}
                aria-hidden
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <g stroke="rgba(28,28,32,0.35)" strokeWidth={1.3}>
                    <path d="M22 34 L52 50 L36 78" />
                    <path d="M88 20 L70 52 L100 66" />
                    <path d="M30 96 L58 78 L74 104" />
                    <path d="M60 14 L64 40" />
                </g>
                <g stroke="rgba(255,255,255,0.28)" strokeWidth={1.1}>
                    <path d="M40 42 L58 56" />
                    <path d="M78 58 L92 74" />
                    <path d="M50 90 L66 96" />
                </g>
            </svg>
            {/* the strat it could still be — peeks out as it un-crumples */}
            <svg
                className="scraps-peek"
                viewBox={`0 0 ${w} ${h}`}
                aria-hidden
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0 }}
                fill="none"
                stroke={RED_PEN}
                strokeWidth={2}
                strokeLinecap="round"
            >
                <path d="M42 74 C 56 64, 70 58, 86 50" />
                <path d="M86 50 l -9 1 m 9 -1 l -2 9" />
            </svg>
        </div>
    );
}

/* ── Dispatcher ────────────────────────────────────────────────── */

export default function ScrapArt({ id }: { id: ScrapId }) {
    switch (id) {
        case "napkin":
            return <Napkin />;
        case "chat":
            return <ChatScrap />;
        case "notes":
            return <NotesScrap />;
        case "graph":
            return <GraphScrap />;
        case "crumple":
            return <CrumpleScrap />;
    }
}

/* ── The clean versions ────────────────────────────────────────── */

function StratGlyph({ size = 40 }: { size?: number }) {
    const h = size * 0.85;
    return (
        <svg width={size} height={h} viewBox="0 0 40 34" aria-hidden style={{ flexShrink: 0 }}>
            <circle
                cx="8"
                cy="26"
                r="4.5"
                fill="rgba(105,240,175,0.16)"
                stroke="rgba(105,240,175,0.55)"
                strokeWidth="1.6"
            />
            <path
                d="M12 23 C 19 17, 25 12, 33 7"
                stroke="#fafafa"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M33 7 l -7 0.5 m 7 -0.5 l -2.5 6.5"
                stroke="#fafafa"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

/** The strat-tile chip that materializes above the folder on file. */
export function CleanChip({ id }: { id: ScrapId }) {
    const info = CLEAN_STRATS[id];
    return (
        <div
            style={{
                width: 224,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                background: "#141416",
                backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "9.5px 9.5px",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
        >
            <StratGlyph />
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#fafafa",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {info.title}
                </div>
                <div
                    style={{
                        marginTop: 2,
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#71717a",
                    }}
                >
                    {info.map} · filed just now
                </div>
            </div>
        </div>
    );
}

/** Pocket-sheet content for the playbook folder (renders inside PeekSheet). */
export function MiniStrat({ id }: { id: ScrapId }) {
    const info = CLEAN_STRATS[id];
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 16px",
            }}
        >
            <StratGlyph size={32} />
            <div style={{ minWidth: 0, textAlign: "left" }}>
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#e4e4e7",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {info.title}
                </div>
                <div
                    style={{
                        marginTop: 2,
                        fontFamily: MONO,
                        fontSize: 8,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#71717a",
                    }}
                >
                    {info.map}
                </div>
            </div>
        </div>
    );
}
