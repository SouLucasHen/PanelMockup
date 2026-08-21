/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  safelist: ["static"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Sora",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      colors: {
        "gray-light": "#828282",
      },
      spacing: {
        45: "11.25rem",
      },
      dropShadow: {
        light: "1px 1px 1px rgba(0, 0, 0, 0.25)",
        "stats-vehicle-off": "0 0 0.25rem rgba(0, 0, 0, 0.5)",
        "stats-vehicle-on": "0 0 0.25rem rgba(255, 255, 255, 0.5)",
      },
    },
  },
  plugins: [],
};
