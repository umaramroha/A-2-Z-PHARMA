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
        primary: { DEFAULT: "#2D5F4C", light: "#3E8A6E", dark: "#1A3C2E" },
        secondary: { DEFAULT: "#E89F4E", light: "#F0B678", dark: "#D68A32" },
        background: { DEFAULT: "#F9F7F2", dark: "#1A1A1A" },
        surface: { DEFAULT: "#FFFFFF", dark: "#2A2A2A" },
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;

