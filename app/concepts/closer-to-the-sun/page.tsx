import type { Metadata } from "next";
import CloserToTheSunClient from "./CloserToTheSunClient";

export const metadata: Metadata = {
    title: "Closer to the Sun — Icarus concept",
    robots: { index: false, follow: false },
};

export default function CloserToTheSunPage() {
    return <CloserToTheSunClient />;
}
