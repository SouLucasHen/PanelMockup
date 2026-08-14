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
        // Cores da loja — vêm de Theme.shop (vrp/config/Global.lua)
        shopBuy: "rgb(var(--shopBuy) / <alpha-value>)",
        shopBuyHover: "rgb(var(--shopBuyHover) / <alpha-value>)",
        shopCategory: "rgb(var(--shopCategory) / <alpha-value>)",
        shopCategoryHover: "rgb(var(--shopCategoryHover) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
