import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          DEFAULT: "#C4704A",
          light: "#F0D5C4",
          dark: "#8A4A2F",
        },
        beige: {
          DEFAULT: "#F5EDE2",
          dark: "#E8D8C6",
        },
        cream: "#FAF7F2",
        espresso: "#2C1F14",
        sage: {
          DEFAULT: "#8A9E7A",
          light: "#D6E2CE",
        },
        dusty: "#C4998A",
        "warm-gray": "#9E8E80",

        // ── TRACÉA Design System (palette sombre) ──
        "t-nuit": "#231916",
        "t-terracotta": "#6E4332",
        "t-brume": "#4B352D",
        "t-dore": "#D6A56A",
        "t-beige": "#E8D8C7",
        "t-creme": "#CDB9A4",
        "t-sauge": "#6E7D6D",
        "t-bronze": "#A7774F",
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "serif"],
        body: ['"Cormorant Garamond"', "serif"],
        sans: ['"DM Sans"', "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
      spacing: {
        "t-xs": "8px",
        "t-sm": "12px",
        "t-md": "16px",
        "t-lg": "24px",
        "t-xl": "32px",
      },
      boxShadow: {
        "t-soft": "0 6px 20px rgba(0,0,0,0.18)",
        "t-glow": "0 0 30px rgba(214,165,106,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
