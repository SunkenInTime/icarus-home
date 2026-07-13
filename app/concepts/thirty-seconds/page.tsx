import type { Metadata } from "next";
import ThirtySecondsClient from "./ThirtySecondsClient";

export const metadata: Metadata = {
    title: "Thirty Seconds — Icarus concept",
    robots: { index: false, follow: false },
};

export default function ThirtySecondsPage() {
    return <ThirtySecondsClient />;
}
