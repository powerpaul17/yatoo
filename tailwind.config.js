const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        light: {
          primary: colors.sky[400],
          neutral: colors.neutral[300],
          'base-100': colors.neutral[100],
        },
        dark: {
          primary: colors.sky[400],
          neutral: colors.neutral[500],
          'base-100': colors.neutral[700]
        }
      }
    ]
  }
}
