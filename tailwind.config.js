/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#1b4332', 50: '#eef5f0', 100: '#d8e9de', 200: '#b0d3bd', 300: '#7fb594', 400: '#52936d', 500: '#2d6a4f', 600: '#1b4332', 700: '#15362a', 800: '#0f2a20', 900: '#081c15' },
        amber: { DEFAULT: '#d4a373', 50: '#fbf5ee', 100: '#f5e6d3', 200: '#ebcba7', 300: '#e0b88c', 400: '#d4a373', 500: '#c08552', 600: '#a06a3c' },
        cream: { DEFAULT: '#fdfbf7', 100: '#f8f3ea', 200: '#efe6d6' },
        slate: { DEFAULT: '#2b2d42', 400: '#6b6e85', 500: '#4a4d63', 600: '#2b2d42' },
        sage: '#95b8a0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        aurora: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(6%,-8%) scale(1.1)' }, '66%': { transform: 'translate(-6%,6%) scale(0.95)' } },
        shimmer: { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '-200% 0' } },
        spin_slow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'spin-slow': 'spin_slow 40s linear infinite',
      },
    },
  },
  plugins: [],
}
