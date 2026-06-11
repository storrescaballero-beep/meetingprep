import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0B1B2B", soft: "#33475B", mute: "#6B7B8C" },
        canvas: "#F6F7F9",
        line: "#E4E8EC",
        accent: { DEFAULT: "#0E7565", hover: "#0A5D51", soft: "#E6F2EF" },
        signal: { DEFAULT: "#C77414", soft: "#FBF1E2" },
        danger: "#B3382C",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Instrument Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,27,43,0.06), 0 1px 1px rgba(11,27,43,0.04)",
        lift: "0 8px 24px rgba(11,27,43,0.12)",
      },
      borderRadius: { card: "12px" },
    },
  },
  plugins: [],
};
export default config;
