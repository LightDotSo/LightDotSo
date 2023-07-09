import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePluginEvmts } from "@evmts/vite-plugin";

export default defineConfig({
  plugins: [tsconfigPaths(), vitePluginEvmts()],
  test: {
    include: ["contracts/spec/**/*.spec.ts"],
    coverage: {
      provider: "custom",
      customProviderModule: "vitest-solidity-coverage",
    },
  },
});
