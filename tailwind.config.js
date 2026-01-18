const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './imports/ui/**/*.{js,jsx,ts,tsx}',
    './client/*.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Mona Sans"', ...defaultTheme.fontFamily.sans],
        display: [['"Mona Sans"', ...defaultTheme.fontFamily.sans], { fontVariationSettings: '"wdth" 125' }],
      },
      borderRadius: {
        '4xl': '2.5rem', // 40px
      },
      colors: {
        // Ensuring neutral is available if strict tokens are needed, 
        // though it's part of default colors in v3/v4 usually.
      }
    },
  },
  plugins: [],
};
