"use client";

import { useEffect, useState } from "react";

import CloserToTheSunClient from "@/app/concepts/closer-to-the-sun/CloserToTheSunClient";
import ShareLinkHandler from "@/app/components/ShareLinkHandler";

/**
 * Production homepage — the "Closer to the Sun" design promoted from
 * app/concepts/closer-to-the-sun. This wrapper only preserves the share-link
 * behavior the old homepage had: Icarus share URLs (?code= / ?token= /
 * /share segments) land here and must render the handoff page instead.
 */

function hasShareCodeInUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("code") || params.has("token")) {
        return true;
    }

    const segments = window.location.pathname
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);

    return segments.some((segment) => segment.toLowerCase() === "share");
}

export default function SunHome() {
    const [shareMode, setShareMode] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setShareMode(hasShareCodeInUrl());
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    if (shareMode) {
        return <ShareLinkHandler />;
    }

    return <CloserToTheSunClient />;
}
