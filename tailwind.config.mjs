/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#f9f4e8',
          200: '#f2e5c8',
          300: '#ebd1a0',
          400: '#e0b35e',
          500: '#d49b2c',
          600: '#b87b1e',
          700: '#945c1a',
          800: '#7a4a1c',
          900: '#663e1c',
        },
        brass: {
          light: '#f5d77f',
          DEFAULT: '#d4af37',
          dark: '#aa820a',
          deep: '#785b00'
        },
        dark: {
          950: '#0a0d12',
          900: '#0f141c',
          850: '#141b24',
          800: '#1a2330',
          700: '#253244',
          600: '#34455c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
