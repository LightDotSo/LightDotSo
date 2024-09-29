import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

// Initialize a Set to keep track of special cases that have been used
const specialCasesUsed = new Set();

export default defineConfig({
  out: "packages/wagmi/src/generated.ts",
  plugins: [
    foundry({
      forge: {
        build: false,
        clean: false,
        rebuild: false,
      },
      include: [
        "EntryPointv0.6.0.sol/EntryPointv060.json",
        "EntryPointv0.7.0.sol/EntryPointv070.json",
        "LightDAG.sol/**",
        "LightPaymaster.sol/**",
        "LightTimelockController.sol/**",
        "LightTimelockControllerFactory.sol/**",
        "LightVault.sol/**",
        "LightVaultFactory.sol/**",
        "LightWallet.sol/**",
        "LightWalletFactory.sol/**",
      ],
    }),
    react({
      getHookName({ contractName, itemName, type }) {
        // Capitalize only the first letter of type
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

        if (
          (itemName === "Name" || itemName === "Version") &&
          !specialCasesUsed.has(`${contractName}${itemName}`)
        ) {
          // Add the special case to the Set
          specialCasesUsed.add(`${contractName}${itemName}`);

          // Special handling for "Name" and "Version"
          itemName = itemName.toUpperCase();

          // Track the special case outside so that the subsequent itemName is not overwritten
          return `use${capitalizedType}${contractName}${itemName}`;
        }

        // Return the hook name
        return `use${capitalizedType}${contractName}${itemName ?? ""}`;
      },
    }),
  ],
});
