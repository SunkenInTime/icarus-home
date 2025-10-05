import { ACCENT, BORDER_SOFT } from "@/app/constants";
import communityLinks from "@/app/data/communityLinks";
import { motion } from "framer-motion";
import React from "react";

const Community = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
    return (
        <section id="community" className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-6 text-center">
                <h2 className="text-2xl sm:text-3xl font-semibold">Join the community</h2>
                <p className="mt-3 mb-10 text-gray-400">Share strategies, request features, and help shape Icarus.</p>

                <div className="flex flex-wrap justify-center gap-6">
                    {communityLinks.map((link, i) => {
                        const Icon = link.icon;
                        return (
                            <motion.a
                                key={link.title}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.3, delay: i * 0.04 }}
                                whileHover={{ y: -3, borderColor: ACCENT, boxShadow: "0 12px 30px rgba(123,97,255,0.12)" }}
                                className="w-64 rounded-lg p-5 text-left"
                                style={{
                                    border: `1px solid ${BORDER_SOFT}`,
                                    background: "rgba(255,255,255,0.02)",
                                    backdropFilter: "blur(6px)",
                                }}
                            >
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                                    <Icon className="text-lg" color="#E4E4E7" aria-hidden />
                                </div>
                                <h3 className="text-base font-semibold text-center">{link.title}</h3>
                                <p className="mt-2 text-sm text-gray-400 text-center">{link.description}</p>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Community;
