/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#1E1E1E",
                surface: "#252525",
                primary: "#FF4655",
                secondary: "#2A2A2A",
            },
        },
    },
    plugins: [],
};
