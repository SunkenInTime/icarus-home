import type { Metadata } from "next";
import FunctionalLoveClient from "./FunctionalLoveClient";

export const metadata: Metadata = {
    title: "Functional Love — Icarus concept",
    robots: { index: false, follow: false },
};

export default function FunctionalLovePage() {
    return <FunctionalLoveClient />;
}
