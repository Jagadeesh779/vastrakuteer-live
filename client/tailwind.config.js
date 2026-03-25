/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vastra-blue': '#0d9488',    // Teal-600
        'vastra-gold': '#C9960C',    // Gold
        'vastra-pink': '#065f46',    // Emerald-800 
        'vastra-teal': '#059669',    // Emerald green
        'vastra-bg': '#F0FDFA',      // Emerald-50 (Very soft teal-white)
        'vastra-green': '#059669',   // Emerald
        'vastra-black': '#1A3D2B',   // Deep forest text
        'vastra-card': '#F0FDFA',    // Mint-white card
        'vastra-border': '#CCFBF1',  // Teal-100 border
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'script': ['Great Vibes', 'cursive'],
      }
    },
  },
  plugins: [],
}
