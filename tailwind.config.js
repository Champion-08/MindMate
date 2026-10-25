/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#e0e7ff',
          dark: '#3730a3',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          light: '#ede9fe',
        },
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-subtle': '#f1f5f9',
        dark: '#0f172a',
        muted: '#64748b',
        border: '#e2e8f0',
        success: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#d1fae5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
          light: '#fef3c7',
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
          light: '#fee2e2',
        },
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
        'btn': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.03)',
        'card': '0 4px 16px -4px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 28px -6px rgba(15, 23, 42, 0.1), 0 6px 12px -3px rgba(15, 23, 42, 0.05)',
        'glow-primary': '0 0 24px -4px rgba(99, 102, 241, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
