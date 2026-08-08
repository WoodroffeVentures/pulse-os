import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: '#0a0b0d',
          surface: '#111318',
          elevated: '#161b22',
          border: '#1e2028',
          accent: '#3b82f6',
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
        },
        // legacy compat
        background: '#0a0b0d',
        panel: '#111318',
        borderline: 'rgba(255,255,255,0.06)',
        primaryText: '#f1f5f9',
        secondaryText: '#64748b',
        gold: '#C6A66B',
        teal: '#2BB8A5',
        warning: '#f59e0b',
        critical: '#ef4444',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        command: '0 20px 80px rgba(0,0,0,.35)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
