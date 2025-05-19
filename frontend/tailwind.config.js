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
    },
  },
  plugins: [],
}