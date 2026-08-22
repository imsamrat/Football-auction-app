/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E5232A',
          dark: '#C41E24',
          light: '#FF3D43',
          50: '#FEF2F2',
          100: '#FDE8E8',
          200: '#FBC8C8',
          500: '#E5232A',
          600: '#C41E24',
          700: '#9B1B1F',
          900: '#5C1011',
        },
        dark: {
          DEFAULT: '#151515',
          50: '#2A2A2A',
          100: '#1E1E1E',
          200: '#252525',
          300: '#333333',
          400: '#404040',
          500: '#555555',
        },
        light: {
          DEFAULT: '#F4F4F4',
          100: '#FAFAFA',
          200: '#F0F0F0',
          300: '#E0E0E0',
          400: '#CCCCCC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(229, 35, 42, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(229, 35, 42, 0.8), 0 0 40px rgba(229, 35, 42, 0.3)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
