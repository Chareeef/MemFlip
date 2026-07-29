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
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
        },
        ink: {
          500: "var(--text-muted)",
          700: "var(--text-secondary)",
          900: "var(--text-primary)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          subtle: "var(--surface-subtle)",
        },
      },
      boxShadow: {
        soft: "var(--shadow-sm)",
        card: "var(--shadow-md)",
        floating: "var(--shadow-lg)",
      },
      borderRadius: {
        card: "var(--radius-lg)",
        control: "var(--radius-md)",
      },
      transitionTimingFunction: {
        product: "var(--ease-product)",
        emphasized: "var(--ease-emphasized)",
      },
      maxWidth: {
        content: "76rem",
        reading: "70ch",
      },
    },
  },
  plugins: [],
};
export default config;
