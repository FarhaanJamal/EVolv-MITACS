/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "#24293d",
        secondaryColor: "#152023",
        accentColorWhite: "#F4F5FB",
        accentColorBlue: "#8EBBFF",
        accentColorLightBlue: "#DBE8F4"
      },
      boxShadow: {
        panelShadow: "rgba(17, 12, 46, 0.15) 0px, 48px, 100px, 0px;"
      }
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}