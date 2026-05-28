import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          50: '#E5F0FF',
          100: '#CCE0FF',
          500: '#0066CC',
          600: '#0052A3',
          700: '#003D7A',
        },
        medical: {
          green: '#00A36C',
          orange: '#FF6600',
          gray: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
