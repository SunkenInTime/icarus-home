"use client";

import SocialButton from "@/app/components/ui/SocialButton";
import { ACCENT } from "@/app/constants";
import Wordmark, { wordmarkAspect } from "@/app/components/Wordmark";

const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer
            className="relative z-10"
            style={{
                borderTop: "1px solid #1d1d20",
                background: "linear-gradient(180deg, rgba(9,9,11,0) 0%, rgba(124,58,237,0.04) 100%)",
            }}
        >
            <div className="mx-auto max-w-6xl px-6 py-12">
                {/* Top row: brand + links */}
                <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div>
                        <Wordmark height={20} />
                        <p className="mt-3 text-sm max-w-sm" style={{ color: "#a1a1aa" }}>
                            A local-first Valorant strategy planner — built so the gap between an idea and
                            the board is zero.
                        </p>
                        <div className="callsign mt-4" style={{ color: "#52525b" }}>
                            BUILT BY DARA · OPEN SOURCE · MIT
                        </div>
                    </div>

                    <FooterColumn title="PRODUCT" links={[["Features", "/#features"], ["Compare", "/#compare"], ["Roadmap", "/#beta"], ["Download", "/#download"]]} />
                    <FooterColumn title="COMMUNITY" links={[["GitHub", "https://github.com/SunkenInTime/icarus"], ["Discord", "https://discord.gg/PN2uKwCqYB"], ["Twitter", "https://x.com/daradoescode"]]} />
                    <FooterColumn title="LEGAL" links={[["Terms", "/tos"], ["Hackathon", "/hackathon"]]} />
                </div>

                {/* Bottom rule */}
                <div
                    className="mt-12 flex flex-col-reverse md:flex-row items-center justify-between gap-6 pt-6"
                    style={{ borderTop: "1px solid #1d1d20" }}
                >
                    <p className="callsign text-center md:text-left" style={{ color: "#52525b" }}>
                        © {year} ICARUS · ALL RIGHTS RESERVED
                    </p>
                    <div className="flex items-center gap-3">
                        <SocialButton platform="github" href="https://github.com/SunkenInTime/icarus" />
                        <SocialButton platform="discord" href="https://discord.gg/PN2uKwCqYB" />
                        <SocialButton platform="twitter" href="https://x.com/daradoescode" />
                    </div>
                </div>

                {/* Decorative wordmark: the lockup as a mask so the ghost gradient paints through it. */}
                <div
                    aria-hidden
                    className="mt-12 mx-auto select-none"
                    style={{
                        width: "min(100%, 1100px)",
                        aspectRatio: String(wordmarkAspect("lockup")),
                        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(124,58,237,0.0))",
                        WebkitMaskImage: "url(/brand/icarus-wordmark.svg)",
                        maskImage: "url(/brand/icarus-wordmark.svg)",
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                    }}
                />
            </div>
        </footer>
    );
};

const FooterColumn = ({ title, links }: { title: string; links: [string, string][] }) => (
    <div>
        <div className="callsign mb-3">{title}</div>
        <ul className="space-y-2">
            {links.map(([label, href]) => {
                const isExternal = href.startsWith("http");
                return (
                    <li key={label}>
                        <a
                            href={href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noreferrer" : undefined}
                            className="text-sm transition-colors"
                            style={{ color: "#d4d4d8" }}
                            onMouseOver={(e) => (e.currentTarget.style.color = ACCENT)}
                            onMouseOut={(e) => (e.currentTarget.style.color = "#d4d4d8")}
                        >
                            {label}
                        </a>
                    </li>
                );
            })}
        </ul>
    </div>
);

export default Footer;
