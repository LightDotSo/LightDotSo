import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["contracts/spec/**/*.spec.ts"],
    coverage: {
      provider: "custom",
      customProviderModule: "vitest-solidity-coverage",
    },
  },
});
