/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-peach': '#FFDBBB',
        'warm-stone': '#CCBEB1',
        'muted-taupe': '#997E67',
        'deep-cocoa': '#664930',
        'bg-cream': '#FAF3EE',
        'text-brown': '#4A3525',
        'btn-brown': '#845A41',
        'cat-cream': '#FFFDFB',
        'cat-tan': '#D5BAA6',
        'cat-mocha': '#A98E7B',
        'cat-dark': '#66452F',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
