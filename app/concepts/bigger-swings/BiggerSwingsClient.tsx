"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import CloserToTheSunClient, {
    SHIPPED_SWINGS,
    type BigSwings,
} from "../closer-to-the-sun/CloserToTheSunClient";
import {
    DEPTH_RANGE,
    HEAT_RANGE,
    PRE_ECHO_SHAPES,
    shapeDefaults,
    shapeTakesDepth,
    type PreEchoShape,
} from "../closer-to-the-sun/SunPreEcho";
import { palette } from "../_shared/tokens";

/**
 * A judging rig for the open questions on the homepage. It renders the real
 * production page, not a mock, with each idea behind a flag — so what you are
 * looking at is what would ship.
 *
 * The controls live in a bar along the bottom edge rather than a floating card:
 * everything being judged is in the top two thirds of the hero, and a card tall
 * enough to hold this many controls covered the corner the sun lives in.
 *
 * Flags are independent rather than mutually exclusive. The interesting
 * questions are about combinations — whether two backdrop effects fight, and
 * whether the headline treatments read as one gesture or two.
 */

type FlagKey = "preEcho" | "pointerField" | "reorder" | "wordReveal" | "drawnUnderline";

type Entry = {
    key: FlagKey;
    shortcut: string;
    name: string;
    claim: string;
    against: string;
};

const SWINGS: Entry[] = [
    {
        key: "preEcho",
        shortcut: "1",
        name: "Sun pre-echo",
        claim: "A cold slice of the sun's own dither field brought up into the hero, so the payoff at the bottom is foreshadowed instead of arriving from nowhere.",
        against: "A foreshadowed sun may be a spent one. Also a second WebGL context above the fold.",
    },
    {
        key: "pointerField",
        shortcut: "2",
        name: "Pointer-lit backdrop",
        claim: "The torchlight pool from the extras section, moved to the hero and steered by the cursor. The first screen finally answers something other than scroll.",
        against: "Replaces the static dot grid, so the hero reads warmer and less tactical. Does nothing on touch.",
    },
    {
        key: "reorder",
        shortcut: "3",
        name: "Lead with the demo",
        claim: "Agent bar before the three claims, so the reward for the first scroll is a moving product shot rather than three columns of text.",
        against: "Spends the strongest demo early, and the claims then have to hold the middle of the page.",
    },
];

const TEXT: Entry[] = [
    {
        key: "wordReveal",
        shortcut: "4",
        name: "Word cascade",
        claim: "The headline arrives a word at a time instead of as one block, so the first thing that happens on the page is writing rather than appearing.",
        against: "Six staggered animations is a lot of ceremony for six words, and it delays the sentence being readable as a sentence.",
    },
    {
        key: "drawnUnderline",
        shortcut: "5",
        name: "Drawn underline",
        claim: "A violet pen stroke draws itself under \u201cflies\u201d once the headline lands. The product is a pen; this is the page using it on itself.",
        against: "Underlining the payoff word is close to explaining the joke, and it spends the accent colour the download button owns.",
    },
];

const SHAPE_NOTES: Record<PreEchoShape, string> = {
    corona: "Pooled around the sun, so the field reads as the sun's own heat. Hidden below sm, where the sun is hidden too.",
    hairline: "A 340px band at the top edge, heat 0.27 — enough to read as sky without sitting on the copy.",
    vignette: "The four corners of the first screen, centre left clean. Belongs to the page rather than the sun, so it holds at any width.",
    sunward: "The vignette pulled off-centre so the sun's corner burns hottest. Corona's motivation, vignette's reach.",
    horizon: "The original: a full-width wash across the top. Best-looking field, worst place for it.",
};

const ALL = [...SWINGS, ...TEXT];
const PANEL_BG = "rgba(9,9,11,0.93)";
const HAIRLINE = "rgba(255,255,255,0.1)";

function Chip({
    on,
    onClick,
    label,
    shortcut,
}: {
    on: boolean;
    onClick: () => void;
    label: string;
    shortcut?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={on}
            className="font-label flex items-center gap-2 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors"
            style={{
                borderColor: on ? palette.violet : HAIRLINE,
                background: on ? "rgba(124,58,237,0.18)" : "transparent",
                color: on ? palette.fg : palette.muted,
            }}
        >
            {shortcut && (
                <span
                    aria-hidden
                    className="grid h-4 w-4 place-items-center rounded text-[9px]"
                    style={{
                        background: on ? palette.violet : "rgba(255,255,255,0.07)",
                        color: on ? "#fff" : palette.dim,
                    }}
                >
                    {shortcut}
                </span>
            )}
            {label}
        </button>
    );
}

