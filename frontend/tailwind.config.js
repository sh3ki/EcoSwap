/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        eco: {
          950: '#020408',
          900: '#040c18',
          800: '#071525',
          750: '#0a1e38',
          700: '#0f274d',
          600: '#1a3a6e',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
          200: '#bfdbfe',
          100: '#dbeafe',
        },
        danger: '#ef4444',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        brand: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'eco-sm':  '0 0 12px rgba(59,130,246,0.15)',
        'eco-md':  '0 0 24px rgba(59,130,246,0.20)',
        'eco-lg':  '0 0 48px rgba(59,130,246,0.25)',
        'eco-glow':'0 0 80px rgba(59,130,246,0.35)',
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
          '0%':   { transform: 'scale(1.35)', color: '#60a5fa' },
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
