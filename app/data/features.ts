type Feature = {
    title: string;
    description: string;
    icon: {
        viewBox: string;
        d: string;
    };
};

const features: Feature[] = [
    {
        title: "Local-first",
        description: "Your strategies stay on your device. No lock-in.",
        icon: {
            viewBox: "0 0 24 24",
            d: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
        },
    },
    {
        title: "Minimal UX",
        description: "Clean, distraction-free interface for faster planning.",
        icon: {
            viewBox: "0 0 24 24",
            d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
        },
    },
    {
        title: "Open source",
        description: "Built by and for the community.",
        icon: {
            viewBox: "0 0 24 24",
            d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        },
    },
];

export default features;
