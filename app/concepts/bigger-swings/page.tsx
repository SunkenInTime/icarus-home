import type { Metadata } from "next";
import BiggerSwingsClient from "./BiggerSwingsClient";

export const metadata: Metadata = {
    title: "Bigger swings — Icarus homepage",
    robots: { index: false, follow: false },
};

export default function BiggerSwingsPage() {
    return <BiggerSwingsClient />;
}
