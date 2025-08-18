import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          peach: "var(--brand-peach)",
          green: "var(--brand-green)",
          ink: "var(--brand-ink)",
          sand: "var(--brand-sand)",
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)"
      }
    },
  },
  plugins: [],
};
export default config;
