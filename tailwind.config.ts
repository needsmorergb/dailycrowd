import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "bg-dark": "#0A0A0A",
                "acid-green": "#ccff00",
                "neon-purple": "#9D00FF",
                "glass": "rgba(255, 255, 255, 0.03)",
            },
            fontFamily: {
                "mono": ["var(--font-jetbrains)", "monospace"],
            },
            backgroundImage: {
                'carbon-fiber': "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
            },
            boxShadow: {
                'glow-green': '0 0 10px rgba(204, 255, 0, 0.4)',
                'glow-purple': '0 0 10px rgba(157, 0, 255, 0.4)',
            },
            keyframes: {
                ticker: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            },
            animation: {
                ticker: 'ticker 30s linear infinite',
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
