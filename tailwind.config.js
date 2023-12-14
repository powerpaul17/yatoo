const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/index.html",
    "./src/**/*.{ts,vue}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.sky[400],
        neutral: colors.neutral[300],
        'base-100': colors.neutral[100],
        'base-200': colors.neutral[200],
        'base-300': colors.neutral[300]
      }
    }
  },
  darkMode: ['class', '[data-theme="dark"]'],
  plugins: []
}
