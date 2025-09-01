/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          gold: '#FFD700',
          red: '#DC143C',
          green: '#228B22',
          dark: '#1a1a1a',
          darker: '#0a0a0a',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-chips': 'bounce 2s infinite',
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'roulette': 'roulette 4s cubic-bezier(0.23, 1, 0.320, 1)',
      },
      keyframes: {
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        roulette: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(1440deg)' },
        }
      },
      backgroundImage: {
        'casino-table': 'linear-gradient(135deg, #0F4C3A 0%, #2D8B5A 50%, #0F4C3A 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      }
    },
  },
  plugins: [],
}
