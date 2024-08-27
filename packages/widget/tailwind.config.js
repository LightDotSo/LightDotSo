/** @type {import('tailwindcss').Config} */
import defaultConfig from "@lightdotso/tailwindcss";

export default {
  ...defaultConfig,
  corePlugins: {
    preflight: false,
  },
  darkMode: ["class", 'html[class~="dark"]'],
};
