/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1720",
          soft: "#17212B",
          line: "#2A3541",
        },
        paper: {
          DEFAULT: "#F7F6F3",
          soft: "#FFFFFF",
          line: "#E3E0D9",
        },
        signal: {
          DEFAULT: "#F5A623",
          dark: "#C97A1F",
        },
        good: "#4ADE80",
        bad: "#F0655A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      fontFeatureSettings: {
        tabular: '"tnum"',
      },
    },
  },
  plugins: [],
};
