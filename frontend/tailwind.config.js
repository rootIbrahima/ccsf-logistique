/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D1B3E',
          light:   '#162447',
          dark:    '#080f21'
        },
        accent: {
          DEFAULT: '#E8621A',
          light:   '#F07D3A',
          dark:    '#b54d14'
        }
      }
    }
  },
  plugins: []
}
