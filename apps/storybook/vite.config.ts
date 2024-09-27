// import react from "@vitejs/plugin-react";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import env from "vite-plugin-env-compatible";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), env()],
});
