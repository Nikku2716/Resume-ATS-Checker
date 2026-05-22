/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Bangers"', "cursive", "system-ui"],
        body: ['"Comic Neue"', "cursive", "system-ui"],
      },
      colors: {
        frutiger: {
          aqua: "#B8E6E6",
          sky: "#00B5E2",
          teal: "#009B9B",
          mint: "#7ED9C4",
          coral: "#FF9A9E",
          lavender: "#B39DDB",
          peach: "#FFD4A8",
          white: "#F0FBFB",
          black: "#1A1A1A",
        },
      },
      boxShadow: {
        brutal: "6px 6px 0px #1A1A1A",
        "brutal-lg": "8px 8px 0px #1A1A1A",
        "brutal-hover": "4px 4px 0px #1A1A1A",
      },
      animation: {
        bounce2: "bounce2 0.6s ease-out",
        pop: "pop 0.3s ease-out",
        kaboom: "kaboom 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        bounce2: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pop: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        kaboom: {
          "0%": { transform: "scale(0.3) rotate(-10deg)", opacity: "0" },
          "50%": { transform: "scale(1.15) rotate(3deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
