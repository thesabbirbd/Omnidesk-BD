/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ডার্ক মোড সাপোর্ট এর জন্য
  theme: {
    extend: {
      colors: {
        neuBg: '#e0e5ec',
        vibrantOrange: '#f97316',
      },
      boxShadow: {
        // Neumorphism Light Theme Shadows
        'neu-flat': '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
        'neu-pressed': 'inset 6px 6px 10px 0 rgba(163, 177, 198, 0.7), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
