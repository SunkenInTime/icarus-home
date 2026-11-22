"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuCheck, LuCopy, LuDownload } from "react-icons/lu";

import Wordmark from "@/app/components/Wordmark";
import { AnimatedSun } from "@/app/concepts/closer-to-the-sun/CloserToTheSunClient";
import { palette } from "@/app/concepts/_shared/tokens";

// The web app opens a strategy link read-only for anyone, account or not,
// so a reader without the desktop app can still see what was shared. A
// folder link there still asks the reader to sign in.
const WEB_APP_ORIGIN = "https://beta.icarusstrats.com";

const SHARE_CODE_PATTERN =
    /^ICR-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;

type ShareLink = {
    code: string;
    deepLink: string;
    webLink: string;
};

type CopyState = "idle" | "copied" | "manual";

function normalizeShareCode(value: string | null) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
        return "";
    }

    const upper = trimmed.toUpperCase();
    if (SHARE_CODE_PATTERN.test(upper)) {
        return upper;
    }

    return trimmed;
}

function decodePathSegment(segment: string) {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

function extractCodeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get("code") || params.get("token");
    if (queryCode) {
        return normalizeShareCode(queryCode);
    }

    const segments = window.location.pathname
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);
    const shareIndex = segments.findIndex(
        (segment) => segment.toLowerCase() === "share",
    );

    if (shareIndex >= 0 && segments[shareIndex + 1]) {
        return normalizeShareCode(decodePathSegment(segments[shareIndex + 1]));
    }

    return "";
}

function deepLinkForCode(code: string) {
    return `icarus://share?code=${encodeURIComponent(code)}`;
}

function webLinkForCode(code: string) {
    return `${WEB_APP_ORIGIN}/share/${encodeURIComponent(code)}`;
}

/** "opening" while the deep link is being tried, "unopened" once Icarus has not answered. */
type HandoffState = "opening" | "unopened";

const COPY_LABEL: Record<CopyState, string> = {
    idle: "Copy code",
    copied: "Copied",
    manual: "Select code",
};

