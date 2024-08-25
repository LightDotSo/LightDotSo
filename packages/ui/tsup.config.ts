import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  clean: true,
  dts: false,
  treeshake: true,
  splitting: true,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  external: ["react", "react-dom"],
  minify: isProduction,
  sourcemap: true,
});
