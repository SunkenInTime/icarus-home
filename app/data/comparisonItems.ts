type ComparisonItem = {
    feature: string;
    icarus: boolean;
    competitors?: boolean;
};

const comparisonItems: ComparisonItem[] = [
    { feature: "Local storage", icarus: true, competitors: false },
    { feature: "No subscription", icarus: true, competitors: false },
    { feature: "Offline access", icarus: true, competitors: false },
    { feature: "Live collaboration", icarus: false, competitors: true },
    { feature: "Open source", icarus: true, competitors: false },
    { feature: "Custom line-ups", icarus: true, competitors: true },
    { feature: "Strategy sharing", icarus: true, competitors: false },
];

export default comparisonItems;
