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
  // Purge unused CSS for production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: [
        // Keep dynamic classes that might be missed
        'bg-blue-800/95',
        'bg-blue-800/70',
        'bg-blue-800/50',
        'text-yellow-300',
        'text-yellow-200',
        'hover:text-yellow-200',
        'hover:text-yellow-300',
        'group-hover:text-yellow-200',
        'group-hover:text-yellow-300',
        'bg-yellow-300/10',
        'bg-yellow-300/20',
        'bg-yellow-300/30',
        'group-hover:bg-yellow-300/20',
        'group-hover:bg-yellow-300/30',
      ],
    },
  },
}