"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaCheck, FaCopy } from "react-icons/fa";

const ICARUS_LOGO_URL =
    "https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN";

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
        <section
            aria-labelledby="share-title"
            aria-live="polite"
            className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-white"
            style={{ background: "#08080a" }}
        >
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(520px 320px at 50% 22%, rgba(124,58,237,0.22), transparent 72%)",
                }}
            />
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                    maskImage:
                        "linear-gradient(180deg, transparent 0%, black 22%, black 72%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(180deg, transparent 0%, black 22%, black 72%, transparent 100%)",
                }}
            />

            <div
                className="relative mx-auto flex w-full max-w-md flex-col items-center text-center"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={ICARUS_LOGO_URL}
                    alt="Icarus logo"
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-2xl"
                    style={{
                        boxShadow:
                            "0 24px 70px -24px rgba(124,58,237,0.9), 0 0 0 1px rgba(255,255,255,0.12)",
                    }}
                />

                <p
                    className="mt-7 font-mono text-[10px] uppercase tracking-[0.26em]"
                    style={{ color: "#a78bfa" }}
                >
                    Icarus Share
                </p>
                <h1
                    id="share-title"
                    className="mt-3 font-onest text-[34px] font-semibold leading-[1.05] sm:text-[44px]"
                    style={{ letterSpacing: 0 }}
                >
                    Opening shared strategy
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-6" style={{ color: "#a1a1aa" }}>
                    This link is for the Icarus desktop app. Keep this page open if your
                    browser asks for permission.
                </p>

                <div
                    className="mt-8 w-full rounded-lg border p-4 text-left"
                    style={{
                        borderColor: "rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.035)",
                    }}
                >
                    <div className="flex items-center justify-between gap-4">
                        <span
                            className="font-mono text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "#71717a" }}
                        >
                            Share code
                        </span>
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                                background: "#7c3aed",
                                boxShadow: "0 0 14px rgba(124,58,237,0.8)",
                            }}
                        />
                    </div>
                    <code
                        className="mt-3 block select-all overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[13px]"
                        style={{ color: "#fafafa" }}
                    >
                        {shareLink.code}
                    </code>
                </div>

                <p className="mt-5 min-h-5 text-sm" style={{ color: "#d4d4d8" }}>
                    {status}
                </p>

                <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
                    <a
                        href={shareLink.deepLink}
                        onClick={() => {
                            window.setTimeout(() => {
                                setStatus(
                                    "If Icarus did not open, copy the code and open it from inside the app.",
                                );
                            }, 900);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3.5 py-2.5 text-sm font-medium"
                        style={{ background: "#fafafa", color: "#0a0a0a" }}
                    >
                        Open in Icarus
                        <FaArrowRight aria-hidden size={11} />
                    </a>
                    <button
                        type="button"
                        onClick={copyShareCode}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.04]"
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

                <Link
                    href="/"
                    className="mt-6 text-xs transition-colors hover:text-white"
                    style={{ color: "#71717a" }}
                >
                    Go to icarusstrats.com
                </Link>
            </div>
        </section>
    );
}
