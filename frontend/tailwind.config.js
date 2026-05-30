/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        eco: {
          950: '#020804',
          900: '#04110a',
          800: '#071a0c',
          750: '#0a2210',
          700: '#0f2d14',
          600: '#164020',
          500: '#22c55e',
          400: '#4ade80',
          300: '#86efac',
          200: '#bbf7d0',
          100: '#dcfce7',
        },
        danger: '#ef4444',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        brand: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'eco-sm':  '0 0 12px rgba(34,197,94,0.15)',
        'eco-md':  '0 0 24px rgba(34,197,94,0.20)',
        'eco-lg':  '0 0 48px rgba(34,197,94,0.25)',
        'eco-glow':'0 0 80px rgba(34,197,94,0.35)',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan':          'scan 1.8s linear infinite',
        'fade-in':       'fadeIn 0.4s ease-out both',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'count-bump':    'countBump 0.45s ease-out both',
        'flash-result':  'flashResult 2.5s ease-out both',
        'spin-slow':     'spin 3s linear infinite',
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countBump: {
          '0%':   { transform: 'scale(1.35)', color: '#4ade80' },
          '100%': { transform: 'scale(1)',    color: 'inherit' },
        },
        flashResult: {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '15%':  { opacity: '1', transform: 'scale(1.04)' },
          '75%':  { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
