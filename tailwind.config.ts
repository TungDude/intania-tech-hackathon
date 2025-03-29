/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Ensure this matches your file structure
  theme: {
    extend: {
      animation: {
        'zoom-in': 'zoom-in 0.5s ease-in-out forwards', // Define the animation name, duration, and easing
      },
      keyframes: {
        'zoom-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' }, // Start small and transparent
          '100%': { transform: 'scale(1)', opacity: '1' }, // End at full size and fully visible
        },
      },
    },
  },
  plugins: [],
};