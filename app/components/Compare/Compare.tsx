import { BORDER_SOFT } from "@/app/constants";
import comparisonItems from "@/app/data/comparisonItems";
import { motion } from "framer-motion";
import React from "react";
import SectionShell from "../ui/SectionShell";

const Compare = () => {
    return (
        <SectionShell id="compare" title="Switch with confidence">
            <p className="mt-3 text-gray-400 text-center">A quick look at how Icarus stacks up.</p>

            <div
                className="overflow-x-auto rounded-lg mt-10"
                style={{
                    border: `1px solid ${BORDER_SOFT}`,
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(6px)",
                }}
            >
                <table className="w-full text-left">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="py-3 px-4">Feature</th>
                            <th className="py-3 px-4 text-center">Icarus</th>
                            <th className="py-3 px-4 text-center">Competitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonItems.map((item, i) => (
                            <motion.tr key={`${item.feature}-${i}`} className="border-t hover:bg-white/5" style={{ borderColor: BORDER_SOFT }} whileHover={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                                <td className="py-3 px-4 text-gray-300">{item.feature}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={item.icarus ? "text-green-400" : "text-red-400"} aria-label={item.icarus ? "Yes" : "No"}>
                                        {item.icarus ? "✓" : "✗"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={item.competitors ? "text-green-400" : "text-red-400"} aria-label={item.competitors ? "Yes" : "No"}>
                                        {item.competitors ? "✓" : "✗"}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SectionShell>
    );
};

export default Compare;
