/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0E0E10",
                surface: "#131318",
                primary: "#7B61FF", // app accent
                secondary: "#1C1C22",
            },
        },
    },
    plugins: [],
};
