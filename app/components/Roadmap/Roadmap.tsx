"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import comingSoonFeatures from "@/app/data/comingSoonFeatures";
import { ACCENT, PREVIEW_IMG } from "@/app/constants";
import { CornerBrackets, SectionLabel, TacticalBadge } from "@/app/components/ui/Tactical";
import { AnimationVariants } from "@/app/types/AnimationVariants";

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
    shipping: {
        label: "SHIPPING",
        color: "#34d399",
        bg: "rgba(52,211,153,0.10)",
        border: "rgba(52,211,153,0.4)",
    },
    "in-progress": {
        label: "IN PROGRESS",
        color: "#a78bfa",
        bg: "rgba(167,139,250,0.10)",
        border: "rgba(167,139,250,0.4)",
    },
    queued: {
        label: "QUEUED",
        color: "#a1a1aa",
        bg: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.10)",
    },
};

const Roadmap = ({ variants }: { variants: AnimationVariants }) => {
    return (
        <section id="beta" className="relative py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-6">
                <SectionLabel
                    index="// 03"
                    title="DISPATCH BOARD"
                    description={"Currently in Beta. Iterating toward 1.0 with focused, useful releases."}
                />

                <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
                    {/* Preview frame */}
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={variants.fadeIn}
                        className="relative"
                    >
                        <div
                            className="relative overflow-hidden"
                            style={{
                                borderRadius: 12,
                                border: "1px solid #27272a",
                                background: "#0d0d10",
                                boxShadow: "0 25px 60px -25px rgba(0,0,0,0.7)",
                            }}
                        >
                            <Image
                                src={PREVIEW_IMG}
                                alt="Icarus board"
                                width={2048}
                                height={1280}
                                className="block w-full h-auto"
                                style={{ maxHeight: 460, objectFit: "cover" }}
                            />
                            <CornerBrackets size={14} color="rgba(124,58,237,0.55)" inset={8} />
                            <div className="absolute top-3 left-3">
                                <TacticalBadge>NOW BUILDING</TacticalBadge>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mission list */}
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={variants.fadeUp}
                        className="space-y-3"
                    >
                        <div className="callsign mb-2" style={{ color: ACCENT }}>
                            {"// OPEN MISSIONS"}
                        </div>

                        {comingSoonFeatures.map((mission) => {
                            const meta = STATUS_META[mission.status];
                            return (
                                <div
                                    key={mission.code}
                                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                                    style={{
                                        border: "1px solid #27272a",
                                        borderRadius: 8,
                                        background: "rgba(255,255,255,0.015)",
                                    }}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <span className="callsign shrink-0" style={{ color: "#71717a" }}>
                                            {mission.code}
                                        </span>
                                        <span className="truncate text-[15px]" style={{ color: "#e4e4e7" }}>
                                            {mission.title}
                                        </span>
                                    </div>
                                    <span
                                        className="callsign shrink-0 inline-flex items-center gap-2 rounded-full px-2.5 py-1"
                                        style={{
                                            color: meta.color,
                                            background: meta.bg,
                                            border: `1px solid ${meta.border}`,
                                            fontSize: 10,
                                        }}
                                    >
                                        <span
                                            className="inline-block h-1.5 w-1.5 rounded-full"
                                            style={{ background: meta.color }}
                                        />
                                        {meta.label}
                                    </span>
                                </div>
                            );
                        })}

                        <p className="pt-4 text-sm" style={{ color: "#a1a1aa" }}>
                            Want a say in what ships next? The roadmap lives in the open — file an issue
                            on GitHub or drop into Discord.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Roadmap;
