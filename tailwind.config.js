/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./apps/**/*.{ts,tsx}",
    "!./node_modules/**",
    "!./dist/**"
  ],
  // Note: Only scan src/ and apps/ folders to avoid node_modules performance issues
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        'md': '448px',
      },
      keyframes: {
        'float-heart': {
          '0%': { transform: 'translate(-50%, -50%) translateY(0) scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'translate(-50%, -50%) translateY(-44px) scale(0.35)', opacity: '0' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-heart': 'float-heart 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
