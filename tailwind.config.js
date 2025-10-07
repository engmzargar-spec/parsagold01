/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // پوشش کامل برای همه فایل‌های React
  ],
  theme: {
    extend: {
      fontFamily: {
        estedad: ['EstedadFD', 'sans-serif'], // فونت سفارشی
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(-30px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
