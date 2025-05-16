// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 15px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
      },
      fontSize: {
        '2xs': '.7rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-to-br-light': 'linear-gradient(to bottom right, var(--tw-gradient-from, #f8fafc), var(--tw-gradient-to, #e2e8f0))',
        'gradient-to-tr-light': 'linear-gradient(to top right, var(--tw-gradient-from, #f8fafc), var(--tw-gradient-to, #e2e8f0))',
        'gradient-to-b-light': 'linear-gradient(to bottom, var(--tw-gradient-from, #f8fafc), var(--tw-gradient-to, #e2e8f0))',
        'gradient-to-br-primary-light': 'linear-gradient(to bottom right, var(--tw-gradient-from, #f0f9ff), var(--tw-gradient-to, #bae6fd))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Удалите require('@tailwindcss/line-clamp'), так как он теперь встроен в Tailwind CSS v3.3+
  ],
}