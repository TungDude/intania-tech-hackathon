/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Ensure this matches your file structure
  theme: {
    extend: {
      animation: {
        'zoom-in-door-0': 'zoom-in 4s ease-in-out forwards',
        'fade-in-door-0': 'fade-in 4s ease-in-out forwards',
        'fade-text-0': 'fade-in-out 6s ease-in-out forwards',
        'scale-up-cloth-3': 'scale-up 0.01s linear forwards',
        'pulse-cloth-3': 'pulse 2s linear infinite',
        'fade-text-3': 'fade-bubble 5s linear',
        'fall-down': 'fall-down 2s ease-in-out forwards',
        'float-down': 'float-down 2s ease-in-out forwards',
      },
      keyframes: {
        'zoom-in': {
          '0%': { transform: 'scale(0.1)', opacity: '0'},
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(8)', opacity: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-out': {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scale-up': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.2)' },
        },
        'pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-bubble': {
          '0%': { opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fall-down': {
          '0%': { transform: 'translateX(10px) translateY(0)' },
          '3%, 9%, 15%': { transform: 'translateX(-10px)' },
          '6%, 12%': { transform: 'translateX(10px)' },
          '40%': { transform: 'translateY(-30vh)' },
          '100%': { transform: 'translateX(0) translateY(100vh)' },
        },
        'float-down': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [],
};