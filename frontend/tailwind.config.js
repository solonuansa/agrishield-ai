/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // AgriShield color palette (dari IMPLEMENTATION_PLAN.md)
        primary: {
          DEFAULT: "#2D6A4F",
          50: "#E8F5EE",
          100: "#C6E6D5",
          200: "#95CEAF",
          300: "#63B689",
          400: "#3D8F63",
          500: "#2D6A4F",
          600: "#245740",
          700: "#1B4331",
          800: "#122E22",
          900: "#091913",
        },
        secondary: {
          DEFAULT: "#F4A261",
          light: "#F8C49A",
          dark: "#E07C2E",
        },
        danger: "#E63946",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
