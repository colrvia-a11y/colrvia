/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        linen: "var(--linen)",
        ink: "var(--ink)",
        "ink-subtle": "var(--ink-subtle)",
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-contrast": "var(--brand-contrast)",
        accent: "var(--accent)",
        highlight: "var(--highlight)",
        info: "var(--info)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        sm: "var(--radius-sm)",
      },
      container: { center: true, padding: "16px" },
      maxWidth: { content: "72rem" }, // ~1152px
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "var(--font-inter)", "serif"],
      },
      boxShadow: {
        card: "0 6px 24px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        springy: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    }
  },
  plugins: []
}