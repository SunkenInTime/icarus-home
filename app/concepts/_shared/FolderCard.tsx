"use client";

import { CSSProperties, ReactNode, useState } from "react";
import { easing, lerpHex, palette } from "./tokens";

/**
 * Web port of the app's library folder card
 * (icarus-release/lib/widgets/folder_card.dart).
 *
 * Three layers: a back panel with a classic folder tab, "peek" sheets that
 * rise out of the pocket on hover, and a front panel that squashes 4.5%
 * vertically so the pocket appears to gape. The front (depth 0) sheet stays
 * anchored; only the sheets behind it rise, so contents appear to slide up
 * from behind the cover. 220ms ease-out-quart open, 180ms ease-out-cubic
 * close — the app's exact asymmetry.
 */

const CARD_W = 232;
const CARD_H = 124;
const POCKET_TOP = 52;
const PEEK_W = 208;
const PEEK_H = 82;

// Per-depth peek choreography from the app: rest position, hover lift,
// horizontal fan, and rest/open rotation (radians).
const PEEK_TOPS = [22, 15, 9];
const PEEK_LIFTS = [0, 13, 17];
const PEEK_LEFTS = [-7, 7, 0];
const PEEK_REST_ANGLES = [-0.022, 0.022, -0.012];
const PEEK_OPEN_ANGLES = [0.0, 0.03, -0.022];

const RAD_TO_DEG = 180 / Math.PI;

function folderBackPath(w: number, h: number): string {
    const tw = 78;
    const th = 14;
    const r = 10;
    return [
        `M 0 ${h - r}`,
        `L 0 ${r}`,
        `Q 0 0 ${r} 0`,
        `L ${tw - 12} 0`,
        `Q ${tw - 4} 0 ${tw} ${th * 0.55}`,
        `Q ${tw + 4} ${th} ${tw + 14} ${th}`,
        `L ${w - r} ${th}`,
        `Q ${w} ${th} ${w} ${th + r}`,
        `L ${w} ${h - r}`,
        `Q ${w} ${h} ${w - r} ${h}`,
        `L ${r} ${h}`,
        `Q 0 ${h} 0 ${h - r}`,
        "Z",
    ].join(" ");
}

/** A blank pocket sheet with the app's dot grid and a faint pen doodle. */
export function PeekSheet({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "#141416",
                backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "9.5px 9.5px",
                display: "grid",
                placeItems: "center",
                ...style,
            }}
        >
            {children ?? (
                <svg width="120" height="48" viewBox="0 0 120 48" fill="none" aria-hidden>
                    <path
                        d="M8 38 C 30 34, 38 16, 62 14 S 100 22, 108 10"
                        stroke="rgba(250,250,250,0.35)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="1 7"
                    />
                    <path d="M108 10 l -7 -1 m 7 1 l -3 6" stroke="rgba(250,250,250,0.35)" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="14" cy="38" r="4.5" stroke="rgba(124,58,237,0.8)" strokeWidth="2" />
                </svg>
            )}
        </div>
    );
}

export type FolderCardProps = {
    name: string;
    /** Preset folder color; pulled toward the workbench darks like the app does. */
    baseColor?: string;
    icon?: ReactNode;
    /**
     * Pocket contents, index 0 = front (cover) sheet, max 3. Each renders
     * inside a 208x82 clipped sheet. Defaults to two doodled sheets.
     */
    peeks?: ReactNode[];
    /** Bottom row of the front panel (counts, agent comps, captions). */
    footer?: ReactNode;
    /** Right side of the name row (menu button, pin, badge). */
    nameAccessory?: ReactNode;
    /** Controlled open override; otherwise opens on hover. */
    open?: boolean;
    /** Drop-target emphasis: full white border, no hover scale. */
    highlight?: boolean;
    /** Uniform scale; geometry stays faithful and just zooms. */
    scale?: number;
    href?: string;
    onClick?: () => void;
    className?: string;
    style?: CSSProperties;
};

