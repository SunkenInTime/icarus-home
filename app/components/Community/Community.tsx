"use client";

import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import communityLinks from "@/app/data/communityLinks";
import { ACCENT } from "@/app/constants";
import { SectionLabel } from "@/app/components/ui/Tactical";

const Community = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
    return (
        <section id="community" className="relative py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-6">
                <SectionLabel
                    index="// 06"
                    title="JOIN COMMS"
                    description={"Icarus is steered by the people who use it. Pull up a seat."}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    {communityLinks.map((link, i) => {
                        const Icon = link.icon;
                        return (
                            <motion.a
                                key={link.title}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                whileHover={{
                                    y: -3,
                                    borderColor: "rgba(124,58,237,0.55)",
                                    boxShadow: "0 18px 40px -25px rgba(124,58,237,0.5)",
                                }}
                                className="group flex items-center justify-between gap-5 px-6 py-6"
                                style={{
                                    border: "1px solid #27272a",
                                    borderRadius: 12,
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
                                }}
                            >
                                <div className="flex items-center gap-5 min-w-0">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-md shrink-0"
                                        style={{
                                            background: "rgba(124,58,237,0.10)",
                                            border: "1px solid rgba(124,58,237,0.25)",
                                        }}
                                    >
                                        <Icon className="text-xl" color={ACCENT} aria-hidden />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold">{link.title}</h3>
                                        <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "#a1a1aa" }}>
                                            {link.description}
                                        </p>
                                    </div>
                                </div>
                                <FaArrowRight
                                    aria-hidden
                                    className="shrink-0 transition-transform group-hover:translate-x-1"
                                    style={{ color: ACCENT }}
                                />
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Community;