export default function ShareLinkHandler({ downloadUrl }: { downloadUrl: string }) {
    const [shareLink, setShareLink] = useState<ShareLink | null>(null);
    const [handoff, setHandoff] = useState<HandoffState>("opening");
    const [copyState, setCopyState] = useState<CopyState>("idle");
    const retryTimer = useRef(0);

    useEffect(() => {
        const code = extractCodeFromUrl();
        if (!code) {
            return;
        }

        const deepLink = deepLinkForCode(code);
        const renderTimer = window.setTimeout(() => {
            setShareLink({ code, deepLink, webLink: webLinkForCode(code) });
        }, 0);

        const redirectTimer = window.setTimeout(() => {
            window.location.href = deepLink;
        }, 650);

        const fallbackTimer = window.setTimeout(() => {
            setHandoff("unopened");
        }, 1800);

        return () => {
            window.clearTimeout(renderTimer);
            window.clearTimeout(redirectTimer);
            window.clearTimeout(fallbackTimer);
            window.clearTimeout(retryTimer.current);
        };
    }, []);

    if (!shareLink) {
        return null;
    }

    const opening = handoff === "opening";
    const [prefix, ...groups] = shareLink.code.split("-");
    const isShareCode = SHARE_CODE_PATTERN.test(shareLink.code);

    async function copyShareCode() {
        if (!shareLink) {
            return;
        }

        try {
            await navigator.clipboard.writeText(shareLink.code);
            setCopyState("copied");
        } catch {
            setCopyState("manual");
        }

        window.setTimeout(() => setCopyState("idle"), 1600);
    }

    // The link itself fires the deep link; this only shows the attempt.
    function retryInIcarus() {
        setHandoff("opening");
        window.clearTimeout(retryTimer.current);
        retryTimer.current = window.setTimeout(() => setHandoff("unopened"), 1800);
    }

    return (
        <section
            aria-labelledby="share-title"
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
            style={{ background: palette.bg, color: palette.fg }}
        >
            <header className="relative z-10 shrink-0" style={{ borderBottom: "1px solid #1d1d20" }}>
                <div className="mx-auto flex h-16 max-w-[1160px] items-center px-6">
                    <Link href="/" aria-label="Icarus home">
                        <Wordmark height={18} />
                    </Link>
                </div>
            </header>

            <main className="relative flex flex-1 items-center overflow-hidden py-10 lg:py-16">
                <div
                    aria-hidden
                    className="tactical-dots absolute inset-0"
                    style={{
                        maskImage: "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)",
                    }}
                />
                {/* The homepage sun, warm for as long as the link is opening. */}
                <AnimatedSun warm={opening} />

                <div className="relative mx-auto w-full max-w-[1160px] px-6" aria-live="polite">
                    <h1
                        id="share-title"
                        className="font-display"
                        style={{
                            fontSize: "clamp(36px, 5.4vw, 64px)",
                            lineHeight: 1.04,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {opening ? "Opening in Icarus." : "Icarus didn\u2019t open."}
                    </h1>
                    <p
                        className="mt-6 min-h-[4.8em] max-w-[34em] text-[16.5px] leading-[1.6] lg:min-h-[3.2em]"
                        style={{ color: palette.muted }}
                    >
                        {opening
                            ? "If your browser asks to open the desktop app, allow it."
                            : "The desktop app may not be installed on this device. This link opens read-only in your browser, no account needed."}
                    </p>

                    {/* The primary action is whichever one can work next. */}
                    <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:gap-4">
                        {opening ? (
                            <>
                                <a
                                    href={shareLink.deepLink}
                                    onClick={retryInIcarus}
                                    className="icarus-button icarus-button-primary icarus-button-lg icarus-button-responsive-wide"
                                >
                                    Open in Icarus
                                </a>
                                <a
                                    href={shareLink.webLink}
                                    className="icarus-button icarus-button-secondary icarus-button-lg icarus-button-responsive-wide"
                                >
                                    View in browser
                                </a>
                            </>
                        ) : (
                            <>
                                <a
                                    href={shareLink.webLink}
                                    className="icarus-button icarus-button-primary icarus-button-lg icarus-button-responsive-wide"
                                >
                                    View in browser
                                </a>
                                <a
                                    href={shareLink.deepLink}
                                    onClick={retryInIcarus}
                                    className="icarus-button icarus-button-secondary icarus-button-lg icarus-button-responsive-wide"
                                >
                                    Try opening Icarus again
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <div
                aria-hidden
                className="relative h-px shrink-0 overflow-hidden"
                style={{ background: palette.border }}
            >
                {opening && (
                    <div
                        className="share-seam-sweep absolute left-0 top-0 h-px w-[26%]"
                        style={{
                            background: "linear-gradient(90deg, transparent, #e4e4e7, transparent)",
                        }}
                    />
                )}
            </div>

            <div className="shrink-0 pb-6 lg:pb-14" style={{ background: "#0d0d10" }}>
                <div className="mx-auto grid max-w-[1160px] px-6 lg:grid-cols-2">
                    <div
                        className="flex flex-col gap-4 border-b py-6 lg:min-h-[120px] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:border-b-0 lg:border-r lg:py-8 lg:pr-10"
                        style={{ borderColor: palette.border }}
                    >
                        <div className="min-w-0">
                            <code
                                className="font-mono block select-all break-all font-medium leading-[1.3]"
                                style={{ fontSize: "clamp(17px, 1.7vw, 22px)" }}
                            >
                                {isShareCode ? (
                                    <>
                                        <span style={{ color: palette.dim }}>{prefix}-</span>
                                        {groups.join("-")}
                                    </>
                                ) : (
                                    shareLink.code
                                )}
                            </code>
                            <p className="mt-1.5 text-sm leading-[1.6]" style={{ color: palette.muted }}>
                                Paste this code into Icarus under Shared with Me.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={copyShareCode}
                            className="icarus-button icarus-button-outline icarus-button-sm shrink-0 lg:min-w-[124px]"
                        >
                            {copyState === "copied" ? (
                                <LuCheck aria-hidden size={14} />
                            ) : (
                                <LuCopy aria-hidden size={14} />
                            )}
                            {COPY_LABEL[copyState]}
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 py-6 lg:min-h-[120px] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-8 lg:pl-10">
                        <p className="text-[15.5px] leading-[1.6] lg:max-w-[21em]" style={{ color: "#d4d4d8" }}>
                            Icarus is a free, open-source VALORANT strategy board for Windows and web.
                        </p>
                        <a
                            href={downloadUrl}
                            className="icarus-button icarus-button-outline icarus-button-sm shrink-0"
                        >
                            <LuDownload aria-hidden size={14} />
                            Download for Windows
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
