"use client";

import { motion } from "framer-motion";

import features from "@/app/data/features";
import { ACCENT } from "@/app/constants";
import { CrosshairTick, SectionLabel } from "@/app/components/ui/Tactical";

const Features = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
    return (
        <section id="features" className="relative py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-6">
                <SectionLabel
                    index="// 01"
                    title="DESIGN PRINCIPLES"
                    description={"Built around six principles. Each one is a constraint on how the app behaves — not a marketing bullet."}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -mx-px">
                    {features.map((feature, i) => {
                        const col = i % 3;
                        const row = Math.floor(i / 3);
                        const isFirstCol = col === 0;
                        const isFirstRow = row === 0;
                        return (
                            <motion.article
                                key={feature.title}
                                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.4, delay: i * 0.04 }}
                                whileHover={{ backgroundColor: "rgba(124,58,237,0.04)" }}
                                className="relative group p-7 sm:p-8"
                                style={{
                                    borderTop: isFirstRow ? "1px solid #27272a" : undefined,
                                    borderLeft: isFirstCol ? "1px solid #27272a" : undefined,
                                    borderRight: "1px solid #27272a",
                                    borderBottom: "1px solid #27272a",
                                    marginTop: isFirstRow ? 0 : -1,
                                    marginLeft: isFirstCol ? 0 : -1,
                                }}
                            >
                                {/* Crosshair tick on each corner intersection — like a map grid */}
                                <CrosshairTick
                                    className="absolute -top-[5px] -right-[5px] opacity-60"
                                    size={10}
                                    color="rgba(124,58,237,0.7)"
                                />

                                {/* Icon plate, agent-card vibe from the in-app sidebar */}
                                <div
                                    className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors"
                                    style={{
                                        background: "rgba(124,58,237,0.10)",
                                        border: "1px solid rgba(124,58,237,0.25)",
                                    }}
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke={ACCENT}
                                        viewBox={feature.icon.viewBox}
                                        aria-hidden
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.6}
                                            d={feature.icon.d}
                                        />
                                    </svg>
                                </div>

                                <div className="callsign mb-2" style={{ color: ACCENT }}>
                                    {feature.code}
                                </div>
                                <h3 className="font-display text-xl font-medium tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#a1a1aa" }}>
                                    {feature.description}
                                </p>

                                {/* Underline reveal on hover */}
                                <span
                                    aria-hidden
                                    className="absolute bottom-0 left-0 h-px transition-all duration-500 group-hover:w-full"
                                    style={{ width: 0, background: ACCENT }}
                                />
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
