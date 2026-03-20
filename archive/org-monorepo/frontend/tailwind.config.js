/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B21B6",
          dark: "#4C1D95",
        },
        secondary: "#2563EB",
        accent: "#EC4899",
        success: "#10B981",
      },
      fontFamily: {
        "space-grotesk": ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        xxs: "0.625rem",
      },
      spacing: {
        18: "4.5rem",
        112: "28rem",
        128: "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [],
};
