"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaApple, FaDownload, FaLinux, FaWindows } from "react-icons/fa";
import type { IconType } from "react-icons";

import {
    ACCENT,
    ACCENT_HOVER,
    PREVIEW_IMG,
} from "@/app/constants";
import { CornerBrackets, SectionLabel, TacticalBadge } from "@/app/components/ui/Tactical";
import { VersionInfo } from "@/app/data/versionInfo";

type Platform = "windows" | "mac" | "linux";
type DownloadProps = { latestVersion: VersionInfo };

const PLATFORM_META: Record<Platform, { label: string; icon: IconType; available: boolean }> = {
    windows: { label: "Windows", icon: FaWindows, available: true },
    mac: { label: "macOS", icon: FaApple, available: false },
    linux: { label: "Linux", icon: FaLinux, available: false },
};

const Download = ({ latestVersion }: DownloadProps) => {
    const [activeTab, setActiveTab] = useState<Platform>("windows");
    const activePlatform = latestVersion.platforms[activeTab];
    const windowsPlatform = latestVersion.platforms.windows;
    const isWindows = activeTab === "windows";

    return (
        <section id="download" className="relative py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-6">
                <SectionLabel
                    index="// 04"
                    title="GET STARTED"
                    description={"Download the beta. Open the app. Be on the board in under sixty seconds."}
                />

                <div
                    className="relative overflow-hidden"
                    style={{
                        border: "1px solid #27272a",
                        borderRadius: 14,
                        background: "linear-gradient(180deg, #0d0d10 0%, #09090b 100%)",
                        boxShadow: "0 30px 80px -40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)",
                    }}
                >
                    {/* Tabs */}
                    <div
                        className="grid grid-cols-3"
                        style={{ borderBottom: "1px solid #27272a", background: "#0a0a0c" }}
                    >
                        {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
                            const meta = PLATFORM_META[p];
                            const Icon = meta.icon;
                            const isActive = activeTab === p;
                            const disabled = !meta.available;
                            return (
                                <motion.button
                                    key={p}
                                    onClick={() => !disabled && setActiveTab(p)}
                                    className="relative flex items-center justify-center gap-2.5 px-4 py-4 text-sm transition-colors"
                                    style={{
                                        color: isActive ? "#fafafa" : disabled ? "#52525b" : "#a1a1aa",
                                        background: isActive ? "rgba(124,58,237,0.06)" : "transparent",
                                        cursor: disabled ? "not-allowed" : "pointer",
                                        borderRight: p !== "linux" ? "1px solid #1d1d20" : undefined,
                                    }}
                                    aria-pressed={isActive}
                                    aria-disabled={disabled}
                                    whileHover={!disabled ? { backgroundColor: "rgba(124,58,237,0.08)" } : undefined}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <motion.span
                                            layoutId="dl-tab-bar"
                                            className="absolute bottom-0 left-0 right-0 h-px"
                                            style={{ background: ACCENT }}
                                        />
                                    )}
                                    <Icon size={16} />
                                    <span className="font-medium">{meta.label}</span>
                                    {disabled && (
                                        <span className="callsign" style={{ fontSize: 9, color: "#52525b" }}>
                                            SOON
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Body */}
                    <div className="p-6 sm:p-10">
                        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] items-center">
                            <div>
                                <TacticalBadge>
                                    BUILD {latestVersion.version} · {latestVersion.released.toUpperCase()}
                                </TacticalBadge>

                                <h3 className="mt-5 font-display text-3xl sm:text-4xl font-medium tracking-tight">
                                    Download for {PLATFORM_META[activeTab].label}
                                </h3>

                                {isWindows ? (
                                    <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#a1a1aa" }}>
                                        {windowsPlatform.preferredLabel} is the recommended distribution.{" "}
                                        {windowsPlatform.preferredReason}
                                    </p>
                                ) : (
                                    <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#a1a1aa" }}>
                                        Native {PLATFORM_META[activeTab].label} support is on the roadmap. In the
                                        meantime, the Windows build runs well under most compatibility layers.
                                    </p>
                                )}

                                <div className="mt-7 space-y-3">
                                    <motion.a
                                        data-retn-click
                                        data-retn-name="Download click"
                                        href={activePlatform.url}
                                        className="group inline-flex w-full items-center justify-between gap-4 rounded-md px-5 py-4 text-sm font-medium transition-colors"
                                        style={{ backgroundColor: ACCENT, color: "#fff" }}
                                        whileHover={{ scale: 1.01, y: -1 }}
                                        whileTap={{ scale: 0.99, y: 0 }}
                                        onMouseOver={(e) =>
                                            (e.currentTarget.style.backgroundColor = ACCENT_HOVER)
                                        }
                                        onMouseOut={(e) =>
                                            (e.currentTarget.style.backgroundColor = ACCENT)
                                        }
                                    >
                                        <span className="inline-flex items-center gap-2.5">
                                            <FaDownload aria-hidden />
                                            {isWindows ? "Download installer" : "Download"}
                                        </span>
                                        <span className="callsign" style={{ color: "rgba(255,255,255,0.85)" }}>
                                            {activePlatform.size}
                                        </span>
                                    </motion.a>

                                    {isWindows && windowsPlatform.secondaryUrl ? (
                                        <p className="text-xs" style={{ color: "#71717a" }}>
                                            Prefer the Microsoft Store?{" "}
                                            <a
                                                href={windowsPlatform.secondaryUrl}
                                                className="underline decoration-[#3f3f46] underline-offset-2 transition-colors hover:text-[#d4d4d8]"
                                            >
                                                Use the {windowsPlatform.secondaryLabel} version
                                            </a>
                                            .
                                        </p>
                                    ) : null}
                                    <p className="text-xs" style={{ color: "#71717a" }}>
                                        By downloading, you agree to our{" "}
                                        <a
                                            href="/tos"
                                            className="hover:underline"
                                            style={{ color: ACCENT }}
                                        >
                                            Terms of Service
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid #27272a",
                                        background: "#0d0d10",
                                        boxShadow: "0 20px 50px -25px rgba(0,0,0,0.7)",
                                    }}
                                >
                                    <Image
                                        src={PREVIEW_IMG}
                                        alt="Icarus app preview"
                                        width={2048}
                                        height={1280}
                                        className="block w-full h-auto"
                                        style={{ maxHeight: 360, objectFit: "cover" }}
                                    />
                                    <CornerBrackets size={12} color="rgba(124,58,237,0.55)" inset={8} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Download;
