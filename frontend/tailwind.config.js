/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#030712",
          card: "rgba(17, 24, 39, 0.6)",
          border: "rgba(55, 65, 81, 0.4)",
          cyan: "#00f0ff",
          green: "#39ff14",
          red: "#ff007f",
          yellow: "#ffcc00",
          blue: "#3b82f6",
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.35)',
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.35)',
        'glow-red': '0 0 20px rgba(255, 0, 127, 0.35)',
        'glow-yellow': '0 0 20px rgba(255, 204, 0, 0.35)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.35)',
      }
    },
  },
  plugins: [],
}
