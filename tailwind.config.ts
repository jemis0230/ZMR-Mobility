import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ZMR light-blue brand palette
        primary: {
          50: "#EEF5FF",
          100: "#DCEAFE",
          200: "#B9D5FC",
          300: "#8DBAF8",
          400: "#4F95F0",
          DEFAULT: "#1A73E8", // ZMR Blue
          dark: "#1557B0",
          deep: "#0E3F86",
        },
        secondary: {
          DEFAULT: "#EAF2FD", // Soft sky panel
          light: "#F7FAFF",
        },
        accent: {
          DEFAULT: "#16A34A", // Eco green (matches logo leaves)
          light: "#DCFCE7",
        },
        // Text/border ink — use with alpha (text-ink/60, border-ink/10)
        ink: "rgb(15 23 42 / <alpha-value>)",
        background: "#F4F8FE",
        foreground: "#0F172A",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)",
        "card-hover": "0 2px 4px rgba(15,23,42,0.05), 0 20px 40px -16px rgba(26,115,232,0.28)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
