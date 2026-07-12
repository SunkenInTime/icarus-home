"use client";

import { palette } from "../_shared/tokens";

/**
 * Placeholder frame for a real-UI screenshot that hasn't been captured yet.
 * Renders at the exact size/aspect the final asset should fill, with capture
 * notes inside, so swapping in the real image is a one-line change.
 */

type Props = {
    /** Asset number, e.g. "01" — referenced in the capture checklist. */
    index: string;
    title: string;
    /** Capture guidance: what to shoot, crop, and minimum resolution. */
    note: string;
    /** CSS aspect-ratio, e.g. "16 / 10". */
    aspect?: string;
    className?: string;
};

function CornerTick({ position }: { position: string }) {
    return (
        <span
            aria-hidden
            className={`absolute h-3 w-3 ${position}`}
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
        />
    );
}

export default function AssetSlot({ index, title, note, aspect = "16 / 10", className }: Props) {
    return (
        <div
            className={`tactical-dots relative flex items-center justify-center overflow-hidden rounded-2xl border border-dashed ${className ?? ""}`}
            style={{
                aspectRatio: aspect,
                borderColor: "rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.015)",
            }}
        >
            <CornerTick position="left-2 top-2 border-l-2 border-t-2" />
            <CornerTick position="right-2 top-2 border-r-2 border-t-2" />
            <CornerTick position="bottom-2 left-2 border-b-2 border-l-2" />
            <CornerTick position="bottom-2 right-2 border-b-2 border-r-2" />

            <div className="max-w-[34ch] px-6 text-center">
                <p className="callsign" style={{ color: palette.lavender }}>
                    asset {index}
                </p>
                <p className="mt-2 text-[15px] font-semibold" style={{ color: palette.fg }}>
                    {title}
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.6]" style={{ color: palette.dim }}>
                    {note}
                </p>
            </div>
        </div>
    );
}
