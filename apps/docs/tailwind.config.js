import lightTailwindConfig from "@lightdotso/tailwindcss";
import { createPreset } from "fumadocs-ui/tailwind-plugin";

/** @type {import('tailwindcss').Config} */
export default {
  ...lightTailwindConfig,
  presets: [createPreset()],
};
