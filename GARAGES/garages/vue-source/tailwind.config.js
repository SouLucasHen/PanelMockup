/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  safelist: ["static"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Manrope",
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
        main: "rgb(var(--main) / <alpha-value>)",
        mainHover: "rgb(var(--mainHover) / <alpha-value>)",
        mainText: "rgb(var(--mainText) / <alpha-value>)",
        from: "rgb(var(--from) / <alpha-value>)",
        to: "rgb(var(--to) / <alpha-value>)",
        // Botões da garagem — cores vêm de Theme.garage (vrp/config/Global.lua)
        garageGet: "rgb(var(--garageGet) / <alpha-value>)",
        garageGetHover: "rgb(var(--garageGetHover) / <alpha-value>)",
        garageMechanic: "rgb(var(--garageMechanic) / <alpha-value>)",
        garageMechanicHover: "rgb(var(--garageMechanicHover) / <alpha-value>)",
        garageSave: "rgb(var(--garageSave) / <alpha-value>)",
        garageSaveHover: "rgb(var(--garageSaveHover) / <alpha-value>)",
        garageSell: "rgb(var(--garageSell) / <alpha-value>)",
        garageSellHover: "rgb(var(--garageSellHover) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
