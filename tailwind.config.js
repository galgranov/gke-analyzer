/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          dark: '#2563eb',    // blue-600
          light: '#60a5fa',   // blue-400
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500
          dark: '#475569',    // slate-600
          light: '#94a3b8',   // slate-400
        },
      },
    },
  },
  plugins: [],
}
