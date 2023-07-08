import { createWalletClient, http } from "viem";
import { hardhat } from "viem/chains";

export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});
