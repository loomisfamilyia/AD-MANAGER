import type { Config } from "tailwindcss";

/**
 * Colors come from two places and they are NOT interchangeable:
 *
 *   `brand`         — UI chrome. Matches the landing-page app so the two look
 *                     like one product.
 *   `ink`/`surface` — chart chrome from the validated data-viz palette.
 *
 * Series colors (the ones that encode a platform) are NOT here. They live as
 * CSS custom properties in index.css, because they have to swap between light
 * and dark steps, and Tailwind can't express that in one class name. Import
 * them from `lib/palette.ts` instead of hardcoding hex in a chart.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
        },
        // Chart chrome & ink — from references/palette.md
        surface: {
          light: "#fcfcfb",
          dark: "#1a1a19",
          plane: "#f9f9f7",
          planeDark: "#0d0d0d",
        },
        ink: {
          primary: "#0b0b0b",
          secondary: "#52514e",
          muted: "#898781",
          primaryDark: "#ffffff",
          secondaryDark: "#c3c2b7",
        },
        grid: {
          light: "#e1e0d9",
          dark: "#2c2c2a",
          baseline: "#c3c2b7",
          baselineDark: "#383835",
        },
        // Status palette — fixed, never themed, never reused as a series color.
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
