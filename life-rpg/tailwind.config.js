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
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8d48a',
          dark: '#8b6914',
        },
        parchment: {
          DEFAULT: '#1a1208',
          2: '#221a0d',
          3: '#2e2010',
        },
        ink: {
          DEFAULT: '#f5e6c8',
          muted: '#a89060',
          faint: '#6b5a3a',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'slide-up': 'slide-up 0.4s ease forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer': 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};
