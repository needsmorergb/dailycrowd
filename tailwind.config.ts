import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
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
                "display": ["var(--font-jakarta)", "sans-serif"],
                "mono": ["var(--font-space-mono)", "monospace"],
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
