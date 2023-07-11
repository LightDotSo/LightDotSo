import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePluginEvmts } from "@evmts/vite-plugin";

export default defineConfig({
  plugins: [tsconfigPaths(), vitePluginEvmts()],
  test: {
    include: ["contracts/test/spec/**/*.spec.ts"],
    setupFiles: ["dotenv/config", "contracts/test/spec/__test__/setup.ts"],
    globalSetup: ["contracts/test/spec/__test__/globalSetup.ts"],
    environment: "node",
    testTimeout: 30_000,
    // coverage: {
    //   provider: "custom",
    //   customProviderModule: "vitest-solidity-coverage",
    // },
  },
});
