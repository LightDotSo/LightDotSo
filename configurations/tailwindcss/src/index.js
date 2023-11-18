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
        // Old light
        "bg-light": "hsl(var(--bg-light) / <alpha-value>)",
        "bg-lighter": "hsl(var(--bg-lighter) / <alpha-value>)",
        bg: "hsl(var(--bg) / <alpha-value>)",
        "bg-dark": "hsl(var(--bg-dark) / <alpha-value>)",
        "bg-darker": "hsl(var(--bg-darker) / <alpha-value>)",
        "bg-loading": "hsl(var(--bg-loading) / <alpha-value>)",
        "contrast-lower": "hsl(var(--contrast-lower) / <alpha-value>)",
        "contrast-low": "hsl(var(--contrast-low) / <alpha-value>)",
        "contrast-medium": "hsl(var(--contrast-medium) / <alpha-value>)",
        "contrast-high": "hsl(var(--contrast-high) / <alpha-value>)",
        "contrast-higher": "hsl(var(--contrast-higher) / <alpha-value>)",
        "primary-lighter": "hsl(var(--primary-lighter) / <alpha-value>)",
        "primary-light": "hsl(var(--primary-light) / <alpha-value>)",
        // primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-dark": "hsl(var(--primary-dark) / <alpha-value>)",
        "primary-darker": "hsl(var(--primary-darker) / <alpha-value>)",
        "accent-lighter": "hsl(var(--accent-lighter) / <alpha-value>)",
        "accent-light": "hsl(var(--accent-light) / <alpha-value>)",
        // accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-dark": "hsl(var(--accent-dark) / <alpha-value>)",
        "accent-darker": "hsl(var(--accent-darker) / <alpha-value>)",
        "success-lighter": "hsl(var(--success-lighter) / <alpha-value>)",
        "success-light": "hsl(var(--success-light) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        "success-dark": "hsl(var(--success-dark) / <alpha-value>)",
        "success-darker": "hsl(var(--success-darker) / <alpha-value>)",
        "warning-lighter": "hsl(var(--warning-lighter) / <alpha-value>)",
        "warning-light": "hsl(var(--warning-light) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        "warning-dark": "hsl(var(--warning-dark) / <alpha-value>)",
        "warning-darker": "hsl(var(--warning-darker) / <alpha-value>)",
        "error-lighter": "hsl(var(--error-lighter) / <alpha-value>)",
        "error-light": "hsl(var(--error-light) / <alpha-value>)",
        error: "hsl(var(--error) / <alpha-value>)",
        "error-dark": "hsl(var(--error-dark) / <alpha-value>)",
        "error-darker": "hsl(var(--error-darker) / <alpha-value>)",
        "emphasis-low": "hsl(var(--emphasis-low) / <alpha-value>)",
        "emphasis-medium": "hsl(var(--emphasis-medium) / <alpha-value>)",
        "emphasis-high": "hsl(var(--emphasis-high) / <alpha-value>)",
        // variables
        background: {
          DEFAULT: "hsl(var(--background) / <alpha-value>)",
          body: "hsl(var(--background-body) / <alpha-value>)",
          overlay: "hsl(var(--background-overlay) / <alpha-value>)",
          strong: "hsl(var(--background-strong) / <alpha-value>)",
          stronger: "hsl(var(--background-stronger) / <alpha-value>)",
          strongest: "hsl(var(--background-strongest) / <alpha-value>)",
          weak: "hsl(var(--background-weak) / <alpha-value>)",
        },
        "background-destructive": {
          DEFAULT: "hsl(var(--background-destructive) / <alpha-value>)",
          strong: "hsl(var(--background-destructive-strong) / <alpha-value>)",
          stronger:
            "hsl(var(--background-destructive-stronger) / <alpha-value>)",
          strongest:
            "hsl(var(--background-destructive-strongest) / <alpha-value>)",
          weak: "hsl(var(--background-destructive-weak) / <alpha-value>)",
          weaker: "hsl(var(--background-destructive-weaker) / <alpha-value>)",
          weakest: "hsl(var(--background-destructive-weakest) / <alpha-value>)",
        },
        "background-error": {
          DEFAULT: "hsl(var(--background-error) / <alpha-value>)",
          strong: "hsl(var(--background-error-strong) / <alpha-value>)",
          stronger: "hsl(var(--background-error-stronger) / <alpha-value>)",
          strongest: "hsl(var(--background-error-strongest) / <alpha-value>)",
          weakest: "hsl(var(--background-error-weakest) / <alpha-value>)",
        },
        "background-info": {
          DEFAULT: "hsl(var(--background-info) / <alpha-value>)",
          weakest: "hsl(var(--background-info-weakest) / <alpha-value>)",
        },
        "background-body-inverse": {
          DEFAULT: "hsl(var(--background-body-inverse) / <alpha-value>)",
        },
        "background-inverse": {
          DEFAULT: "hsl(var(--background-inverse) / <alpha-value>)",
          strong: "hsl(var(--background-inverse-strong) / <alpha-value>)",
          stronger: "hsl(var(--background-inverse-stronger) / <alpha-value>)",
        },
        "background-primary": {
          DEFAULT: "hsl(var(--background-primary) / <alpha-value>)",
          strong: "hsl(var(--background-primary-strong) / <alpha-value>)",
          stronger: "hsl(var(--background-primary-stronger) / <alpha-value>)",
          strongest: "hsl(var(--background-primary-strongest) / <alpha-value>)",
          weak: "hsl(var(--background-primary-weak) / <alpha-value>)",
          weaker: "hsl(var(--background-primary-weaker) / <alpha-value>)",
          weakest: "hsl(var(--background-primary-weakest) / <alpha-value>)",
        },
        "background-success": {
          DEFAULT: "hsl(var(--background-success) / <alpha-value>)",
          weakest: "hsl(var(--background-success-weakest) / <alpha-value>)",
        },
        "background-warning": {
          DEFAULT: "hsl(var(--background-warning) / <alpha-value>)",
          weakest: "hsl(var(--background-warning-weakest) / <alpha-value>)",
        },
        border: {
          DEFAULT: "hsl(var(--border) / <alpha-value>)",
          strong: "hsl(var(--border-strong) / <alpha-value>)",
          weak: "hsl(var(--border-weak) / <alpha-value>)",
          weaker: "hsl(var(--border-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-weakest) / <alpha-value>)",
        },
        "border-destructive": {
          DEFAULT: "hsl(var(--border-destructive) / <alpha-value>)",
          strong: "hsl(var(--border-destructive-strong) / <alpha-value>)",
          stronger: "hsl(var(--border-destructive-stronger) / <alpha-value>)",
          strongest: "hsl(var(--border-destructive-strongest) / <alpha-value>)",
          weak: "hsl(var(--border-destructive-weak) / <alpha-value>)",
          weaker: "hsl(var(--border-destructive-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-destructive-weakest) / <alpha-value>)",
        },
        "border-error": {
          DEFAULT: "hsl(var(--border-error) / <alpha-value>)",
          strong: "hsl(var(--border-error-strong) / <alpha-value>)",
          stronger: "hsl(var(--border-error-stronger) / <alpha-value>)",
          strongest: "hsl(var(--border-error-strongest) / <alpha-value>)",
          weak: "hsl(var(--border-error-weak) / <alpha-value>)",
          weaker: "hsl(var(--border-error-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-error-weakest) / <alpha-value>)",
        },
        "border-info": {
          DEFAULT: "hsl(var(--border-info) / <alpha-value>)",
          weak: "hsl(var(--border-info-weak) / <alpha-value>)",
          weaker: "hsl(var(--border-info-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-info-weakest) / <alpha-value>)",
        },
        "border-inverse": {
          DEFAULT: "hsl(var(--border-inverse) / <alpha-value>)",
          strong: "hsl(var(--border-inverse-strong) / <alpha-value>)",
          stronger: "hsl(var(--border-inverse-stronger) / <alpha-value>)",
          strongest: "hsl(var(--border-inverse-strongest) / <alpha-value>)",
          weaker: "hsl(var(--border-inverse-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-inverse-weakest) / <alpha-value>)",
        },
        "border-primary": {
          DEFAULT: "hsl(var(--border-primary) / <alpha-value>)",
          strong: "hsl(var(--border-primary-strong) / <alpha-value>)",
          stronger: "hsl(var(--border-primary-stronger) / <alpha-value>)",
          strongest: "hsl(var(--border-primary-strongest) / <alpha-value>)",
          weak: "hsl(var(--border-primary-weak) / <alpha-value>)",
          weaker: "hsl(var(--border-primary-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-primary-weakest) / <alpha-value>)",
        },
        "border-success": {
          DEFAULT: "hsl(var(--border-success) / <alpha-value>)",
          weak: "hsl(var(--border-success-weak) / <alpha-value>)",
          weaker: "hsl(var(--border-success-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-success-weakest) / <alpha-value>)",
        },
        "border-warning": {
          DEFAULT: "hsl(var(--border-warning) / <alpha-value>)",
          weak: "hsl(var(--border-warning-weak) / <alpha-value>)",
          weaker: "hsl(var(--border-warning-weaker) / <alpha-value>)",
          weakest: "hsl(var(--border-warning-weakest) / <alpha-value>)",
        },
        "data-visualization": {
          DEFAULT: "hsl(var(--data-visualization-1) / <alpha-value>)",
          2: "hsl(var(--data-visualization-2) / <alpha-value>)",
          3: "hsl(var(--data-visualization-3) / <alpha-value>)",
          4: "hsl(var(--data-visualization-4) / <alpha-value>)",
          5: "hsl(var(--data-visualization-5) / <alpha-value>)",
          6: "hsl(var(--data-visualization-6) / <alpha-value>)",
          7: "hsl(var(--data-visualization-7) / <alpha-value>)",
          8: "hsl(var(--data-visualization-8) / <alpha-value>)",
          9: "hsl(var(--data-visualization-9) / <alpha-value>)",
          10: "hsl(var(--data-visualization-10) / <alpha-value>)",
        },
        text: {
          DEFAULT: "hsl(var(--text) / <alpha-value>)",
          weak: "hsl(var(--text-weak) / <alpha-value>)",
          weaker: "hsl(var(--text-weaker) / <alpha-value>)",
          weakest: "hsl(var(--text-weakest) / <alpha-value>)",
        },
        "text-destructive": {
          DEFAULT: "hsl(var(--text-destructive) / <alpha-value>)",
          strong: "hsl(var(--text-destructive-strong) / <alpha-value>)",
          stronger: "hsl(var(--text-destructive-stronger) / <alpha-value>)",
          strongest: "hsl(var(--text-destructive-strongest) / <alpha-value>)",
          weak: "hsl(var(--text-destructive-weak) / <alpha-value>)",
        },
        "text-error": {
          DEFAULT: "hsl(var(--text-error) / <alpha-value>)",
          strong: "hsl(var(--text-error-strong) / <alpha-value>)",
          stronger: "hsl(var(--text-error-stronger) / <alpha-value>)",
          strongest: "hsl(var(--text-error-strongest) / <alpha-value>)",
          weak: "hsl(var(--text-error-weak) / <alpha-value>)",
        },
        "text-icon": {
          DEFAULT: "hsl(var(--text-icon) / <alpha-value>)",
          error: "hsl(var(--text-icon-error) / <alpha-value>)",
          info: "hsl(var(--text-icon-info) / <alpha-value>)",
          inverse: "hsl(var(--text-icon-inverse) / <alpha-value>)",
          success: "hsl(var(--text-icon-success) / <alpha-value>)",
          warning: "hsl(var(--text-icon-warning) / <alpha-value>)",
          weaker: "hsl(var(--text-icon-weaker) / <alpha-value>)",
        },
        "text-info": {
          DEFAULT: "hsl(var(--text-info) / <alpha-value>)",
          strong: "hsl(var(--text-info-strong) / <alpha-value>)",
        },
        "text-inverse": {
          DEFAULT: "hsl(var(--text-inverse) / <alpha-value>)",
          weak: "hsl(var(--text-inverse-weak) / <alpha-value>)",
          weaker: "hsl(var(--text-inverse-weaker) / <alpha-value>)",
          weakest: "hsl(var(--text-inverse-weakest) / <alpha-value>)",
        },
        "text-link": {
          DEFAULT: "hsl(var(--text-link) / <alpha-value>)",
          strong: "hsl(var(--text-link-strong) / <alpha-value>)",
          stronger: "hsl(var(--text-link-stronger) / <alpha-value>)",
          strongest: "hsl(var(--text-link-strongest) / <alpha-value>)",
          weak: "hsl(var(--text-link-weak) / <alpha-value>)",
        },
        "text-link-destructive": {
          DEFAULT: "hsl(var(--text-link-destructive) / <alpha-value>)",
          strong: "hsl(var(--text-link-destructive-strong) / <alpha-value>)",
          stronger:
            "hsl(var(--text-link-destructive-stronger) / <alpha-value>)",
          strongest:
            "hsl(var(--text-link-destructive-strongest) / <alpha-value>)",
          weak: "hsl(var(--text-link-destructive-weak) / <alpha-value>)",
        },
        "text-primary": {
          DEFAULT: "hsl(var(--text-primary) / <alpha-value>)",
          strong: "hsl(var(--text-primary-strong) / <alpha-value>)",
          stronger: "hsl(var(--text-primary-stronger) / <alpha-value>)",
          strongest: "hsl(var(--text-primary-strongest) / <alpha-value>)",
          weak: "hsl(var(--text-primary-weak) / <alpha-value>)",
        },
        "text-success": {
          DEFAULT: "hsl(var(--text-success) / <alpha-value>)",
        },
        "text-warning": {
          DEFAULT: "hsl(var(--text-warning) / <alpha-value>)",
          strong: "hsl(var(--text-warning-strong) / <alpha-value>)",
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
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05) / <alpha-value>)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) / <alpha-value>)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) / <alpha-value>)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05) / <alpha-value>)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) / <alpha-value>)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) / <alpha-value>)",
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
          to: { height: "hsl(var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "hsl(var(--radix-accordion-content-height)" },
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
