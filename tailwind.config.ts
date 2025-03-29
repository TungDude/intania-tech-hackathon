/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Ensure this matches your file structure
  theme: {
    extend: {
      animation: {
<<<<<<< HEAD
        'zoom-in-door-0': 'zoom-in 4s ease-in-out forwards',
        'fade-in-door-0': 'fade-in 4s ease-in-out forwards',
        'fade-text-0': 'fade-in-out 6s ease-in-out forwards',
      },
      keyframes: {
        'zoom-in': {
          '0%': { transform: 'scale(0.1)', opacity: '0'},
          '50%': { opacity: '1' },
          // '80%': { },
          '100%': { transform: 'scale(8)', opacity: '0' }
=======
        "zoom-in": "zoom-in 0.5s ease-in-out forwards", // Define the animation name, duration, and easing
        "bounce-subtle": "bounce-subtle 0.5s ease-in-out infinite",
      },
      keyframes: {
        "zoom-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" }, // Start small and transparent
          "100%": { transform: "scale(1)", opacity: "1" }, // End at full size and fully visible
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
>>>>>>> 0eca465c7c568252f5501ebb6fe9eb53eb04986f
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-out': {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
    },
  },
  plugins: [],
};
