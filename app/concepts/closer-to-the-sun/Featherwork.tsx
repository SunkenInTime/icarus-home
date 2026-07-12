"use client";

import { useState } from "react";
import { easing, palette } from "../_shared/tokens";
import WingGlyph from "./WingGlyph";

/**
 * Features as featherwork: the wing exploded into its parts. Five feathers
 * fan from a single quill point; hover or focus one and it fans out a few
 * degrees (150ms, out-cubic) while its note card fills the panel beside it.
 * Below md the diagram gives way to a plain stack of cards.
 */

type Feather = {
    tag: string;
    title: string;
    body: string;
    angle: number; // degrees clockwise from horizontal
    length: number;
};

const FEATHERS: Feather[] = [
    {
        tag: "primary feather",
        title: "The pen",
        body: "Five colors, three weights, arrows, dashes. Round caps, zero lag. It draws the second you do.",
        angle: 6,
        length: 380,
    },
    {
        tag: "secondary feather",
        title: "Share codes",
        body: "One code hands your five-stack the whole strat. No account on either end.",
        angle: 24,
        length: 330,
    },
    {
        tag: "covert feather",
        title: "Folders",
        body: "They open when you bring them things. Strats file themselves into maps, sites, set pieces.",
        angle: 42,
        length: 280,
    },
    {
        tag: "down feather",
        title: "The canvas",
        body: "60fps, native desktop. You feel the board, not the software.",
        angle: 60,
        length: 228,
    },
    {
        tag: "wax",
        title: "Auto-updates",
        body: "Reapplied in days, not quarters. Fixes ship while the meta is still warm.",
        angle: 78,
        length: 180,
    },
];

const FLOCK = [
    { role: "igl", line: "Calls the round from a board that keeps up with the call." },
    { role: "five-stack", line: "One code and everyone is reading the same play." },
    { role: "theorycrafter", line: "A home for lineups too weird to say out loud." },
] as const;

const QUILL = { x: 44, y: 56 };

function featherOutline(length: number): string {
    const w = Math.max(9, length * 0.048);
    return [
        `M 0 0`,
        `C ${length * 0.3} ${-w}, ${length * 0.75} ${-w * 0.9}, ${length} 0`,
        `C ${length * 0.75} ${w * 0.9}, ${length * 0.3} ${w}, ${length * 0.06} ${w * 0.22}`,
        "Z",
    ].join(" ");
}

function FeatherCard({ feather, index }: { feather: Feather; index: number }) {
    return (
        <div
            className="rounded-xl border p-6"
            style={{ background: palette.card, borderColor: palette.border }}
        >
            <div className="flex items-baseline justify-between">
                <span className="callsign" style={{ color: palette.lavender }}>
                    {feather.tag}
                </span>
                <span className="font-mono text-[10px]" style={{ color: palette.dim }}>
                    {String(index + 1).padStart(2, "0")}/{String(FEATHERS.length).padStart(2, "0")}
                </span>
            </div>
            <h3 className="font-onest mt-3 text-[22px] font-semibold" style={{ letterSpacing: "-0.01em" }}>
                {feather.title}
            </h3>
            <p className="mt-2 text-[14.5px] leading-[1.65]" style={{ color: palette.muted }}>
                {feather.body}
            </p>
        </div>
    );
}

