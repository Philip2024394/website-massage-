/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./main.tsx",
    "./App.tsx",
  ],
  safelist: [
    // Critical layout classes that should never be purged
    'flex',
    'flex-col',
    'flex-row',
    'items-center',
    'justify-center',
    'justify-between',
    'text-center',
    'text-left',
    'text-right',
    // Critical sizing classes
    'w-6',
    'h-6',
    'w-8',
    'h-8',
    'w-12',
    'h-12',
    // Critical spacing
    'p-4',
    'm-4',
    'mb-4',
    'mt-4',
    // Critical colors
    'bg-white',
    'bg-gray-100',
    'bg-blue-500',
    'text-white',
    'text-gray-900',
    // Border radius
    'rounded',
    'rounded-lg',
    // Brand colors
    'bg-brand-green',
    'border-brand-green',
    'bg-green-500',
    'border-green-500',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
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
        'brand-orange': '#f97316',
        'brand-orange-dark': '#ea580c',
        'brand-orange-light': '#fed7aa',
        'brand-green': '#16a34a',
        'brand-green-dark': '#15803d',
        'brand-green-light': '#86efac',
      }
    },
  },
  plugins: [],
}
