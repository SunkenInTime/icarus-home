"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaArrowRight } from "react-icons/fa";

import { ACCENT } from "@/app/constants";
import Wordmark from "@/app/components/Wordmark";

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
                        <Link href="/" className="flex items-center gap-3" aria-label="Icarus home">
                            <Wordmark height={18} />
                            <span className="callsign hidden sm:inline" style={{ fontSize: 9, color: ACCENT }}>
                                BETA
                            </span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1 text-sm">
                            {[
                                ["Features", homeSection("#features")],
                                ["Compare", homeSection("#compare")],
                                ["Roadmap", homeSection("#beta")],
                                ["Donate", homeSection("#donate")],
                                ["Community", homeSection("#community")],
                                ["Hackathon", "/hackathon"],
                            ].map(([label, href]) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="icarus-button icarus-button-ghost icarus-button-sm"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>

                        <a
                            href={downloadHref}
                            className="icarus-button icarus-button-primary"
                        >
                            <span>Get Icarus</span>
                            <FaArrowRight aria-hidden size={11} />
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
