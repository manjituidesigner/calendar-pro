/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        actionBlue: '#3079E6',
        successGreen: '#10B981',
        dangerRed: '#EF4444',
        warningOrange: '#F59E0B',
      },
      fontFamily: {
        interLight: ['InterLight', 'sans-serif'], 
        interMedium: ['InterMedium', 'sans-serif'], 
        interExtraBold: ['InterExtraBold', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}
