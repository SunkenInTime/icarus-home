import { ACCENT, BORDER_SOFT } from "@/app/constants";
import { motion } from "framer-motion";
import features from "@/app/data/features";
import SectionShell from "../ui/SectionShell";

const Features = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
    return (
        <SectionShell id="features" title="Why choose Icarus?">
            <p className="mt-3 text-gray-400 text-center">Focused on speed, privacy, and a clean workflow.</p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
                {features.map((feature, i) => (
                    <motion.article
                        key={feature.title}
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.35, delay: i * 0.04 }}
                        whileHover={{ y: -3, borderColor: ACCENT, boxShadow: "0 12px 30px rgba(123,97,255,0.12)" }}
                        className="rounded-lg p-5"
                        style={{
                            border: `1px solid ${BORDER_SOFT}`,
                            background: "rgba(255,255,255,0.02)",
                            backdropFilter: "blur(6px)",
                        }}
                    >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <svg className="h-5 w-5" fill="none" stroke="#E4E4E7" viewBox={feature.icon.viewBox} aria-hidden xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon.d} />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold">{feature.title}</h3>
                        <p className="mt-2 text-gray-400 text-sm">{feature.description}</p>
                    </motion.article>
                ))}
            </div>
        </SectionShell>
    );
};

export default Features;
