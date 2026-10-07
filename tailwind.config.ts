import type { Config } from "tailwindcss";

// ZMR Mobility brand palette — source: "ZMR Mobility Colors" guide.
// Use the named tokens below; never hard-code hex values in components.
const zmr = {
  forest: "#2D473E",   // text, headings, dark sections
  green600: "#577440", // primary buttons (white text)
  green700: "#456344", // button hover; accessible small text/link colour
  leaf: "#6A8E4E",     // icons, large text, links on large sizes
  sage: "#8BAC68",     // secondary icons
  lime: "#B1D082",     // badges, highlights, selected states
  tint: "#F0F4ED",     // alternate section background
  cream: "#F4EFE9",    // page background
  green900: "#1D2E28", // footer
};

const config: Config = {
  content: [
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: zmr.forest,
        leaf: zmr.leaf,
        sage: zmr.sage,
        lime: zmr.lime,
        tint: zmr.tint,
        cream: zmr.cream,
        green: { 600: zmr.green600, 700: zmr.green700, 900: zmr.green900 },
        // Semantic aliases used across the codebase
        primary: {
          50: zmr.tint,
          100: "#E3EBDA",
          200: "#CFDDBE",
          300: zmr.lime,
          400: zmr.sage,
          DEFAULT: zmr.green600, // buttons & fills (white text passes AA)
          dark: zmr.green700,    // hover + small text on light backgrounds
          deep: zmr.forest,
        },
        secondary: { DEFAULT: zmr.tint, light: "#F7F9F5" },
        accent: { DEFAULT: zmr.green700, light: zmr.lime },
        // Text/border ink — Forest with alpha (text-ink/70, border-ink/10)
        ink: "rgb(45 71 62 / <alpha-value>)",
        background: zmr.cream,
        foreground: zmr.forest,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(45,71,62,0.05), 0 8px 24px -12px rgba(45,71,62,0.16)",
        "card-hover": "0 2px 4px rgba(45,71,62,0.06), 0 20px 40px -16px rgba(87,116,64,0.35)",
      },
      backgroundImage: {
        "zmr-gradient": `linear-gradient(90deg, ${zmr.leaf} 0%, ${zmr.sage} 50%, ${zmr.lime} 100%)`,
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
