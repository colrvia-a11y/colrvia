// Accessibility-focused ESLint configuration
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["jsx-a11y", "react"],
  rules: {
    "react/button-has-type": "error",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-noninteractive-element-interactions": "warn",
    "no-restricted-syntax": [
      "warn",
      {
        selector:
          "JSXOpeningElement[name.name='button']:not(:has(JSXAttribute[name.name='type']))",
        message: "All <button> need a type.",
      },
    ],
  },
};
