module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ghost: {
          950: '#020617', // Obsidian
          900: '#0f172a', // Midnight
          800: '#1e293b', // Slate
          700: '#334155',
        },
        accent: {
          emerald: '#10b981', // Secure
          cyan: '#06b6d4', // System
          rose: '#f43f5e', // Alert
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
