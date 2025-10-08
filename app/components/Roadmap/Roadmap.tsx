import { motion } from "framer-motion";

import GlassDeviceFrame from "@/app/components/ui/GlassDeviceFrame";

import comingSoonFeatures from "@/app/data/comingSoonFeatures";

import { PREVIEW_IMG, TEXT_SOFT, BORDER_SOFT } from "@/app/constants";

import { AnimationVariants } from "@/app/types/AnimationVariants";

const Roadmap = ({ variants }: { variants: AnimationVariants }) => {
    return (
        <section id="beta" className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid gap-10 md:grid-cols-2 items-center">
                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }} variants={variants.fadeIn}>
                        <GlassDeviceFrame rounded="lg">
                            <img src={PREVIEW_IMG} alt="Icarus board" className="block w-full" style={{ maxHeight: 400, objectFit: "cover" }} />
                        </GlassDeviceFrame>
                    </motion.div>

                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }} variants={variants.fadeUp} className="space-y-4">
                        <span
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                                color: TEXT_SOFT,
                                border: `1px solid ${BORDER_SOFT}`,
                                background: "rgba(255,255,255,0.03)",
                                backdropFilter: "blur(6px)",
                            }}
                        >
                            Roadmap
                        </span>
                        <h3 className="text-2xl font-semibold">Currently in Beta</h3>
                        <p className="text-gray-300">Iterating toward 1.0 with focused, useful releases. Join the community for early builds and feedback.</p>

                        <ul className="mt-2 space-y-2">
                            {comingSoonFeatures.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <span className="mt-0.5 text-white/70">•</span>
                                    <span className="text-gray-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Roadmap;
