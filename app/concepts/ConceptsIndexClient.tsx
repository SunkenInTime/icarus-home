"use client";

import Link from "next/link";
import FolderCard, { PeekSheet } from "./_shared/FolderCard";
import { palette } from "./_shared/tokens";

const CONCEPTS = [
    {
        slug: "living-board",
        name: "The Living Board",
        color: "#7c3aed",
        premise: "The page is the board. Draw on it.",
    },
    {
        slug: "functional-love",
        name: "Functional Love",
        color: "#3a7e5d",
        premise: "A library of match-winning ideas.",
    },
    {
        slug: "thirty-seconds",
        name: "Thirty Seconds",
        color: "#ff9800",
        premise: "A timeout you play through.",
    },
    {
        slug: "scraps",
        name: "Scraps",
        color: "#b23b3b",
        premise: "Better than the group chat.",
    },
    {
        slug: "closer-to-the-sun",
        name: "Closer to the Sun",
        color: "#f08234",
        premise: "The myth, reclaimed.",
    },
] as const;

function ConceptPeek({ index, color }: { index: number; color: string }) {
    return (
        <PeekSheet>
            <span
                style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color,
                }}
            >
                Concept {String(index + 1).padStart(2, "0")}
            </span>
        </PeekSheet>
    );
}

export default function ConceptsIndexClient() {
    return (
        <div
            className="min-h-screen tactical-dots"
            style={{ background: palette.bg, color: palette.fg }}
        >
            <main className="mx-auto max-w-[1080px] px-6 py-20">
                <p className="callsign" style={{ color: palette.violet }}>
                    Homepage exploration
                </p>
                <h1
                    className="font-onest mt-3"
                    style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.04 }}
                >
                    Five concepts,
                    <br />
                    <span style={{ color: palette.muted }}>filed for review.</span>
                </h1>
                <p className="mt-5 max-w-lg text-[15px] leading-[1.65]" style={{ color: palette.muted }}>
                    Each folder holds a complete, interactive take on the Icarus
                    homepage — dark, whimsical, and built on the app&apos;s own
                    signature moves: the folder pocket, the drag tilt, and the
                    dither-fire shader. Hover a folder to peek. Click to open.
                </p>

                <div className="mt-14 flex flex-wrap gap-x-8 gap-y-10">
                    {CONCEPTS.map((concept, index) => (
                        <FolderCard
                            key={concept.slug}
                            href={`/concepts/${concept.slug}`}
                            name={concept.name}
                            baseColor={concept.color}
                            scale={1.15}
                            peeks={[
                                <ConceptPeek key="front" index={index} color={concept.color} />,
                                <PeekSheet key="back" />,
                            ]}
                            footer={concept.premise}
                        />
                    ))}
                </div>

                <p className="mt-16 text-[12px]" style={{ color: palette.dim }}>
                    Current production page stays at{" "}
                    <Link href="/" className="underline underline-offset-2 hover:text-white">
                        icarusstrats.com
                    </Link>
                    . Nothing here ships until one wins.
                </p>
            </main>
        </div>
    );
}
