/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-slate': '#1b1f2a',
        'neon-blue': '#00eaff',
        'metallic-silver': '#a8a8a8',
        'neon-green': '#39ff14',
        'charcoal': '#2e2e3a',
      },
    },
  },
  plugins: [],
};

