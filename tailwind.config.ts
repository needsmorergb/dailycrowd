import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#141414",
                "background-light": "#f7f7f7",
                "background-dark": "#191919",
                "neon-green": "#ccff00",
                "neon-purple": "#b026ff",
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"],
                "mono": ["Space Mono", "monospace"],
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
