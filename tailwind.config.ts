import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pertanian: {
          dark: "#0B4A22",    // Hijau Tua (Perbukitan/Background)
          primary: "#16A34A", // Hijau Segar (Daun)
          light: "#4ADE80",   // Hijau Muda
          gold: "#EAB308",    // Kuning Emas (Padi/Matahari)
          earth: "#78350F",   // Coklat Tanah (Baju/Cangkul)
        }
      }
    },
  },
  plugins: [],
};
export default config;