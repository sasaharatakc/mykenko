/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // MYKENKO brand
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#0066CC',
          600: '#0052a3',
          700: '#003d7a',
        },
        'medical-green': '#00A36C',
        'medical-orange': '#FF6600',
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
