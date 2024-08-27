import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  clean: true,
  dts: true,
  treeshake: true,
  splitting: true,
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  external: ["react", "react-dom"],
  minify: isProduction,
  sourcemap: true,
});
