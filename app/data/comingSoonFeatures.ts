export type RoadmapItem = {
    code: string;
    title: string;
    status: "shipping" | "in-progress" | "queued";
};

const comingSoonFeatures: RoadmapItem[] = [
    { code: "MSN-013", title: "Optional online sync", status: "in-progress" },
    { code: "MSN-014", title: "Advanced collaboration tools", status: "queued" },
    { code: "MSN-015", title: "Custom map annotations", status: "in-progress" },
    { code: "MSN-016", title: "Multi-page support", status: "shipping" },
];

export default comingSoonFeatures;
