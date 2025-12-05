import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta baseada em Crypto/Fintech moderna
        background: '#0A0B0D',
        foreground: '#FFFFFF',
        card: '#1A1D23',
        'card-hover': '#222731',
        placeholder: '#71767D',
        border: '#2D3139',
        primary: {
          DEFAULT: '#C4F82A',
          50: '#F5FFDD',
          100: '#EEFFBB',
          200: '#E4FF88',
          300: '#D9FF55',
          400: '#C4F82A', // Cor principal - Verde neon
          500: '#B0E624',
          600: '#9FD41F',
          700: '#8EC21A',
          800: '#7DB015',
          900: '#6C9E10',
        },
        accent: {
          green: '#00FF88',
          blue: '#00B8FF',
          purple: '#B580FF',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(196, 248, 42, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(196, 248, 42, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(196, 248, 42, 0.3)',
        'glow-md': '0 0 30px rgba(196, 248, 42, 0.4)',
        'glow-lg': '0 0 45px rgba(196, 248, 42, 0.5)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
