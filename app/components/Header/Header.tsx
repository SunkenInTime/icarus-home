"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import { ACCENT, ACCENT_HOVER } from "@/app/constants";

const Header = () => {
    const pathname = usePathname();
    const onHome = pathname === "/";
    const onHackathon = pathname?.startsWith("/hackathon");

    const homeSection = (hash: string) => (onHome ? hash : `/${hash}`);
    const downloadHref = onHackathon ? "#download" : homeSection("#download");

    return (
        <header className="sticky top-0 z-40">
            <div
                className="backdrop-blur-md"
                style={{
                    background: "rgba(9,9,11,0.75)",
                    borderBottom: "1px solid #1d1d20",
                }}
            >
                <div className="mx-auto max-w-6xl px-6">
                    <nav className="flex h-16 items-center justify-between" aria-label="Main">
                        <Link href="/" className="flex items-center gap-3">
                            <span
                                className="relative flex h-8 w-8 items-center justify-center rounded-md overflow-hidden"
                                style={{
                                    background: "#0d0d10",
                                    border: "1px solid #27272a",
                                    boxShadow: "inset 0 0 0 1px rgba(124,58,237,0.18)",
                                }}
                            >
                                <img
                                    width={28}
                                    height={28}
                                    className="rounded-sm"
                                    src="https://l7y6qjyp5m.ufs.sh/f/usun6XPoM0UC5l0lqgyKoUQXBjdA4sgHc3Dqt8pWIzr2e0iN"
                                    alt="Icarus logo"
                                />
                            </span>
                            <div className="flex items-center gap-2 leading-none">
                                <span className="font-display text-lg font-semibold tracking-tight">
                                    Icarus
                                </span>
                                <span className="callsign hidden sm:inline" style={{ fontSize: 9, color: ACCENT }}>
                                    BETA
                                </span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-1 text-sm">
                            {[
                                ["Features", homeSection("#features")],
                                ["Compare", homeSection("#compare")],
                                ["Roadmap", homeSection("#beta")],
                                ["Donate", homeSection("#donate")],
                                ["Community", homeSection("#community")],
                                ["Hackathon", "/hackathon"],
                            ].map(([label, href]) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    className="rounded-md px-3 py-1.5 text-sm transition-colors"
                                    style={{ color: "#d4d4d8" }}
                                    whileHover={{ backgroundColor: "rgba(124,58,237,0.10)", color: "#fff" }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {label}
                                </motion.a>
                            ))}
                        </div>

                        <motion.a
                            href={downloadHref}
                            className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium"
                            style={{ backgroundColor: ACCENT, color: "#fff" }}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97, y: 0 }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                        >
                            <span>Get Icarus</span>
                            <FaArrowRight aria-hidden size={11} />
                        </motion.a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
