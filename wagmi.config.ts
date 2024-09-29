import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "packages/wagmi/src/generated.ts",
  plugins: [
    foundry({
      forge: {
        build: true,
      },
      include: [
        "EntryPointv0.6.0.sol/**",
        // "EntryPoint.sol/**",
        "LightDAG.sol/**",
        "LightPaymaster.sol/**",
        "LightTimelockController.sol/**",
        "LightTimelockControllerFactory.sol/**",
        // "LightVault.sol/**",
        // "LightVaultFactory.sol/**",
        "LightWallet.sol/**",
        "LightWalletFactory.sol/**",
      ],
      // artifacts: "out-wagmi/",
    }),
    react(),
  ],
});
