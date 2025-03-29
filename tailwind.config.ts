/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Ensure this matches your file structure
  theme: {
    extend: {
      animation: {
        "zoom-in-door-0": "zoom-in 4s ease-in-out forwards",
        "fade-in-door-0": "fade-in 4s ease-in-out forwards",
        "fade-text-0": "fade-in-out 6s ease-in-out forwards",
        "zoom-in": "zoom-in-2 0.5s ease-in-out forwards",
        "bounce-subtle": "bounce-subtle 0.5s ease-in-out infinite",
      },
      keyframes: {
        "zoom-in": {
          "0%": { transform: "scale(0.1)", opacity: "0" },
          "50%": { opacity: "1" },
          // '80%': { },
          "100%": { transform: "scale(8)", opacity: "0" },
        },
        "zoom-in-2": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-out": {
          "0%": { opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
