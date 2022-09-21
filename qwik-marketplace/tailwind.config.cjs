module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
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
  plugins: [],
};
