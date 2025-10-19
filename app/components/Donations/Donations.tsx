import { motion } from "framer-motion";

import SectionShell from "@/app/components/ui/SectionShell";

import donationOptions from "@/app/data/donationOptions";

import { ACCENT, BORDER_SOFT } from "@/app/constants";

const Donations = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
    return (
        <SectionShell id="donate" title="Support the project">
            <p className="mt-3 text-gray-400 text-center max-w-2xl mx-auto">Icarus is open source. Your support helps fund maintenance and new features.</p>

            {/* Center the card and give it a sensible max width when there's only one option */}
            <div className="mt-8 flex flex-wrap justify-center gap-6">
                {donationOptions.map((option, i) => {
                    const Icon = option.icon;
                    return (
                        <motion.a
                            key={option.title}
                            href={option.url}
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            whileHover={{ y: -3, borderColor: ACCENT, boxShadow: "0 12px 30px rgba(123,97,255,0.12)" }}
                            transition={{ duration: 0.3, delay: i * 0.04 }}
                            className="block w-full max-w-sm rounded-lg p-6 border"
                            style={{
                                border: `1px solid ${BORDER_SOFT}`,
                                background: "rgba(255,255,255,0.02)",
                                backdropFilter: "blur(6px)",
                            }}
                        >
                            <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                                <Icon className="text-base" color="#E4E4E7" aria-hidden />
                            </div>
                            <h3 className="text-base font-semibold text-center">{option.title}</h3>
                            <p className="mt-2 text-sm text-gray-400 text-center">{option.description}</p>
                        </motion.a>
                    );
                })}
            </div>
        </SectionShell>
    );
};

export default Donations;
