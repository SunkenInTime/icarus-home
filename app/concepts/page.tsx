import type { Metadata } from "next";
import ConceptsIndexClient from "./ConceptsIndexClient";

export const metadata: Metadata = {
    title: "Homepage concepts",
    robots: { index: false, follow: false },
};

export default function ConceptsIndexPage() {
    return <ConceptsIndexClient />;
}
