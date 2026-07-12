import type { Metadata } from "next";
import ScrapsClient from "./ScrapsClient";

export const metadata: Metadata = {
    title: "Scraps — Icarus concept",
    robots: { index: false, follow: false },
};

export default function ScrapsConceptPage() {
    return <ScrapsClient />;
}
