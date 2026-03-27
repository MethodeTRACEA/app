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
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "serif"],
        body: ['"Cormorant Garamond"', "serif"],
        sans: ['"DM Sans"', "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
    },
  },
  plugins: [],
};
export default config;
