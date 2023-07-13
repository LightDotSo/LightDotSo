import { defineWorkspace } from "vitest/config";

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      include: ["contracts/test/spec/**/*.spec.ts"],
      setupFiles: ["dotenv/config", "contracts/test/spec/__test__/setup.ts"],
      globalSetup: ["contracts/test/spec/__test__/globalSetup.ts"],
      name: "contracts",
      environment: "node",
      testTimeout: 30_000,
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      include: ["packages/solutions/test/**/*.spec.ts"],
      name: "solutions",
      environment: "node",
    },
  },
]);
