/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'nazanin': ['B-NAZANIN', 'sans-serif'],
        'sans': ['B-NAZANIN', 'sans-serif'],
      },
      spacing: {
        's-1': '0.25rem',
        's-2': '0.5rem', 
        's-3': '0.75rem',
        's-4': '1rem',
        's-5': '1.25rem',
        's-6': '1.5rem',
        's-8': '2rem',
      }
    },
  },
  plugins: [],
}