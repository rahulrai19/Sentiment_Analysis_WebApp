/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can add custom colors here if needed, e.g.:
      // colors: {
      //   'custom-blue': '#243c5a',
      // },
      spacing: {
        '7': '1.75rem',
        '13': '3.25rem',
        '128': '32rem',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }],
        '7xl': ['5rem', { lineHeight: '1' }],
      }
    },
  },
  plugins: [],
}