export default function FolderCard({
    name,
    baseColor = "#5b5566",
    icon,
    peeks,
    footer,
    nameAccessory,
    open: openProp,
    highlight = false,
    scale = 1,
    href,
    onClick,
    className,
    style,
}: FolderCardProps) {
    const [hovered, setHovered] = useState(false);
    const open = openProp ?? hovered;
    const t = open ? 1 : 0;

    // Folder body tones: raw preset colors are too loud for a large surface,
    // so they are pulled toward the workbench darks (the app's exact lerps).
    const backTone = lerpHex(baseColor, "#0c0c0e", 0.72);
    const frontTone = lerpHex(baseColor, "#141416", 0.55);
    const edgeTone = lerpHex(baseColor, "#ffffff", 0.25);

    const borderColor = highlight
        ? "#ffffff"
        : `rgba(255, 255, 255, ${(0.10 + 0.15 * t).toFixed(3)})`;

    const transition = open
        ? `all 220ms ${easing.outQuart}`
        : `all 180ms ${easing.outCubic}`;

    const sheets = peeks ?? [<PeekSheet key="a" />, <PeekSheet key="b" />];
    const sheetCount = Math.min(sheets.length, 3);
    const centerLeft = (CARD_W - PEEK_W) / 2;

    const peekLayers =
        sheetCount === 1
            ? [
                  <div
                      key={0}
                      style={{
                          position: "absolute",
                          left: centerLeft,
                          top: 22,
                          width: PEEK_W,
                          height: PEEK_H,
                          transform: `translateY(${-14 * t}px) rotate(${(-0.02 - 0.03 * t) * RAD_TO_DEG}deg)`,
                          transition,
                          borderRadius: 7,
                          border: "1px solid rgba(255,255,255,0.22)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                          overflow: "hidden",
                      }}
                  >
                      {sheets[0]}
                  </div>,
              ]
            : Array.from({ length: sheetCount }, (_, i) => sheetCount - 1 - i).map((depth) => (
                  <div
                      key={depth}
                      style={{
                          position: "absolute",
                          left: centerLeft + PEEK_LEFTS[depth],
                          top: PEEK_TOPS[depth],
                          width: PEEK_W,
                          height: PEEK_H,
                          transform: `translateY(${-PEEK_LIFTS[depth] * t}px) rotate(${(PEEK_REST_ANGLES[depth] + PEEK_OPEN_ANGLES[depth] * t) * RAD_TO_DEG}deg)`,
                          transition,
                          borderRadius: 7,
                          border: "1px solid rgba(255,255,255,0.22)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                          overflow: "hidden",
                      }}
                  >
                      {sheets[depth]}
                  </div>
              ));

    const Tag = (href ? "a" : "div") as "a";

    return (
        <Tag
            {...(href ? { href } : {})}
            onClick={onClick}
            className={className}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            style={{
                position: "relative",
                display: "block",
                width: CARD_W * scale,
                height: CARD_H * scale,
                cursor: href || onClick ? "pointer" : undefined,
                userSelect: "none",
                WebkitTapHighlightColor: "transparent",
                textDecoration: "none",
                color: "inherit",
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    width: CARD_W,
                    height: CARD_H,
                    transformOrigin: "top left",
                    transform: `scale(${scale})`,
                }}
            >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "center",
                    transform: `scale(${(highlight ? 1 : 1 + 0.015 * t).toFixed(4)})`,
                    transition,
                }}
            >
                {/* Back panel with tab: the folder itself. */}
                <svg
                    width={CARD_W}
                    height={CARD_H - 14}
                    viewBox={`0 0 ${CARD_W} ${CARD_H - 14}`}
                    style={{ position: "absolute", left: 0, top: 14, display: "block", overflow: "visible" }}
                    aria-hidden
                >
                    <path
                        d={folderBackPath(CARD_W, CARD_H - 14)}
                        fill={backTone}
                        stroke={borderColor}
                        strokeWidth={1}
                        style={{ transition }}
                    />
                </svg>

                {/* Map sheets peeking out of the pocket. */}
                {peekLayers}

                {/* Front panel: name + footer. Squashes so the pocket gapes. */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: POCKET_TOP,
                        bottom: 0,
                        transformOrigin: "bottom center",
                        transform: `scaleY(${(1 - 0.045 * t).toFixed(4)})`,
                        transition,
                        background: frontTone,
                        borderRadius: 10,
                        border: `1px solid ${borderColor}`,
                        boxShadow: "0 -3px 10px rgba(0,0,0,0.45)",
                        padding: "8px 4px 8px 10px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <span style={{ color: edgeTone, display: "inline-flex", flexShrink: 0 }}>
                            {icon ?? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <path
                                        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </span>
                        <span
                            style={{
                                color: palette.fg,
                                fontSize: 14,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: 1,
                            }}
                        >
                            {name}
                        </span>
                        {nameAccessory}
                    </div>
                    <div style={{ paddingRight: 6, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
                        {footer ?? "Empty"}
                    </div>
                </div>
            </div>
            </div>
        </Tag>
    );
}
