// tailwind.config.ts
import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  // 1. Onde o Tailwind deve procurar por classes
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // 2. Habilita o dark mode via classe 'dark' (para next-themes)
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // [CORREÇÃO FONTES] Adiciona a definição 'font-display' aqui
      fontFamily: {
        sans: ["var(--font-sans)"],
      },

      // [MAPEAMENTO DE CORES HSL] Definido a partir do seu design system
      colors: {
        // Cores de Base
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        slate: colors.slate,
      },
    },
  },
};

export default config;
