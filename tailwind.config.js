/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './frontend/**/*.html',
    './frontend/assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5A160F',
          dark: '#32110D',
          gold: '#B88932',
          'light-gold': '#D9B86C',
          cream: '#FBF5E9',
          'warm-white': '#FFFDF8',
          text: '#2D211B',
          muted: '#75675D'
        }
      },
      fontFamily: {
        'tamil-sans': ['"Noto Sans Tamil"', '"Noto Sans"', 'sans-serif'],
        'tamil-serif': ['"Noto Serif Tamil"', '"Cormorant Garamond"', 'serif'],
        display: ['"Cormorant Garamond"', '"Noto Serif Tamil"', 'serif'],
        sans: ['"Inter"', '"Noto Sans Tamil"', 'sans-serif']
      },
      boxShadow: {
        heritage: '0 4px 20px -2px rgba(50, 17, 13, 0.08)',
        'heritage-hover': '0 10px 30px -5px rgba(90, 22, 15, 0.15)',
        'inner-gold': 'inset 0 0 0 1px rgba(184, 137, 50, 0.3)'
      }
    }
  },
  plugins: []
};