export default function Featherwork() {
    const [active, setActive] = useState(0);

    return (
        <section className="relative py-28 sm:py-36">
            {/* Flight path waypoint: the wing banks right through this section. */}
            <span
                data-flight-anchor
                aria-hidden
                className="absolute right-[10%] top-[26%] h-2 w-2"
            />

            <div className="mx-auto max-w-[1160px] px-6">
                <div className="max-w-2xl">
                    <p className="callsign" style={{ color: palette.dim }}>
                        featherwork · alt 3,200 m
                    </p>
                    <h2
                        className="font-onest mt-3"
                        style={{
                            fontSize: "clamp(30px, 4vw, 48px)",
                            lineHeight: 1.06,
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Built like a wing.
                        <br />
                        <span style={{ color: palette.muted }}>Because it is one.</span>
                    </h2>
                    <p className="mt-4 max-w-md text-[15px] leading-[1.6]" style={{ color: palette.muted }}>
                        Every feature earns its place on the airframe. Nothing decorative except the
                        parts that are.
                    </p>
                </div>

                {/* Desktop: the wing diagram + note panel. */}
                <div className="mt-14 hidden items-start gap-12 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <svg
                        viewBox="0 0 560 420"
                        className="w-full max-w-[560px]"
                        role="group"
                        aria-label="Wing diagram of Icarus features"
                    >
                        {/* Quill point. */}
                        <circle cx={QUILL.x} cy={QUILL.y} r={4} fill="none" stroke={palette.dim} strokeWidth={2} />

                        {FEATHERS.map((feather, i) => {
                            const isActive = i === active;
                            const hoverFan = isActive ? 4 : 0;
                            const stroke = isActive ? palette.lavender : "rgba(250,250,250,0.55)";
                            return (
                                <g
                                    key={feather.tag}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`${feather.tag} — ${feather.title}. ${feather.body}`}
                                    onPointerEnter={() => setActive(i)}
                                    onFocus={() => setActive(i)}
                                    style={{
                                        transform: `translate(${QUILL.x}px, ${QUILL.y}px) rotate(${feather.angle + hoverFan}deg)`,
                                        transition: `transform 150ms ${easing.outCubic}`,
                                        cursor: "pointer",
                                        outline: "none",
                                    }}
                                >
                                    <path
                                        d={featherOutline(feather.length)}
                                        fill={isActive ? "rgba(124,58,237,0.08)" : "rgba(250,250,250,0.02)"}
                                        stroke={stroke}
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ transition: `stroke 150ms ${easing.outCubic}, fill 150ms ${easing.outCubic}` }}
                                    />
                                    <path
                                        d={`M ${feather.length * 0.08} 0 L ${feather.length * 0.9} 0`}
                                        stroke={isActive ? "rgba(196,181,253,0.5)" : "rgba(250,250,250,0.18)"}
                                        strokeWidth={1.5}
                                        strokeLinecap="round"
                                        style={{ transition: `stroke 150ms ${easing.outCubic}` }}
                                    />
                                    <text
                                        x={feather.length + 14}
                                        y={4}
                                        fill={isActive ? palette.lavender : palette.dim}
                                        style={{
                                            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                                            fontSize: 10,
                                            letterSpacing: "0.12em",
                                            transition: `fill 150ms ${easing.outCubic}`,
                                        }}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    <div className="md:sticky md:top-28" style={{ minHeight: 220 }}>
                        <FeatherCard feather={FEATHERS[active]} index={active} />
                        <p className="callsign mt-4" style={{ color: palette.dim, fontSize: 10 }}>
                            hover a feather. or tab through them — they don&rsquo;t mind.
                        </p>
                    </div>
                </div>

                {/* Mobile: plain stack, nothing lost. */}
                <div className="mt-12 flex flex-col gap-4 md:hidden">
                    {FEATHERS.map((feather, i) => (
                        <FeatherCard key={feather.tag} feather={feather} index={i} />
                    ))}
                </div>

                {/* The flock: a second, smaller wing for who this is for. */}
                <div className="mt-24 border-t pt-12" style={{ borderColor: palette.border }}>
                    <div className="flex items-center gap-4">
                        <WingGlyph size={30} stroke={palette.muted} strokeWidth={2.5} />
                        <p className="callsign" style={{ color: palette.dim }}>
                            the flock — who flies this
                        </p>
                    </div>
                    <div className="mt-8 grid gap-8 sm:grid-cols-3">
                        {FLOCK.map((member) => (
                            <div key={member.role}>
                                <p className="callsign" style={{ color: palette.lavender }}>
                                    {member.role}
                                </p>
                                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: palette.muted }}>
                                    {member.line}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
