// =====================================================
// CONFIGURAÇÃO DARK MODE - TAILWIND
// Adicione ao tailwind.config.js
// =====================================================

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'animation-delay-2000': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s',
        'animation-delay-4000': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 4s',
      },
      colors: {
        'dark': {
          'primary': '#1a1a1a',
          'secondary': '#2a2a2a',
          'accent': '#3a3a3a',
        }
      },
      fontFamily: {
        'luxury': ['Playfair Display', 'serif'],
        'modern': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
