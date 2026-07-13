"use client";

import { useEffect, useState } from "react";
import { palette, shadow } from "../_shared/tokens";

/**
 * The app's pages bar, bottom-left. Lists the four board pages, smooth-scrolls
 * on click, and tracks the active section with an IntersectionObserver. Active
 * item gets violet text and a small violet dot. On mobile it collapses to just
 * the page numbers so it never fights the tool dock along the bottom.
 */

const PAGES = [
    { id: "page-1", n: 1, label: "The pitch" },
    { id: "page-2", n: 2, label: "The tools" },
    { id: "page-3", n: 3, label: "Yours, locally" },
    { id: "page-4", n: 4, label: "Download" },
] as const;

export default function PagesBar() {
    const [active, setActive] = useState("page-1");

    useEffect(() => {
        const sections = PAGES.map((p) => document.getElementById(p.id)).filter(
            (el): el is HTMLElement => el !== null,
        );
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]) setActive(visible[0].target.id);
            },
            { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
        );
        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    const go = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <nav
            aria-label="Board pages"
            className="fixed bottom-4 left-4 z-[60]"
            style={{
                background: "rgba(24,24,27,0.96)",
                border: `1px solid ${palette.border}`,
                borderRadius: 12,
                padding: 5,
                boxShadow: shadow.menuLift,
            }}
        >
            <ul className="flex flex-col gap-0.5">
                {PAGES.map((p) => {
                    const on = active === p.id;
                    return (
                        <li key={p.id}>
                            <button
                                type="button"
                                onClick={() => go(p.id)}
                                aria-current={on ? "true" : undefined}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
                                style={{ color: on ? palette.lavender : palette.muted }}
                            >
                                <span
                                    aria-hidden
                                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors"
                                    style={{ background: on ? palette.violet : palette.dim }}
                                />
                                <span
                                    className="callsign"
                                    style={{ color: "inherit", fontSize: 10, letterSpacing: "0.12em" }}
                                >
                                    {p.n}
                                </span>
                                <span
                                    className="hidden text-[12px] font-medium sm:inline"
                                    style={{ color: "inherit" }}
                                >
                                    {p.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
