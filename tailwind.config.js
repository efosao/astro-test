/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
      },
      colors: {
        "eastern-blue": {
          50: "#eefbfd",
          100: "#d5f3f8",
          200: "#b0e7f1",
          300: "#7ad5e6",
          400: "#3cb9d4",
          500: "#219ebc",
          600: "#1e7e9c",
          700: "#1f657f",
          800: "#215569",
          900: "#204659",
          950: "#102e3c",
        },
        "mountain-meadow": {
          50: "#edfcf3",
          100: "#d5f6e0",
          200: "#aeecc6",
          300: "#78dda7",
          400: "#42c583",
          500: "#22bd74",
          600: "#128953",
          700: "#0e6e46",
          800: "#0e5739",
          900: "#0c4830",
          950: "#06281b",
        },
        blue: {
          50: "#effaff",
          100: "#ddf5ff",
          200: "#b4edff",
          300: "#72e0ff",
          400: "#27d2ff",
          500: "#00bdfc",
          600: "#0098d9",
          700: "#0079af",
          800: "#006690",
          900: "#035477",
          950: "#023047",
        },
        "prussian-blue": {
          50: "#effaff",
          100: "#ddf5ff",
          200: "#b4edff",
          300: "#72e0ff",
          400: "#27d2ff",
          500: "#00bdfc",
          600: "#0098d9",
          700: "#0079af",
          800: "#006690",
          900: "#035477",
          950: "#023047",
        },
        "flush-orange": {
          50: "#fffbec",
          100: "#fff5d3",
          200: "#ffe8a5",
          300: "#ffd56d",
          400: "#ffb732",
          500: "#ff9f0a",
          600: "#fb8500",
          700: "#cc6302",
          800: "#a14c0b",
          900: "#82400c",
          950: "#461e04",
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#16a34a",
          secondary: "#fde046",
          accent: "#37CDBE",
          neutral: "#3D4451",
          "base-100": "#FFFFFF",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography")
  ],
};
