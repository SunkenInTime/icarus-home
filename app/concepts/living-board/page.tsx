import type { Metadata } from "next";
import LivingBoardClient from "./LivingBoardClient";

export const metadata: Metadata = {
    title: "The Living Board — Icarus concept",
    robots: { index: false, follow: false },
};

export default function LivingBoardPage() {
    return <LivingBoardClient />;
}
