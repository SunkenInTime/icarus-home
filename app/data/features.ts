type Feature = {
    code: string;       // tactical callsign (e.g. "01 / SPEED")
    title: string;
    description: string;
    icon: {
        viewBox: string;
        d: string;
    };
};

const features: Feature[] = [
    {
        code: "01 / SPEED",
        title: "Zero gap",
        description:
            "Designed so the distance between an idea and the board is nothing. Open the app, start drawing — no menus to dig through.",
        icon: {
            viewBox: "0 0 24 24",
            // lightning bolt
            d: "M13 2 L4 14 H11 L9 22 L20 9 H13 Z",
        },
    },
    {
        code: "02 / CRAFT",
        title: "Customizable",
        description:
            "Tune the board to your team. Map themes, color palettes, agent presets, draw tools — everything bends to your workflow.",
        icon: {
            viewBox: "0 0 24 24",
            // sliders
            d: "M4 6h10 M18 6h2 M4 12h4 M12 12h8 M4 18h12 M20 18h0 M14 4v4 M8 10v4 M16 16v4",
        },
    },
    {
        code: "03 / PRICE",
        title: "Free, forever",
        description:
            "No subscriptions, no paywalls, no \"pro\" tier. Icarus is free and open source. The roadmap is yours to read and steer.",
        icon: {
            viewBox: "0 0 24 24",
            // open lock
            d: "M7 11V7a5 5 0 0 1 9.9-1 M5 11h14v10H5z",
        },
    },
    {
        code: "04 / TEMPO",
        title: "Updates fast",
        description:
            "Auto-updater pushes new builds the moment they ship. Bugs get fixed in days, not quarters. Community driven.",
        icon: {
            viewBox: "0 0 24 24",
            // refresh arrows
            d: "M21 12a9 9 0 1 1-3.5-7.1 M21 4v5h-5",
        },
    },
    {
        code: "05 / FLOW",
        title: "Responsive",
        description:
            "60+ FPS canvas, native desktop performance, snappy keyboard shortcuts. The board never gets in the way of your team.",
        icon: {
            viewBox: "0 0 24 24",
            // signal bars
            d: "M4 20v-4 M10 20v-9 M16 20v-13 M22 20V4",
        },
    },
    {
        code: "06 / TRUST",
        title: "Local-first",
        description:
            "Your strategies stay on your device. No accounts, no servers, no telemetry by default. Export when you're ready.",
        icon: {
            viewBox: "0 0 24 24",
            // shield
            d: "M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z",
        },
    },
];

export default features;
