// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../apps/ui/src/components/**/*.{ts,tsx}",
    "../../apps/ui/.storybook/**/*.{ts,tsx}",
    "../../apps/ui/stories/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "bg-light": "var(--bg-light)",
        "bg-lighter": "var(--bg-lighter)",
        bg: "var(--bg)",
        "bg-dark": "var(--bg-dark)",
        "bg-darker": "var(--bg-darker)",
        "bg-loading": "var(--bg-loading)",
        "contrast-lower": "var(--contrast-lower)",
        "contrast-low": "var(--contrast-low)",
        "contrast-medium": "var(--contrast-medium)",
        "contrast-high": "var(--contrast-high)",
        "contrast-higher": "var(--contrast-higher)",
        "primary-lighter": "var(--primary-lighter)",
        "primary-light": "var(--primary-light)",
        // primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        "primary-darker": "var(--primary-darker)",
        "accent-lighter": "var(--accent-lighter)",
        "accent-light": "var(--accent-light)",
        // accent: "var(--accent)",
        "accent-dark": "var(--accent-dark)",
        "accent-darker": "var(--accent-darker)",
        "success-lighter": "var(--success-lighter)",
        "success-light": "var(--success-light)",
        success: "var(--success)",
        "success-dark": "var(--success-dark)",
        "success-darker": "var(--success-darker)",
        "warning-lighter": "var(--warning-lighter)",
        "warning-light": "var(--warning-light)",
        warning: "var(--warning)",
        "warning-dark": "var(--warning-dark)",
        "warning-darker": "var(--warning-darker)",
        "error-lighter": "var(--error-lighter)",
        "error-light": "var(--error-light)",
        error: "var(--error)",
        "error-dark": "var(--error-dark)",
        "error-darker": "var(--error-darker)",
        "emphasis-low": "var(--emphasis-low)",
        "emphasis-medium": "var(--emphasis-medium)",
        "emphasis-high": "var(--emphasis-high)",
      },
      maxWidth: {
        container: "80rem",
      },
      fontFamily: {
        clash: ["ClashGrotesk-Semibold", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [
    require("windy-radix-palette"),
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
