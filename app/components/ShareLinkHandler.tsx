"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaCheck, FaCopy } from "react-icons/fa";

const SHARE_CODE_PATTERN =
    /^ICR-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;

type ShareLink = {
    code: string;
    deepLink: string;
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

export default function ShareLinkHandler() {
    const [shareLink, setShareLink] = useState<ShareLink | null>(null);
    const [status, setStatus] = useState("Opening shared strategy in Icarus.");
    const [copyState, setCopyState] = useState<CopyState>("idle");

    useEffect(() => {
        const code = extractCodeFromUrl();
        if (!code) {
            return;
        }

        const deepLink = deepLinkForCode(code);
        const renderTimer = window.setTimeout(() => {
            setShareLink({ code, deepLink });
        }, 0);

        const redirectTimer = window.setTimeout(() => {
            window.location.href = deepLink;
        }, 650);

        const fallbackTimer = window.setTimeout(() => {
            setStatus("If Icarus did not open, copy the code and open it from inside the app.");
        }, 1800);

        return () => {
            window.clearTimeout(renderTimer);
            window.clearTimeout(redirectTimer);
            window.clearTimeout(fallbackTimer);
        };
    }, []);

    const copyLabel = useMemo(() => {
        if (copyState === "copied") {
            return "Copied";
        }

        if (copyState === "manual") {
            return "Select code";
        }

        return "Copy code";
    }, [copyState]);

    if (!shareLink) {
        return null;
    }

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

    return (
        <aside
            aria-live="polite"
            className="fixed inset-x-0 top-16 z-50 px-4 sm:px-6"
        >
            <div
                className="mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between"
                style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    background:
                        "linear-gradient(180deg, rgba(18,18,22,0.96), rgba(10,10,12,0.96))",
                    boxShadow:
                        "0 22px 80px -28px rgba(0,0,0,0.9), 0 0 0 1px rgba(124,58,237,0.18)",
                }}
            >
                <div className="min-w-0">
                    <p
                        className="font-mono text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "#7c3aed" }}
                    >
                        Icarus Share
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "#fafafa" }}>
                        {status}
                    </p>
                    <code
                        className="mt-2 block select-all overflow-hidden text-ellipsis whitespace-nowrap rounded-md border px-2.5 py-1.5 font-mono text-[12px]"
                        style={{
                            borderColor: "rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.035)",
                            color: "#d4d4d8",
                        }}
                    >
                        {shareLink.code}
                    </code>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <a
                        href={shareLink.deepLink}
                        onClick={() => {
                            window.setTimeout(() => {
                                setStatus(
                                    "If Icarus did not open, copy the code and open it from inside the app.",
                                );
                            }, 900);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium"
                        style={{ background: "#fafafa", color: "#0a0a0a" }}
                    >
                        Open in Icarus
                        <FaArrowRight aria-hidden size={11} />
                    </a>
                    <button
                        type="button"
                        onClick={copyShareCode}
                        className="inline-flex items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/[0.04]"
                        style={{
                            borderColor: "rgba(255,255,255,0.12)",
                            color: "#fafafa",
                        }}
                    >
                        {copyState === "copied" ? (
                            <FaCheck aria-hidden size={12} />
                        ) : (
                            <FaCopy aria-hidden size={12} />
                        )}
                        {copyLabel}
                    </button>
                </div>
            </div>
        </aside>
    );
}
