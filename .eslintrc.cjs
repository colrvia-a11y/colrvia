// Accessibility-focused ESLint configuration
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["jsx-a11y", "react"],
  rules: {
    "react/button-has-type": "warn",
    "jsx-a11y/no-noninteractive-element-interactions": "warn",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/anchor-is-valid": "warn"
  }
}
