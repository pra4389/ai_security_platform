/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          dark: "#0A0A0A",
          card: "#121212",
          orange: "#FF6600",
          "orange-light": "#FF8533",
          "orange-dark": "#CC5200",
          cyan: "#00FFFF",
          "cyan-light": "#33FFFF",
          "cyan-dark": "#00CCCC",
        },
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        poppins: ["Poppins", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "hero-sm": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        section: ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "section-sm": ["2rem", { lineHeight: "1.2" }],
      },
      boxShadow: {
        "glow-orange": "0 0 20px rgba(255,102,0,0.35)",
        "glow-orange-lg": "0 0 40px rgba(255,102,0,0.25)",
        "glow-cyan": "0 0 20px rgba(0,255,255,0.35)",
        "glow-cyan-lg": "0 0 40px rgba(0,255,255,0.2)",
        "glow-orange-sm": "0 0 10px rgba(255,102,0,0.25)",
        "glow-cyan-sm": "0 0 10px rgba(0,255,255,0.25)",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "grid-fade": "grid-fade 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "grid-fade": {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.08" },
        },
      },
    },
  },
  plugins: [],
}
