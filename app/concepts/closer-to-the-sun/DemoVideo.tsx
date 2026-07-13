"use client";

import { useEffect, useRef } from "react";

/**
 * Autoplaying UI demo clip, framed like the hero board preview.
 * Muted and looping; plays only while on screen.
 */

type Props = {
    src: string;
    /** Screen-reader description of what the clip shows. */
    label: string;
    className?: string;
};

export default function DemoVideo({ src, label, className }: Props) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) video.play().catch(() => {});
                else video.pause();
            },
            { threshold: 0.35 },
        );
        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            className={`overflow-hidden rounded-2xl border ${className ?? ""}`}
            style={{
                borderColor: "rgba(255,255,255,0.1)",
                boxShadow:
                    "0 40px 90px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.12)",
            }}
        >
            <video
                ref={ref}
                src={src}
                muted
                playsInline
                loop
                preload="metadata"
                aria-label={label}
                className="block h-auto w-full"
                style={{ aspectRatio: "1664 / 1080" }}
            />
        </div>
    );
}
