/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        circular: [
          '"Plus Jakarta Sans"',
          '"Circular"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        display: [
          '"Plus Jakarta Sans"',
          '"Circular"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        sans: [
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        cream: {
          paper: "#faf8f0",
          DEFAULT: "#faf8f0",
        },
        card: {
          white: "#ffffff",
          DEFAULT: "#ffffff",
        },
        hairline: {
          gray: "#e5e7eb",
          DEFAULT: "#e5e7eb",
        },
        ink: {
          black: "#000000",
          DEFAULT: "#000000",
        },
        charcoal: "#222222",
        fog: {
          gray: "#717171",
          DEFAULT: "#717171",
        },
        marigold: {
          DEFAULT: "#ffdd00",
          hover: "#f5d400",
          active: "#ebca00",
        },
        buttercup: "#f7d046",
        terracotta: {
          DEFAULT: "#d8573f",
          hover: "#c74b34",
          active: "#b8422d",
        },
        blush: {
          border: "#f5d5cf",
          DEFAULT: "#f5d5cf",
        },
        trust: {
          green: "#22c55e",
          DEFAULT: "#22c55e",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        card: "24px",
        modal: "32px",
        hero: "40px",
        full: "9999px",
        pill: "9999px",
      },
      boxShadow: {
        scrapbook: "0 0 2px rgba(0, 0, 0, 0.15), 0 8px 40px rgba(0, 0, 0, 0.04), 0 2px 5px rgba(0, 0, 0, 0.05)",
        subtle: "0 0 2px rgba(0, 0, 0, 0.15), 0 8px 40px rgba(0, 0, 0, 0.04), 0 2px 5px rgba(0, 0, 0, 0.05)",
        card: "0 0 2px rgba(0, 0, 0, 0.12), 0 8px 30px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.04)",
        float: "0 2px 4px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.06)",
        pill: "0 2px 4px rgba(0, 0, 0, 0.06)",
      },
      lineHeight: {
        hero: "0.99",
        tight: "1.1",
        snug: "1.25",
      },
      animation: {
        "fade-in": "fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float-slow": "floatSlow 4s ease-in-out infinite",
        "float-reverse": "floatReverse 4.5s ease-in-out infinite",
        "marquee": "marquee 35s linear infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(-3deg)" },
          "50%": { transform: "translateY(-8px) rotate(-2deg)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0px) rotate(3deg)" },
          "50%": { transform: "translateY(-8px) rotate(4deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};
