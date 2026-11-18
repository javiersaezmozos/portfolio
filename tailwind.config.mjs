/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Escenario acústico común y neutros de alta gama
        graphite: {
          deep: '#121316',
          base: '#1A1B1E',     // Fondo acústico oficial de cubiertas
          DEFAULT: '#1A1B1E',
          surface: '#22252A',  // Tarjetas y paneles elevados
          border: '#2E323A',
        },
        // Colección de Metales Nobles - Trilogía Flexibilidad
        copper: {              // Volumen 1 · Elemental (Fa4)
          shadow: '#9E472A',
          base: '#B85D32',
          light: '#D98A5B',
          DEFAULT: '#E89758',  // Cobre pulido / brillo central
          glow: '#F2B383',
        },
        silver: {              // Volumen 2 · Intermedio (Sib5)
          shadow: '#8E959D',
          base: '#B8BFC6',
          light: '#D6DBDF',
          DEFAULT: '#F1F2F4',  // Plata brillante / platino
          glow: '#FFFFFF',
        },
        gold: {                // Volumen 3 · Avanzado (Fa6) y portfolio
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
          // Matriz oficial del metal Vol. 3
          shadow: '#A88428',
          base: '#D8A935',
          light: '#E5C148',
          regal: '#F9D658',   // Oro puro refulgente
          glow: '#FDE88F',
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
          750: '#1f2a3a',
          700: '#253244',
          600: '#34455c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Libre Baskerville', 'Baskerville', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Gradientes metálicos trilogía (ángulo 135° y vertical 90°/180°)
        'gradient-copper': 'linear-gradient(135deg, #9E472A 0%, #E89758 50%, #B85D32 100%)',
        'gradient-copper-vertical': 'linear-gradient(180deg, #9E472A 0%, #E89758 50%, #B85D32 100%)',
        'gradient-silver': 'linear-gradient(135deg, #8E959D 0%, #F1F2F4 50%, #B8BFC6 100%)',
        'gradient-silver-vertical': 'linear-gradient(180deg, #8E959D 0%, #F1F2F4 50%, #B8BFC6 100%)',
        'gradient-gold-regal': 'linear-gradient(135deg, #A88428 0%, #F9D658 50%, #D8A935 100%)',
        'gradient-gold-vertical': 'linear-gradient(180deg, #A88428 0%, #F9D658 50%, #D8A935 100%)',
        'gradient-auditorium': 'radial-gradient(ellipse at 50% -20%, rgba(232, 151, 88, 0.15), rgba(26, 27, 30, 0.95) 70%, #0a0d12 100%)',
      },
      boxShadow: {
        'book-3d': '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 30px -5px rgba(0, 0, 0, 0.6)',
        'metal-copper': '0 0 35px -5px rgba(232, 151, 88, 0.35)',
        'metal-silver': '0 0 35px -5px rgba(241, 242, 244, 0.30)',
        'metal-gold': '0 0 35px -5px rgba(249, 214, 88, 0.35)',
      }
    },
  },
  plugins: [],
}
