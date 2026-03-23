/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#0a0a0f',
          900: '#0f0f18',
          800: '#13131d',
          750: '#171724',
          700: '#1a1a24',
          600: '#22222f',
          500: '#2a2a3a',
          400: '#3a3a50',
        },
        accent: {
          DEFAULT: '#7c6bff',
          dim:     '#5a4aee',
          bright:  '#a599ff',
          glow:    '#c4bbff',
        },
        success: '#22c55e',
        danger:  '#ef4444',
        warn:    '#f59e0b',
      },
      fontFamily: {
        sans:    ['"DM Sans"',    'system-ui', 'sans-serif'],
        display: ['"Syne"',       'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"',    'monospace'],
      },
      boxShadow: {
        glow:   '0 0 32px rgba(124,107,255,0.25)',
        'glow-sm': '0 0 16px rgba(124,107,255,0.18)',
        card:   '0 1px 3px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(42,42,58,0.45) 1px, transparent 1px),
          linear-gradient(90deg, rgba(42,42,58,0.45) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn:  { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulse:    { '0%,100%': { boxShadow: '0 0 20px rgba(124,107,255,0.2)' }, '50%': { boxShadow: '0 0 40px rgba(124,107,255,0.45)' } },
        toastIn:  { '0%': { opacity: '0', transform: 'translateY(8px) scale(0.97)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        spin:     { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up':   'fadeUp 0.35s ease both',
        'fade-in':   'fadeIn 0.25s ease both',
        'slide-in':  'slideIn 0.3s ease both',
        'glow-pulse':'pulse 3s ease-in-out infinite',
        'toast-in':  'toastIn 0.2s ease both',
        'spin':      'spin 0.7s linear infinite',
      },
    },
  },
  plugins: [],
};