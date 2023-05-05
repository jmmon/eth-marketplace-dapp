/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        qwikBlue: {
          light: "#24abff", // 10% more lightness?
          DEFAULT: "#0093ee",
          // dark: "#00558a", // 20% less lightness
          // dark: "#0065a3", // 15% less lightness
          dark: "#0080f0", // 15% less lightness
        },
      },
    },

  },

  plugins: [require("@tailwindcss/forms")],
};
