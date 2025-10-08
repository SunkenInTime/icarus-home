"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { FaDownload } from "react-icons/fa";

import { GLASS_BG, BORDER_SOFT, RING, ACCENT, ACCENT_HOVER } from "@/app/constants";

const Header = () => {
    return (
        <header className="relative z-10">
            <div className="border-b backdrop-blur-md" style={{ background: GLASS_BG, borderColor: BORDER_SOFT }}>
                <div className="mx-auto max-w-6xl px-6">
                    <nav className="flex h-16 items-center justify-between" aria-label="Main">
                        <Link href="#hero" className="flex items-center gap-3">
                            <img width={28} height={28} className="rounded-md" src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN" alt="Icarus logo" />
                            <span className="text-base font-semibold tracking-tight">Icarus</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6 text-sm">
                            {[
                                ["Features", "#features"],
                                ["Compare", "#compare"],
                                ["Roadmap", "#beta"],
                                ["Donate", "#donate"],
                                ["Community", "#community"],
                            ].map(([label, href]) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    className="text-gray-300 rounded px-1 focus-visible:outline-none focus-visible:ring-2"
                                    style={{
                                        borderColor: RING,
                                    }}
                                    whileHover={{ y: -2, color: "#fff", textShadow: "0 0 18px rgba(123,97,255,0.45)" }}
                                    whileTap={{ y: 0 }}
                                >
                                    {label}
                                </motion.a>
                            ))}
                        </div>

                        <motion.a
                            href="#download"
                            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            style={{
                                backgroundColor: ACCENT,
                                color: "#fff",
                                borderColor: RING,

                                WebkitTapHighlightColor: "transparent",
                            }}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97, y: 0 }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                        >
                            <FaDownload aria-hidden />
                            <span>Download</span>
                        </motion.a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
