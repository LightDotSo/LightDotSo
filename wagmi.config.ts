import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  // out: "apps/app/src/wagmi/index.ts",
  out: "packages/wagmi/src/generated.ts",
  plugins: [
    foundry({
      forge: {
        build: true,
      },
      include: [
        // "EntryPoint.sol/**",
        "LightDAG.sol/**",
        "LightPaymaster.sol/**",
        "LightTimelockController.sol/**",
        "LightTimelockControllerFactory.sol/**",
        "LightVault.sol/**",
        "LightVaultFactory.sol/**",
        "LightWallet.sol/**",
        "LightWalletFactory.sol/**",
      ],
      // artifacts: "out-wagmi/",
    }),
    react(),
  ],
});
