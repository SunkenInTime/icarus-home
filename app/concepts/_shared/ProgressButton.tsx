"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { palette } from "./tokens";

/**
 * Web port of the app's update-dialog download button
 * (icarus-release/lib/widgets/desktop_update_dialog.dart).
 *
 * Idle it is a solid violet primary action. On click it starts the real
 * download, drops to the secondary zinc surface, and a violet fill sweeps
 * left-to-right with the percentage in the label (120ms ease-out steps,
 * like the app). Ends on a completed state instead of "Restart to update".
 */

type Phase = "idle" | "downloading" | "done";

type Props = {
    /** Real download URL; navigation fires on click before the animation. */
    href: string;
    label?: ReactNode;
    downloadingLabel?: (percent: number) => ReactNode;
    doneLabel?: ReactNode;
    /** Called as the simulated progress advances — wire it to a DitherFire. */
    onProgress?: (progress: number) => void;
    className?: string;
    style?: CSSProperties;
};

export default function ProgressButton({
    href,
    label = "Download for Windows",
    downloadingLabel = (percent) => `Downloading… ${percent}%`,
    doneLabel = "Sent to your downloads",
    onProgress,
    className,
    style,
}: Props) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [percent, setPercent] = useState(0);
    const raf = useRef(0);
    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;

    useEffect(() => () => cancelAnimationFrame(raf.current), []);

    function begin() {
        if (phase !== "idle") return;
        // Kick off the real download without leaving the page.
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.rel = "noreferrer";
        anchor.click();

        setPhase("downloading");
        const start = performance.now();
        const duration = 2600;

        function step(now: number) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.round(eased * 100);
            setPercent(value);
            onProgressRef.current?.(eased);
            if (t < 1) {
                raf.current = requestAnimationFrame(step);
            } else {
                setPhase("done");
            }
        }
        raf.current = requestAnimationFrame(step);
    }

    const downloading = phase === "downloading";

    return (
        <button
            type="button"
            onClick={begin}
            className={className}
            style={{
                position: "relative",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 42,
                padding: "0 22px",
                borderRadius: 8,
                border: "1px solid transparent",
                background: downloading ? palette.raised : palette.violet,
                color: phase === "idle" ? "#f9fafb" : palette.fg,
                fontSize: 14,
                fontWeight: 600,
                cursor: phase === "idle" ? "pointer" : "default",
                transition: "background 200ms ease",
                ...style,
            }}
        >
            {downloading && (
                <span
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: `${percent}%`,
                        background: palette.violet,
                        transition: "width 120ms ease-out",
                    }}
                />
            )}
            <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {phase === "idle" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M3 4.2 10.4 3v8.2H3V4.2Zm8.4-1.35L21 1.4v9.8h-9.6V2.85ZM3 12.2h7.4V21L3 19.8v-7.6Zm8.4 0H21V22.6l-9.6-1.45V12.2Z" />
                    </svg>
                )}
                {phase === "done" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="m4 12.5 5.5 5.5L20 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
                {phase === "idle" ? label : downloading ? downloadingLabel(percent) : doneLabel}
            </span>
        </button>
    );
}
