/** @type {import('tailwindcss').Config} */
// Tailwind CSS v4 tiene una nueva sintaxis, pero mantenemos compatibilidad con v3
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // tailwindcss-primeui debería funcionar con v4
    require('tailwindcss-primeui')
  ],
}

