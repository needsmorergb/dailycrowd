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
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "#141414",
                    foreground: "#ccff00",
                },
                secondary: {
                    DEFAULT: "#f7f7f7",
                    foreground: "#141414",
                },
                muted: {
                    DEFAULT: "#f0f0f0",
                    foreground: "#666666",
                },
                accent: {
                    DEFAULT: "#ccff00",
                    foreground: "#141414",
                    purple: "#b026ff",
                },
                card: {
                    DEFAULT: "#ffffff",
                    foreground: "#141414",
                },
                popover: {
                    DEFAULT: "#ffffff",
                    foreground: "#141414",
                },
            },
            fontFamily: {
                display: ["Plus Jakarta Sans", "sans-serif"],
                mono: ["Space Mono", "monospace"],
                sans: ["Plus Jakarta Sans", "sans-serif"],
            },
            borderRadius: {
                lg: "0.5rem",
                md: "0.25rem",
                sm: "0.125rem",
            },
            backgroundImage: {
                'grid-pattern': "radial-gradient(#141414 1px, transparent 1px)",
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
