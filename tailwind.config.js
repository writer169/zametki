/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Здесь можно расширить тему Tailwind
    },
  },
  plugins: [
    // Плагин для стилей прозы
    require('@tailwindcss/typography'),
  ],
}