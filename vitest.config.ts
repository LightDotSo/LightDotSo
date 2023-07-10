import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePluginEvmts } from "@evmts/vite-plugin";

export default defineConfig({
  plugins: [tsconfigPaths(), vitePluginEvmts()],
  test: {
    include: ["contracts/test/spec/**/*.spec.ts"],
    setupFiles: ["contracts/test/spec/__test__/setup.ts"],
    coverage: {
      provider: "custom",
      customProviderModule: "vitest-solidity-coverage",
    },
  },
});
