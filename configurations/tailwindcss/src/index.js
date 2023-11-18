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
    "./mdx/**/*.{mjs,mdx,js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    "../../apps/ui/src/components/**/*.{ts,tsx}",
    "../../apps/ui/.storybook/**/*.{ts,tsx}",
    "../../apps/ui/stories/**/*.{ts,tsx}",
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
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
        // variables
        "background-color-background": {
          DEFAULT: "var(--background-color-background)",
          body: "var(--background-color-background-body)",
          overlay: "var(--background-color-background-overlay)",
          strong: "var(--background-color-background-strong)",
          stronger: "var(--background-color-background-stronger)",
          strongest: "var(--background-color-background-strongest)",
          weak: "var(--background-color-background-weak)",
        },
        "background-destructive-color-background-destructive": {
          DEFAULT: "var(--background-destructive-color-background-destructive)",
          strong:
            "var(--background-destructive-color-background-destructive-strong)",
          stronger:
            "var(--background-destructive-color-background-destructive-stronger)",
          strongest:
            "var(--background-destructive-color-background-destructive-strongest)",
          weak: "var(--background-destructive-color-background-destructive-weak)",
          weaker:
            "var(--background-destructive-color-background-destructive-weaker)",
          weakest:
            "var(--background-destructive-color-background-destructive-weakest)",
        },
        "background-error-color-background-error": {
          DEFAULT: "var(--background-error-color-background-error)",
          strong: "var(--background-error-color-background-error-strong)",
          stronger: "var(--background-error-color-background-error-stronger)",
          strongest: "var(--background-error-color-background-error-strongest)",
          weakest: "var(--background-error-color-background-error-weakest)",
        },
        "background-info-color-background-info": {
          DEFAULT: "var(--background-info-color-background-info)",
          weakest: "var(--background-info-color-background-info-weakest)",
        },
        "background-inverse-color-background-body-inverse": {
          DEFAULT: "var(--background-inverse-color-background-body-inverse)",
        },
        "background-inverse-color-background-inverse": {
          DEFAULT: "var(--background-inverse-color-background-inverse)",
          strong: "var(--background-inverse-color-background-inverse-strong)",
          stronger:
            "var(--background-inverse-color-background-inverse-stronger)",
        },
        "background-primary-color-background-primary": {
          DEFAULT: "var(--background-primary-color-background-primary)",
          strong: "var(--background-primary-color-background-primary-strong)",
          stronger:
            "var(--background-primary-color-background-primary-stronger)",
          strongest:
            "var(--background-primary-color-background-primary-strongest)",
          weak: "var(--background-primary-color-background-primary-weak)",
          weaker: "var(--background-primary-color-background-primary-weaker)",
          weakest: "var(--background-primary-color-background-primary-weakest)",
        },
        "background-success-color-background-success": {
          DEFAULT: "var(--background-success-color-background-success)",
          weakest: "var(--background-success-color-background-success-weakest)",
        },
        "background-warning-color-background-warning": {
          DEFAULT: "var(--background-warning-color-background-warning)",
          weakest: "var(--background-warning-color-background-warning-weakest)",
        },
        "border-color-border": {
          DEFAULT: "var(--border-color-border)",
          strong: "var(--border-color-border-strong)",
          weak: "var(--border-color-border-weak)",
          weaker: "var(--border-color-border-weaker)",
          weakest: "var(--border-color-border-weakest)",
        },
        "border-destructive-color-border-destructive": {
          DEFAULT: "var(--border-destructive-color-border-destructive)",
          strong: "var(--border-destructive-color-border-destructive-strong)",
          stronger:
            "var(--border-destructive-color-border-destructive-stronger)",
          strongest:
            "var(--border-destructive-color-border-destructive-strongest)",
          weak: "var(--border-destructive-color-border-destructive-weak)",
          weaker: "var(--border-destructive-color-border-destructive-weaker)",
          weakest: "var(--border-destructive-color-border-destructive-weakest)",
        },
        "border-error-color-border-error": {
          DEFAULT: "var(--border-error-color-border-error)",
          strong: "var(--border-error-color-border-error-strong)",
          stronger: "var(--border-error-color-border-error-stronger)",
          strongest: "var(--border-error-color-border-error-strongest)",
          weak: "var(--border-error-color-border-error-weak)",
          weaker: "var(--border-error-color-border-error-weaker)",
          weakest: "var(--border-error-color-border-error-weakest)",
        },
        "border-info-color-border-info": {
          DEFAULT: "var(--border-info-color-border-info)",
          weak: "var(--border-info-color-border-info-weak)",
          weaker: "var(--border-info-color-border-info-weaker)",
          weakest: "var(--border-info-color-border-info-weakest)",
        },
        "border-inverse-color-border-inverse": {
          DEFAULT: "var(--border-inverse-color-border-inverse)",
          strong: "var(--border-inverse-color-border-inverse-strong)",
          stronger: "var(--border-inverse-color-border-inverse-stronger)",
          strongest: "var(--border-inverse-color-border-inverse-strongest)",
          weaker: "var(--border-inverse-color-border-inverse-weaker)",
          weakest: "var(--border-inverse-color-border-inverse-weakest)",
        },
        "border-primary-color-border-primary": {
          DEFAULT: "var(--border-primary-color-border-primary)",
          strong: "var(--border-primary-color-border-primary-strong)",
          stronger: "var(--border-primary-color-border-primary-stronger)",
          strongest: "var(--border-primary-color-border-primary-strongest)",
          weak: "var(--border-primary-color-border-primary-weak)",
          weaker: "var(--border-primary-color-border-primary-weaker)",
          weakest: "var(--border-primary-color-border-primary-weakest)",
        },
        "border-success-color-border-success": {
          DEFAULT: "var(--border-success-color-border-success)",
          weak: "var(--border-success-color-border-success-weak)",
          weaker: "var(--border-success-color-border-success-weaker)",
          weakest: "var(--border-success-color-border-success-weakest)",
        },
        "border-warning-color-border-warning": {
          DEFAULT: "var(--border-warning-color-border-warning)",
          weak: "var(--border-warning-color-border-warning-weak)",
          weaker: "var(--border-warning-color-border-warning-weaker)",
          weakest: "var(--border-warning-color-border-warning-weakest)",
        },
        "data-visualization-color-data-visualization": {
          DEFAULT: "var(--data-visualization-color-data-visualization-1)",
          2: "var(--data-visualization-color-data-visualization-2)",
          3: "var(--data-visualization-color-data-visualization-3)",
          4: "var(--data-visualization-color-data-visualization-4)",
          5: "var(--data-visualization-color-data-visualization-5)",
          6: "var(--data-visualization-color-data-visualization-6)",
          7: "var(--data-visualization-color-data-visualization-7)",
          8: "var(--data-visualization-color-data-visualization-8)",
          9: "var(--data-visualization-color-data-visualization-9)",
          10: "var(--data-visualization-color-data-visualization-10)",
        },
        "text-color-text": {
          DEFAULT: "var(--text-color-text)",
          weak: "var(--text-color-text-weak)",
          weaker: "var(--text-color-text-weaker)",
          weakest: "var(--text-color-text-weakest)",
        },
        "text-destructive-color-text-destructive": {
          DEFAULT: "var(--text-destructive-color-text-destructive)",
          strong: "var(--text-destructive-color-text-destructive-strong)",
          stronger: "var(--text-destructive-color-text-destructive-stronger)",
          strongest: "var(--text-destructive-color-text-destructive-strongest)",
          weak: "var(--text-destructive-color-text-destructive-weak)",
        },
        "text-error-color-text-error": {
          DEFAULT: "var(--text-error-color-text-error)",
          strong: "var(--text-error-color-text-error-strong)",
          stronger: "var(--text-error-color-text-error-stronger)",
          strongest: "var(--text-error-color-text-error-strongest)",
          weak: "var(--text-error-color-text-error-weak)",
        },
        "text-icon-color-text-icon": {
          DEFAULT: "var(--text-icon-color-text-icon)",
          error: "var(--text-icon-color-text-icon-error)",
          info: "var(--text-icon-color-text-icon-info)",
          inverse: "var(--text-icon-color-text-icon-inverse)",
          success: "var(--text-icon-color-text-icon-success)",
          warning: "var(--text-icon-color-text-icon-warning)",
          weaker: "var(--text-icon-color-text-icon-weaker)",
        },
        "text-info-color-text-info": {
          DEFAULT: "var(--text-info-color-text-info)",
          strong: "var(--text-info-color-text-info-strong)",
        },
        "text-inverse-color-text-inverse": {
          DEFAULT: "var(--text-inverse-color-text-inverse)",
          weak: "var(--text-inverse-color-text-inverse-weak)",
          weaker: "var(--text-inverse-color-text-inverse-weaker)",
          weakest: "var(--text-inverse-color-text-inverse-weakest)",
        },
        "text-link-color-text-link": {
          DEFAULT: "var(--text-link-color-text-link)",
          strong: "var(--text-link-color-text-link-strong)",
          stronger: "var(--text-link-color-text-link-stronger)",
          strongest: "var(--text-link-color-text-link-strongest)",
          weak: "var(--text-link-color-text-link-weak)",
        },
        "text-link-destructive-color-text-link-destructive": {
          DEFAULT: "var(--text-link-destructive-color-text-link-destructive)",
          strong:
            "var(--text-link-destructive-color-text-link-destructive-strong)",
          stronger:
            "var(--text-link-destructive-color-text-link-destructive-stronger)",
          strongest:
            "var(--text-link-destructive-color-text-link-destructive-strongest)",
          weak: "var(--text-link-destructive-color-text-link-destructive-weak)",
        },
        "text-primary-color-text-primary": {
          DEFAULT: "var(--text-primary-color-text-primary)",
          strong: "var(--text-primary-color-text-primary-strong)",
          stronger: "var(--text-primary-color-text-primary-stronger)",
          strongest: "var(--text-primary-color-text-primary-strongest)",
          weak: "var(--text-primary-color-text-primary-weak)",
        },
        "text-success-color-text-success": {
          DEFAULT: "var(--text-success-color-text-success)",
        },
        "text-warning-color-text-warning": {
          DEFAULT: "var(--text-warning-color-text-warning)",
          strong: "var(--text-warning-color-text-warning-strong)",
        },
        // light mode
        tremor: {
          brand: {
            faint: "#eff6ff", // blue-50
            muted: "#bfdbfe", // blue-200
            subtle: "#60a5fa", // blue-400
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#1d4ed8", // blue-700
            inverted: "#ffffff", // white
          },
          background: {
            muted: "#f9fafb", // gray-50
            subtle: "#f3f4f6", // gray-100
            DEFAULT: "#ffffff", // white
            emphasis: "#374151", // gray-700
          },
          border: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          ring: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          content: {
            subtle: "#9ca3af", // gray-400
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#374151", // gray-700
            strong: "#111827", // gray-900
            inverted: "#ffffff", // white
          },
        },
        // dark mode
        "dark-tremor": {
          brand: {
            faint: "#0B1229", // custom
            muted: "#172554", // blue-950
            subtle: "#1e40af", // blue-800
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#60a5fa", // blue-400
            inverted: "#030712", // gray-950
          },
          background: {
            muted: "#131A2B", // custom
            subtle: "#1f2937", // gray-800
            // DEFAULT: "#111827", // gray-900
            DEFAULT: "black",
            emphasis: "#d1d5db", // gray-300
          },
          border: {
            DEFAULT: "#1f2937", // gray-800
          },
          ring: {
            DEFAULT: "#1f2937", // gray-800
          },
          content: {
            subtle: "#4b5563", // gray-600
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#e5e7eb", // gray-200
            strong: "#f9fafb", // gray-50
            inverted: "#000000", // black
          },
        },
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      fontSize: {
        "2xs": ".6875rem",
        "tremor-label": ["0.75rem"],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      maxWidth: {
        container: "80rem",
      },
      fontFamily: {
        clash: ["ClashGrotesk-Semibold", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-inter)"],
        mono: ["var(--font-roboto-mono)"],
        display: "var(--font-mona-sans)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
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
      opacity: {
        2.5: "0.025",
        7.5: "0.075",
        15: "0.15",
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("windy-radix-palette"),
    require("@headlessui/tailwindcss"),
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
