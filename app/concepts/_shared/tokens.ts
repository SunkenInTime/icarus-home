/**
 * Design tokens lifted from the Icarus desktop app's tactical-violet theme
 * (icarus-release/lib/const/settings.dart). Concepts should draw from these
 * so the landing page and the app read as one object.
 */

export const palette = {
    /** Workbench black — the app's canvas. */
    bg: "#09090b",
    sidebar: "#141114",
    card: "#18181b",
    raised: "#27272a",
    border: "#27272a",
    fg: "#fafafa",
    muted: "#a1a1aa",
    dim: "#71717a",

    /** One true action color. Selection, focus, primary commands — nothing else. */
    violet: "#7c3aed",
    violetDeep: "#4c1d95",
    lavender: "#c4b5fd",

    allyGreen: "#3a7e5d",
    allyOutline: "rgba(105, 240, 175, 0.42)",
    enemyRed: "#772727",
    enemyOutline: "rgba(255, 82, 82, 0.55)",
    favoriteAmber: "#ff9800",
    error: "#ef4444",

    /** Map recolor ramp (ember base → bronze detail → orange highlight). */
    mapBase: "#271406",
    mapDetail: "#b27c40",
    mapHighlight: "#f08234",
} as const;

/** The in-app pen palette, in toolbar order. */
export const penColors = ["#fafafa", "#ef4444", "#3b82f6", "#eab308", "#22c55e"] as const;

/** Stroke thickness presets (px). Default is medium. */
export const penSizes = [3, 5, 8] as const;

export const easing = {
    outCubic: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    outQuart: "cubic-bezier(0.165, 0.84, 0.44, 1)",
    inOutCubic: "cubic-bezier(0.645, 0.045, 0.355, 1)",
} as const;

export const radius = {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10,
    panel: 12,
    card: 16,
    dialog: 22,
    pill: 22,
} as const;

export const shadow = {
    cardForeground: "0 4px 12px rgba(0, 0, 0, 0.54)",
    menuLift: "0 8px 24px rgba(0, 0, 0, 0.28)",
} as const;

/** Linear interpolation between two hex colors, t in [0, 1]. */
export function lerpHex(a: string, b: string, t: number): string {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const mix = (sa: number, sb: number) => Math.round(sa + (sb - sa) * t);
    const r = mix((pa >> 16) & 0xff, (pb >> 16) & 0xff);
    const g = mix((pa >> 8) & 0xff, (pb >> 8) & 0xff);
    const bl = mix(pa & 0xff, pb & 0xff);
    return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}
