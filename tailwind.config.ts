import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00D1FF", // Electric Blue
          dark: "#00A3C7",
        },
        secondary: {
          DEFAULT: "#1A1A1A", // Dark Slate
          light: "#2D2D2D",
        },
        accent: {
          DEFAULT: "#70FF00", // Neon Green (Eco-friendly)
        },
        background: "#0A0A0A",
        foreground: "#FFFFFF",
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
