import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary brand palette (from MR Brand Guidelines)
        white: "#FFFFFF",
        black: "#000000",
        "void-indigo": "#200049",
        "electric-violet": "#6104EB",
        "electric-lime": "#A9F000",
        // Secondary
        "emerald-teal": "#09946D",
        "sky-blue": "#60A7DD",
        coral: "#F2594B",
        // Surface tokens — dark by default
        surface: {
          base: "#000000",
          raised: "#0B0118",
          card: "#120030",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-firs-neue)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-firs-neue)", "ui-sans-serif", "system-ui"],
      },
      backgroundImage: {
        // Brand gradients
        "gradient-1":
          "linear-gradient(90deg, #6104EB 0%, #09946D 55%, #A9F000 100%)",
        "gradient-2": "linear-gradient(90deg, #A9F000 0%, #6104EB 100%)",
        "gradient-3":
          "linear-gradient(90deg, #60A7DD 0%, #09946D 55%, #A9F000 100%)",
      },
      maxWidth: {
        container: "1280px",
      },
      letterSpacing: {
        tightish: "-0.015em",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "fade-up": "fade-up 0.7s ease forwards",
        "gradient-pan": "gradient-pan 12s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
