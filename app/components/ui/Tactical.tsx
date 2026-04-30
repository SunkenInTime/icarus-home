"use client";

import { CSSProperties, ReactNode } from "react";

import { ACCENT } from "@/app/constants";

type WithClass = { className?: string; style?: CSSProperties };

/**
 * Small uppercase mono "callsign" pill — echoes the in-app titlebar callouts.
 */
export const TacticalBadge = ({
    children,
    tone = "violet",
    className = "",
    style,
}: WithClass & { children: ReactNode; tone?: "violet" | "neutral" }) => {
    const violet = tone === "violet";
    return (
        <span
            className={`callsign inline-flex items-center gap-2 rounded-md px-2.5 py-1 ${className}`}
            style={{
                background: violet ? "rgba(124,58,237,0.10)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${violet ? "rgba(124,58,237,0.35)" : "#27272a"}`,
                color: violet ? "#e9d5ff" : "#d4d4d8",
                ...style,
            }}
        >
            <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                    background: violet ? ACCENT : "#a1a1aa",
                    boxShadow: violet ? `0 0 10px ${ACCENT}55` : "none",
                }}
            />
            {children}
        </span>
    );
};

/**
 * Four corner brackets that frame a container — like the in-app
 * selection ticks around the strategy board.
 */
export const CornerBrackets = ({
    size = 14,
    color = "rgba(124,58,237,0.55)",
    inset = 8,
    thickness = 1,
}: {
    size?: number;
    color?: string;
    inset?: number;
    thickness?: number;
}) => {
    const common: CSSProperties = {
        position: "absolute",
        width: size,
        height: size,
        borderColor: color,
        borderStyle: "solid",
        pointerEvents: "none",
    };
    return (
        <>
            <span
                aria-hidden
                style={{
                    ...common,
                    top: inset,
                    left: inset,
                    borderWidth: `${thickness}px 0 0 ${thickness}px`,
                }}
            />
            <span
                aria-hidden
                style={{
                    ...common,
                    top: inset,
                    right: inset,
                    borderWidth: `${thickness}px ${thickness}px 0 0`,
                }}
            />
            <span
                aria-hidden
                style={{
                    ...common,
                    bottom: inset,
                    left: inset,
                    borderWidth: `0 0 ${thickness}px ${thickness}px`,
                }}
            />
            <span
                aria-hidden
                style={{
                    ...common,
                    bottom: inset,
                    right: inset,
                    borderWidth: `0 ${thickness}px ${thickness}px 0`,
                }}
            />
        </>
    );
};

/** A small + crosshair tick used at grid intersections. */
export const CrosshairTick = ({
    size = 10,
    color = "rgba(124,58,237,0.7)",
    className = "",
    style,
}: WithClass & { size?: number; color?: string }) => {
    return (
        <span
            aria-hidden
            className={`pointer-events-none ${className}`}
            style={{
                width: size,
                height: size,
                display: "inline-block",
                position: "relative",
                ...style,
            }}
        >
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    margin: "auto",
                    width: size,
                    height: 1,
                    background: color,
                }}
            />
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    margin: "auto",
                    width: 1,
                    height: size,
                    background: color,
                }}
            />
        </span>
    );
};

/**
 * Section heading block — index callsign + display title + supporting line.
 */
export const SectionLabel = ({
    index,
    title,
    description,
    align = "left",
    className = "",
}: {
    index: string;
    title: string;
    description?: string;
    align?: "left" | "center";
    className?: string;
}) => {
    const center = align === "center";
    return (
        <header
            className={`mb-12 ${center ? "text-center mx-auto max-w-2xl" : "max-w-2xl"} ${className}`}
        >
            <div
                className={`callsign mb-3 inline-flex items-center gap-2 ${center ? "" : ""}`}
                style={{ color: ACCENT }}
            >
                <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }}
                />
                {index}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.02em]">
                {title}
            </h2>
            {description ? (
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "#a1a1aa" }}>
                    {description}
                </p>
            ) : null}
        </header>
    );
};

export default {
    TacticalBadge,
    CornerBrackets,
    CrosshairTick,
    SectionLabel,
};
