"use client";

import { BORDER_SOFT, RING, ACCENT, ACCENT_HOVER, PREVIEW_IMG } from "@/app/constants";
import { motion } from "framer-motion";
import { FaDownload } from "react-icons/fa";
import GlassDeviceFrame from "../ui/GlassDeviceFrame";
import SectionShell from "../ui/SectionShell";
import { useState } from "react";
import latestVersion from "@/app/data/versionInfo";

type Platform = "windows" | "mac" | "linux";

const Download = () => {
    const [activeTab, setActiveTab] = useState<Platform>("windows");
    return (
        <SectionShell id="download" title="Get started today">
            <p className="mt-3 text-gray-400 text-center">Download the beta and start planning smarter.</p>

            <div
                className="overflow-hidden rounded-lg mt-10"
                style={{
                    border: `1px solid ${BORDER_SOFT}`,
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(6px)",
                }}
            >
                <div className="flex overflow-x-auto">
                    {(["windows", "mac", "linux"] as Platform[]).map((p) => {
                        const disabled = p === "mac" || p === "linux";
                        const isActive = activeTab === p;
                        return (
                            <motion.button
                                key={p}
                                onClick={() => !disabled && setActiveTab(p)}
                                className="flex-1 px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                                style={{
                                    color: isActive ? "#fff" : "#BDBDBD",
                                    backgroundColor: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                                    opacity: disabled ? 0.6 : 1,
                                    cursor: disabled ? "not-allowed" : "pointer",
                                    borderColor: RING,
                                }}
                                whileHover={!disabled ? { y: -1 } : undefined}
                                whileTap={!disabled ? { y: 0, scale: 0.98 } : undefined}
                                aria-pressed={isActive}
                                aria-disabled={disabled}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                {disabled ? " (Coming soon)" : ""}
                            </motion.button>
                        );
                    })}
                </div>

                <div className="p-6 sm:p-8">
                    <div className="grid gap-8 md:grid-cols-2 items-center">
                        <div>
                            <h3 className="text-xl font-semibold">Download for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                            <p className="mt-2 text-gray-400">
                                {latestVersion.version} • Released {latestVersion.released}
                            </p>

                            <div className="mt-6 space-y-3">
                                <motion.a
                                    href={latestVersion.platforms[activeTab].url}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                    style={{
                                        backgroundColor: ACCENT,
                                        color: "#fff",
                                        WebkitTapHighlightColor: "transparent",
                                    }}
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.97, y: 0 }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                                >
                                    <FaDownload aria-hidden />
                                    Download now
                                </motion.a>
                                <p className="text-center text-xs text-gray-500">File size: {latestVersion.platforms[activeTab].size} • By downloading, you agree to our Terms of Service.</p>
                            </div>
                        </div>

                        <div>
                            <GlassDeviceFrame rounded="lg">
                                <img src={PREVIEW_IMG} alt="Icarus app preview" className="block w-full" style={{ maxHeight: 320, objectFit: "cover" }} />
                            </GlassDeviceFrame>
                        </div>
                    </div>
                </div>
            </div>
        </SectionShell>
    );
};

export default Download;
