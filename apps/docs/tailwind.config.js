import lightTailwindConfig from "@lightdotso/tailwindcss";
import { createPreset } from "fumadocs-ui/tailwind-plugin";

/** @type {import('tailwindcss').Config} */
export default {
  ...lightTailwindConfig,
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./content/**/*.{md,mdx}",
    "./node_modules/fumadocs-ui/dist/**/*.js",
  ],
  presets: [createPreset()],
};