function Dial({
    label,
    range,
    value,
    format,
    onChange,
}: {
    label: string;
    range: { min: number; max: number; step: number };
    value: number;
    format: (value: number) => string;
    onChange: (value: number) => void;
}) {
    return (
        <label className="flex items-center gap-2">
            <span className="font-label text-[10px] uppercase tracking-[0.1em]" style={{ color: palette.muted }}>
                {label}
            </span>
            <input
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-1 w-[86px] cursor-pointer"
                style={{ accentColor: palette.violet }}
            />
            <span
                className="font-label w-[38px] text-[10px] tabular-nums"
                style={{ color: palette.fg }}
            >
                {format(value)}
            </span>
        </label>
    );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="callsign whitespace-nowrap" style={{ color: palette.dim }}>
                {label}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">{children}</div>
        </div>
    );
}

export default function BiggerSwingsClient() {
    const [swings, setSwings] = useState<BigSwings>(SHIPPED_SWINGS);
    const [replay, setReplay] = useState(0);
    const [notesOpen, setNotesOpen] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    const toggle = useCallback((key: FlagKey) => {
        setSwings((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    // Picking a shape implies wanting to see it, so it arms the swing too, and
    // clears any dialled-in values that belonged to the previous shape.
    const pickShape = useCallback((shape: PreEchoShape) => {
        setSwings((prev) => ({
            ...prev,
            preEcho: true,
            preEchoShape: shape,
            preEchoDepth: undefined,
            preEchoHeat: undefined,
        }));
    }, []);

    const cycleShape = useCallback(() => {
        setSwings((prev) => {
            const current = prev.preEchoShape ?? SHIPPED_SWINGS.preEchoShape ?? PRE_ECHO_SHAPES[0];
            const next =
                PRE_ECHO_SHAPES[
                    (PRE_ECHO_SHAPES.indexOf(current) + 1) % PRE_ECHO_SHAPES.length
                ];
            return {
                ...prev,
                preEcho: true,
                preEchoShape: next,
                preEchoDepth: undefined,
                preEchoHeat: undefined,
            };
        });
    }, []);

    const reset = useCallback(() => setSwings(SHIPPED_SWINGS), []);

    // Replaying remounts the page, which is also how the load choreography
    // (hero reveal, word cascade, underline, traveler entrance) gets watched
    // more than once.
    const replayLoad = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        setReplay((n) => n + 1);
    }, []);

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            const target = event.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

            const entry = ALL.find((candidate) => candidate.shortcut === event.key);
            if (entry) {
                toggle(entry.key);
                return;
            }
            if (event.key === "0") reset();
            if (event.key.toLowerCase() === "s") cycleShape();
            if (event.key.toLowerCase() === "r") replayLoad();
            if (event.key.toLowerCase() === "h") setNotesOpen((open) => !open);
            if (event.key.toLowerCase() === "c") setCollapsed((shut) => !shut);
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [cycleShape, replayLoad, reset, toggle]);

    const shape = swings.preEchoShape ?? SHIPPED_SWINGS.preEchoShape ?? PRE_ECHO_SHAPES[0];
    const active = ALL.filter((entry) => swings[entry.key]);
    const defaults = shapeDefaults(shape);
    const depth = swings.preEchoDepth ?? defaults.depth;
    const heat = swings.preEchoHeat ?? defaults.heat;

    return (
        <>
            {/* Reordering moves the flight-path anchors, and FlightPath only
                rebuilds on resize — so that swing needs a fresh mount. */}
            <CloserToTheSunClient
                key={`${swings.reorder ? "reordered" : "shipped"}-${replay}`}
                swings={swings}
            />

            {collapsed ? (
                <button
                    type="button"
                    onClick={() => setCollapsed(false)}
                    className="font-label fixed bottom-4 right-4 z-50 rounded-lg border px-3 py-2 text-[11px] backdrop-blur"
                    style={{
                        borderColor: HAIRLINE,
                        background: PANEL_BG,
                        color: palette.muted,
                    }}
                >
                    <span className="callsign" style={{ color: palette.violet }}>
                        bigger swings
                    </span>
                    <span className="ml-2" style={{ color: palette.dim }}>
                        {active.length ? `${active.length} on` : "baseline"}
                    </span>
                </button>
            ) : (
                <div
                    className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur"
                    style={{ borderColor: HAIRLINE, background: PANEL_BG }}
                >
                    {notesOpen && (
                        <div
                            className="border-b px-5 py-3"
                            style={{ borderColor: "rgba(255,255,255,0.07)" }}
                        >
                            {active.length === 0 ? (
                                <p
                                    className="text-[12.5px] leading-[1.6]"
                                    style={{ color: palette.muted }}
                                >
                                    Baseline: nothing extra. 0 returns to what ships today —
                                    hairline pre-echo, word cascade, the smaller corner sun.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-x-8 gap-y-3">
                                    {active.map((entry) => (
                                        <div key={entry.key} className="max-w-[340px]">
                                            <p
                                                className="text-[12.5px] leading-[1.55]"
                                                style={{ color: palette.muted }}
                                            >
                                                <span style={{ color: palette.fg }}>
                                                    {entry.name}.
                                                </span>{" "}
                                                {entry.claim}
                                            </p>
                                            <p
                                                className="mt-1 text-[12px] leading-[1.5]"
                                                style={{ color: palette.dim }}
                                            >
                                                Against: {entry.against}
                                            </p>
                                            {entry.key === "preEcho" && (
                                                <p
                                                    className="mt-1.5 text-[12px] leading-[1.5]"
                                                    style={{ color: palette.lavender }}
                                                >
                                                    {shape}: {SHAPE_NOTES[shape]} Dialled to{" "}
                                                    {shapeTakesDepth(shape)
                                                        ? `${depth}px / heat ${heat.toFixed(2)}`
                                                        : `heat ${heat.toFixed(2)}`}
                                                    .
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 px-5 py-3">
                        <Group label="swings">
                            {SWINGS.map((entry) => (
                                <Chip
                                    key={entry.key}
                                    on={Boolean(swings[entry.key])}
                                    onClick={() => toggle(entry.key)}
                                    label={entry.name}
                                    shortcut={entry.shortcut}
                                />
                            ))}
                        </Group>

                        {swings.preEcho && (
                            <>
                                <Group label="where it sits">
                                    {PRE_ECHO_SHAPES.map((option) => (
                                        <Chip
                                            key={option}
                                            on={shape === option}
                                            onClick={() => pickShape(option)}
                                            label={option}
                                        />
                                    ))}
                                </Group>

                                <Group label="dial it">
                                    {shapeTakesDepth(shape) && depth != null && (
                                        <Dial
                                            label="depth"
                                            range={DEPTH_RANGE}
                                            value={depth}
                                            format={(value) => `${value}px`}
                                            onChange={(value) =>
                                                setSwings((prev) => ({
                                                    ...prev,
                                                    preEchoDepth: value,
                                                }))
                                            }
                                        />
                                    )}
                                    <Dial
                                        label="heat"
                                        range={HEAT_RANGE}
                                        value={heat}
                                        format={(value) => value.toFixed(2)}
                                        onChange={(value) =>
                                            setSwings((prev) => ({
                                                ...prev,
                                                preEchoHeat: value,
                                            }))
                                        }
                                    />
                                </Group>
                            </>
                        )}

                        <Group label="headline">
                            {TEXT.map((entry) => (
                                <Chip
                                    key={entry.key}
                                    on={Boolean(swings[entry.key])}
                                    onClick={() => toggle(entry.key)}
                                    label={entry.name}
                                    shortcut={entry.shortcut}
                                />
                            ))}
                        </Group>

                        <div className="ml-auto flex items-center gap-4">
                            <button
                                type="button"
                                onClick={replayLoad}
                                className="font-label whitespace-nowrap text-[11px] transition-colors hover:text-white"
                                style={{ color: palette.muted }}
                            >
                                Replay
                            </button>
                            <button
                                type="button"
                                onClick={reset}
                                className="font-label whitespace-nowrap text-[11px] transition-colors hover:text-white"
                                style={{ color: palette.muted }}
                            >
                                Baseline
                            </button>
                            <button
                                type="button"
                                onClick={() => setNotesOpen((open) => !open)}
                                className="font-label whitespace-nowrap text-[11px] transition-colors hover:text-white"
                                style={{ color: palette.muted }}
                            >
                                Notes
                            </button>
                            <button
                                type="button"
                                onClick={() => setCollapsed(true)}
                                className="font-label whitespace-nowrap text-[11px] transition-colors hover:text-white"
                                style={{ color: palette.muted }}
                            >
                                Hide
                            </button>
                            <Link
                                href="/concepts"
                                className="font-label whitespace-nowrap text-[11px] transition-colors hover:text-white"
                                style={{ color: palette.dim }}
                            >
                                Concepts
                            </Link>
                            <span
                                className="font-label whitespace-nowrap text-[10px]"
                                style={{ color: palette.dim }}
                            >
                                1&ndash;5 · S shape · 0 · R · H · C
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
