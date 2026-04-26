"use client";

import { motion } from "framer-motion";
import { FaCheck, FaTimes } from "react-icons/fa";

import comparisonItems from "@/app/data/comparisonItems";
import { ACCENT } from "@/app/constants";
import { SectionLabel } from "@/app/components/ui/Tactical";

const Compare = () => {
    return (
        <section id="compare" className="relative py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-6">
                <SectionLabel
                    index="// 02"
                    title="COMPARE"
                    description={"Switch with confidence. Here is the full delta against the rest of the lineup."}
                />

                <div
                    className="relative overflow-hidden"
                    style={{
                        border: "1px solid #27272a",
                        borderRadius: 12,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
                    }}
                >
                    {/* Header row */}
                    <div
                        className="grid grid-cols-[1.5fr_1fr_1fr] callsign"
                        style={{ borderBottom: "1px solid #27272a", background: "#0d0d10" }}
                    >
                        <div className="px-5 py-4">FEATURE</div>
                        <div
                            className="relative px-5 py-4 text-center"
                            style={{ borderLeft: "1px solid #27272a" }}
                        >
                            <span className="inline-flex items-center gap-2" style={{ color: ACCENT }}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                                ICARUS
                            </span>
                        </div>
                        <div
                            className="px-5 py-4 text-center"
                            style={{ borderLeft: "1px solid #27272a" }}
                        >
                            COMPETITORS
                        </div>
                    </div>

                    {comparisonItems.map((item, i) => (
                        <motion.div
                            key={`${item.feature}-${i}`}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.3, delay: i * 0.03 }}
                            whileHover={{ backgroundColor: "rgba(124,58,237,0.04)" }}
                            className="grid grid-cols-[1.5fr_1fr_1fr] text-sm"
                            style={{
                                borderTop: i === 0 ? undefined : "1px solid #1d1d20",
                            }}
                        >
                            <div className="px-5 py-4 flex items-center gap-3" style={{ color: "#e4e4e7" }}>
                                <span className="callsign" style={{ color: "#52525b" }}>
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span>{item.feature}</span>
                            </div>
                            <Cell on={item.icarus} accent />
                            <Cell on={Boolean(item.competitors)} />
                        </motion.div>
                    ))}
                </div>

                <p className="mt-4 callsign text-center" style={{ color: "#71717a" }}>
                    Live collaboration is on the roadmap — staying free, staying local-first.
                </p>
            </div>
        </section>
    );
};

const Cell = ({ on, accent = false }: { on: boolean; accent?: boolean }) => (
    <div
        className="px-5 py-4 flex items-center justify-center"
        style={{ borderLeft: "1px solid #1d1d20" }}
    >
        {on ? (
            <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                    background: accent ? "rgba(124,58,237,0.12)" : "rgba(52,211,153,0.10)",
                    border: `1px solid ${accent ? "rgba(124,58,237,0.45)" : "rgba(52,211,153,0.4)"}`,
                    color: accent ? ACCENT : "#34d399",
                }}
            >
                <FaCheck size={11} />
            </span>
        ) : (
            <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid #27272a",
                    color: "#52525b",
                }}
            >
                <FaTimes size={11} />
            </span>
        )}
    </div>
);

export default Compare;
