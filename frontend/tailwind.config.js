/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
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
        intel: {
          bg: '#0b0f19',
          surface: '#111827',
          card: '#182234',
          cardHover: '#1f2d45',
          border: '#23324c',
          textMuted: '#94a3b8',
          textBright: '#f8fafc',
          accent: '#38bdf8',
          highlight: '#6366f1',
          nodePerson: '#3b82f6',
          nodePhone: '#10b981',
          nodeVehicle: '#f59e0b',
          nodeLocation: '#ef4444',
          nodeOrg: '#8b5cf6',
          nodeCase: '#f97316',
          nodeBank: '#14b8a6',
          nodeEvent: '#ec4899',
        }
      }
    },
  },
  plugins: [],
}
