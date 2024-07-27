import { defineWorkspace } from "vitest/config";

// defineWorkspace provides a nice type hinting DX
// biome-ignore lint/style/noDefaultExport: <explanation>
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
      include: ["packages/sequence/src/**/*.spec.ts"],
      name: "sequence",
      environment: "node",
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      include: ["packages/client/test/**/*.spec.ts"],
      name: "client",
      environment: "node",
      testTimeout: 100_000,
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      include: ["packages/schemas/test/**/*.spec.ts"],
      name: "schemas",
      environment: "node",
      testTimeout: 100_000,
    },
  },
]);
